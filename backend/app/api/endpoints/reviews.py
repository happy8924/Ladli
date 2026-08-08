from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.db.database import get_db
from app.models.models import Review, Product, User
from app.core.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_200_OK)
def create_or_update_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if product exists
    product = db.query(Product).filter(Product.id == review.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Check if user already reviewed this product -> update existing
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review.product_id
    ).first()
    
    if existing_review:
        existing_review.rating = review.rating
        existing_review.comment = review.comment
        db.commit()
        db.refresh(existing_review)
        return existing_review

    # Create new review
    db_review = Review(
        user_id=current_user.id,
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    return db_review

@router.get("/my")
def get_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    return [{
        "id": r.id,
        "product_id": r.product_id,
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at
    } for r in user_reviews]

@router.get("/recent")
def get_recent_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.created_at.desc()).limit(10).all()
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        product = db.query(Product).filter(Product.id == r.product_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "username": user.username if user else "Customer",
            "product_name": product.name if product else "Traditional Outfit",
            "product_id": r.product_id
        })
    return result

@router.get("/product/{product_id}")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    # Calculate average rating and count
    total_reviews = len(reviews)
    avg_rating = sum([r.rating for r in reviews]) / total_reviews if total_reviews > 0 else 0
    
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "username": user.username if user else "Customer"
        })
        
    return {
        "average_rating": round(avg_rating, 1),
        "total_reviews": total_reviews,
        "reviews": result
    }
