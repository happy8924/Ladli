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
        orm_mode = True

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if product exists
    product = db.query(Product).filter(Product.id == review.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Validate rating
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Check if user already reviewed this product
    existing_review = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.product_id == review.product_id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

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

@router.get("/product/{product_id}")
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    # Also calculate average rating and count
    total_reviews = len(reviews)
    avg_rating = sum([r.rating for r in reviews]) / total_reviews if total_reviews > 0 else 0
    
    # Return custom dict to easily include user info
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "username": user.username if user else "Anonymous"
        })
        
    return {
        "average_rating": round(avg_rating, 1),
        "total_reviews": total_reviews,
        "reviews": result
    }
