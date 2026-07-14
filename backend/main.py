from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.db.database import engine, Base

# ✅ Import ALL models so Base knows about every table
from app.models import models  # noqa: F401 — registers all tables

from app.api.endpoints import auth, products, categories, orders, users, admin, wishlist, reviews, payments, tracking

# ✅ Auto-create ALL tables (wishlists, reviews, etc.) if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ladli Store API",
    description="Production-ready E-commerce API with FastAPI",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

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

# Include Routers
app.include_router(auth.router,       prefix="/api")
app.include_router(products.router,   prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(orders.router,     prefix="/api")
app.include_router(users.router,      prefix="/api")
app.include_router(admin.router,      prefix="/api")
app.include_router(wishlist.router,   prefix="/api")
app.include_router(reviews.router,    prefix="/api")
app.include_router(payments.router,   prefix="/api")
app.include_router(tracking.router,   prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Ladli Store API",
        "docs": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)