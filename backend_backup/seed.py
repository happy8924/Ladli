from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models import models
import os

# Create tables
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Clear existing data for fresh seed
    db.query(models.OrderItem).delete()
    db.query(models.Order).delete()
    db.query(models.Product).delete()
    db.query(models.Category).delete()
    
    # Add Category
    cat_traditional = models.Category(name="Traditional Wear", description="Authentic Ethnic Collections")
    db.add(cat_traditional)
    db.flush()
    
    # Add Products
    products = [
        models.Product(
            name="Royal Maroon Mirror-Work Chaniya Choli",
            description="Luxury heritage Chaniya Choli with intricate hand-embroidery, zari highlights, and premium mirror work. Perfect for festive celebrations.",
            price=8500.0,
            stock=15,
            category_id=cat_traditional.id,
            image_url="/images/choli1.png",
            fabric="Pure Gaji Silk",
            sizes="S,M,L,XL"
        ),
        models.Product(
            name="Emerald & Navy Designer Lehenga Choli",
            description="Contemporary designer Chaniya Choli featuring traditional motifs in deep navys and vibrant emerald greens. Comes with a matching dupatta.",
            price=7200.0,
            stock=10,
            category_id=cat_traditional.id,
            image_url="/images/choli2.png",
            fabric="Banarasi Silk",
            sizes="M,L,XL,2XL"
        )
    ]
    
    for p in products:
        db.add(p)
    
    db.commit()
    db.close()
    print("Database Seeded Successfully with Chaniya Choli Products!")

if __name__ == "__main__":
    seed_db()
