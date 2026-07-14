import os
import razorpay
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import auth

router = APIRouter(prefix="/payments", tags=["payments"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")


def get_razorpay_client():
    """Lazily create the Razorpay client. Raises a clean 500 (instead of
    crashing the whole backend at import time) if keys aren't configured."""
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
        )
    return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


@router.post("/checkout", response_model=schemas.CheckoutResponse)
def create_checkout(
    payload: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Create a Razorpay order for the cart. Amount is computed on the
    server from real product prices — never trust a client-supplied amount."""
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    for item in payload.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"'{product.name}' has insufficient stock")
        total += product.price * item.quantity

    amount_paise = int(round(total * 100))
    if amount_paise <= 0:
        raise HTTPException(status_code=400, detail="Invalid order amount")

    client = get_razorpay_client()
    try:
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
        })
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Razorpay error: {exc}")

    return schemas.CheckoutResponse(
        razorpay_order_id=razorpay_order["id"],
        amount=amount_paise,
        currency="INR",
        key_id=RAZORPAY_KEY_ID,
    )


@router.post("/verify-and-place-order", response_model=schemas.OrderOut)
def verify_and_place_order(
    payload: schemas.VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Verify the Razorpay payment signature, then create the order.
    The order is only created if the signature checks out — this is what
    stops someone from faking a 'successful payment' from the browser."""
    client = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed. Please try again.")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = 0.0
    order_items = []
    for item in payload.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"'{product.name}' has insufficient stock")
        total_price += product.price * item.quantity
        order_items.append(models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_order=product.price,
            selected_size=getattr(item, "selected_size", "M"),
        ))
        product.stock -= item.quantity

    new_order = models.Order(
        user_id=current_user.id,
        total_price=total_price,
        status="pending",
        shipping_name=payload.shipping_name,
        shipping_phone=payload.shipping_phone,
        shipping_address=payload.shipping_address,
        shipping_city=payload.shipping_city,
        shipping_state=payload.shipping_state,
        shipping_pincode=payload.shipping_pincode,
        payment_method="online",
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
    )
    db.add(new_order)
    db.flush()

    for item in order_items:
        item.order_id = new_order.id
        db.add(item)

    db.commit()
    db.refresh(new_order)
    return new_order