from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import auth

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.post("/", response_model=schemas.CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    existing = db.query(models.Category).filter(models.Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_category = models.Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    category_update: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if new name conflicts with existing category
    existing = db.query(models.Category).filter(
        models.Category.name == category_update.name,
        models.Category.id != category_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    for key, value in category_update.model_dump().items():
        setattr(category, key, value)
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has products
    product_count = db.query(models.Product).filter(models.Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category with {product_count} products. Please reassign or delete products first."
        )
    
    db.delete(category)
    db.commit()
    return None