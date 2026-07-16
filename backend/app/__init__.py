from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .config.settings import settings
from .db.database import engine, Base
from .models import User, Category, Product, Order, OrderItem, Wishlist, Review, SiteVisit, OrderStatus  # noqa: F401  # ensure tables are registered

# Import routers
from .api.endpoints import auth, products, categories, orders, users, admin, wishlist, reviews, payments, tracking

# Auto-create tables if they don't exist (for dev only)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ladli Store API",
    description="Production-ready E-commerce API with FastAPI",
    version="1.0.0",
)

# CORS configuration using settings
origins = [origin.strip() for origin in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded product images
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(tracking.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Ladli Store API",
        "docs": "/docs",
        "status": "online",
    }
