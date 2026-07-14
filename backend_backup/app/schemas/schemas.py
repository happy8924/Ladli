from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import List, Optional
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    LOGISTICS = "logistics"
    USER = "user"


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: int
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category_id: int
    image_url: Optional[str] = None
    fabric: Optional[str] = None
    sizes: str = "S,M,L,XL,2XL"


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int
    created_at: datetime
    category: Optional[CategoryOut] = None
    model_config = ConfigDict(from_attributes=True)

# Wishlist Schemas
class WishlistBase(BaseModel):
    product_id: int

class WishlistCreate(WishlistBase):
    pass

class WishlistResponse(WishlistBase):
    id: int
    user_id: int
    created_at: datetime
    product: Optional[ProductOut] = None
    model_config = ConfigDict(from_attributes=True)


# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    selected_size: Optional[str] = "M"


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_order: float
    selected_size: Optional[str] = None
    product: Optional[ProductOut] = None
    model_config = ConfigDict(from_attributes=True)


class CheckoutItem(BaseModel):
    product_id: int
    quantity: int


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]


class CheckoutResponse(BaseModel):
    razorpay_order_id: str
    amount: int  # in paise
    currency: str
    key_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    items: List[OrderItemBase]
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str


class OrderBase(BaseModel):
    total_price: float
    status: str = "pending"
    tracking_id: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    shipping_name: Optional[str] = None
    shipping_phone: Optional[str] = None
    shipping_address: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_state: Optional[str] = None
    shipping_pincode: Optional[str] = None
    payment_method: Optional[str] = "cod"


class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    shipping_name: str
    shipping_phone: str
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    payment_method: str = "cod"

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v):
        if v not in ("cod", "online"):
            raise ValueError("payment_method must be 'cod' or 'online'")
        return v


class OrderOut(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut]
    model_config = ConfigDict(from_attributes=True)


# ✅ NEW: Proper Pydantic schema for status update (replaces raw dict)
VALID_ORDER_STATUSES = ["pending", "processing", "packaging", "shipped", "delivered", "cancelled"]

class StatusUpdate(BaseModel):
    status: Optional[str] = None
    tracking_id: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_ORDER_STATUSES:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(VALID_ORDER_STATUSES)}")
        return v


# ✅ NEW: Proper Pydantic schema for role update (replaces raw dict)
VALID_ROLES = ["admin", "logistics", "user"]

class RoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in VALID_ROLES:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")
        return v


# Analytics Schemas
class AdminStats(BaseModel):
    total_sales: float
    order_count: int
    product_count: int
    user_count: int


class ForgotPasswordRequest(BaseModel):
    """Step 1: Username + Email diya, verify karo ki match karta hai"""
    username: str
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Step 2: Verify hone ke baad naya password set karo"""
    username: str
    email: EmailStr
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v