from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import auth  # ✅ BUG FIX: auth import add kiya

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

# =========================
# UPLOAD PRODUCT IMAGE (Admin only)
# =========================
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".bmp", ".tif", ".tiff", ".svg", ".avif",
    ".heic", ".heif",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    admin: models.User = Depends(auth.get_current_admin)
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{ext or 'unknown'}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 10MB")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return {"url": f"http://127.0.0.1:8000/static/uploads/{filename}"}

# =========================
# GET ALL PRODUCTS (Public)
# =========================
@router.get("/", response_model=List[schemas.ProductOut])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Product)

    if category_id:
        query = query.filter(
            models.Product.category_id == category_id
        )

    return query.offset(skip).limit(limit).all()


# =========================
# GET SINGLE PRODUCT (Public)
# =========================
@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# =========================
# CREATE PRODUCT (Admin only)
# ✅ BUG FIX: Pehle koi bhi product create kar sakta tha — ab sirf admin
# =========================
@router.post(
    "/",
    response_model=schemas.ProductOut,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)  # ✅ FIXED
):
    # Check category exists
    category = (
        db.query(models.Category)
        .filter(models.Category.id == product.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Category not found"
        )

    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# =========================
# UPDATE PRODUCT (Admin only)
# ✅ BUG FIX: Pehle koi bhi product update kar sakta tha — ab sirf admin
# =========================
@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product_update: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)  # ✅ FIXED
):
    db_product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not db_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    category = (
        db.query(models.Category)
        .filter(models.Category.id == product_update.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Category not found"
        )

    for key, value in product_update.model_dump().items():
        setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)

    return db_product


# =========================
# DELETE PRODUCT (Admin only)
# ✅ BUG FIX: Pehle koi bhi product delete kar sakta tha — ab sirf admin
# =========================
@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin)  # ✅ FIXED
):
    db_product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not db_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(db_product)
    db.commit()

    return None