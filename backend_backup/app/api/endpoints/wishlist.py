from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import Wishlist, Product, User
from app.core.auth import get_current_user
from app.schemas.schemas import WishlistResponse, WishlistCreate

router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[WishlistResponse])
def get_user_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all wishlist items for the current user.
    """
    wishlist_items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    return wishlist_items

@router.post("/", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    item: WishlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a product to the user's wishlist.
    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    existing_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == item.product_id
    ).first()
    
    if existing_item:
        raise HTTPException(status_code=400, detail="Product already in wishlist")

    new_item = Wishlist(
        user_id=current_user.id,
        product_id=item.product_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Remove a product from the user's wishlist.
    """
    wishlist_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()

    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Product not found in wishlist")

    db.delete(wishlist_item)
    db.commit()
    return None
