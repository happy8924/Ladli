from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import auth

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_price = 0
    items_to_create = []

    for item in order_data.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {product.name}. Available: {product.stock}, Requested: {item.quantity}"
            )

        item_total = product.price * item.quantity
        total_price += item_total

        order_item = models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_order=product.price,
            selected_size=getattr(item, "selected_size", "M")
        )
        items_to_create.append(order_item)
        product.stock -= item.quantity

    new_order = models.Order(
        user_id=current_user.id,
        total_price=total_price,
        status="pending",
        shipping_name=order_data.shipping_name,
        shipping_phone=order_data.shipping_phone,
        shipping_address=order_data.shipping_address,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_pincode=order_data.shipping_pincode,
        payment_method=order_data.payment_method,
    )
    db.add(new_order)
    db.flush()

    for item in items_to_create:
        item.order_id = new_order.id
        db.add(item)

    db.commit()
    db.refresh(new_order)
    return new_order


@router.get("/my", response_model=List[schemas.OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Logged-in user ke apne orders."""
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items)
            .joinedload(models.OrderItem.product)
            .joinedload(models.Product.category)
        )
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[schemas.OrderOut])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Saare orders — sirf admin aur logistics dekh sakte hain.
    ✅ admin.py ka /admin/orders yahan merge ho gaya.
    """
    if current_user.role not in ["admin", "logistics"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view all orders"
        )
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items)
            .joinedload(models.OrderItem.product)
            .joinedload(models.Product.category)
        )
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Ek order detail — user sirf apna dekh sakta hai, admin/logistics koi bhi."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role == "user" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    status_update: schemas.StatusUpdate,  # ✅ dict ki jagah Pydantic schema
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Order status update — sirf admin aur logistics kar sakte hain.
    ✅ admin.py ka /admin/orders/{id}/status yahan merge ho gaya.
    """
    if current_user.role not in ["admin", "logistics"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update order status"
        )

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if status_update.status is not None:
        order.status = status_update.status
    if status_update.tracking_id is not None:
        order.tracking_id = status_update.tracking_id
    if status_update.estimated_delivery is not None:
        order.estimated_delivery = status_update.estimated_delivery

    db.commit()
    db.refresh(order)
    return order