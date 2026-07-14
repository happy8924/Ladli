from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List
from collections import defaultdict
from datetime import datetime, timedelta
import calendar

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import auth

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=schemas.AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    """Dashboard stats — sirf admin."""
    total_sales = (
        db.query(func.sum(models.Order.total_price))
        .filter(models.Order.status != "cancelled")
        .scalar() or 0
    )
    order_count = db.query(models.Order).count()
    product_count = db.query(models.Product).count()
    user_count = db.query(models.User).count()

    return {
        "total_sales": total_sales,
        "order_count": order_count,
        "product_count": product_count,
        "user_count": user_count,
    }


@router.get("/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    """Dashboard analytics — sales graph, monthly revenue, top products/categories."""

    total_visitors = db.query(models.SiteVisit).count()

    orders = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.items)
            .joinedload(models.OrderItem.product)
            .joinedload(models.Product.category)
        )
        .filter(models.Order.status != "cancelled")
        .all()
    )

    # ---- Sales graph: last 14 days ----
    today = datetime.utcnow().date()
    day_list = [today - timedelta(days=i) for i in range(13, -1, -1)]
    daily = {d: {"revenue": 0.0, "orders": 0} for d in day_list}
    for o in orders:
        d = o.created_at.date()
        if d in daily:
            daily[d]["revenue"] += o.total_price
            daily[d]["orders"] += 1
    sales_graph = [
        {"date": d.strftime("%d %b"), "revenue": round(v["revenue"], 2), "orders": v["orders"]}
        for d, v in daily.items()
    ]

    # ---- Monthly revenue: last 6 months ----
    first_of_month = today.replace(day=1)
    month_keys = []
    y, m = first_of_month.year, first_of_month.month
    for _ in range(6):
        month_keys.append((y, m))
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    month_keys.reverse()
    monthly = {ym: 0.0 for ym in month_keys}
    for o in orders:
        ym = (o.created_at.year, o.created_at.month)
        if ym in monthly:
            monthly[ym] += o.total_price
    monthly_revenue = [
        {"month": f"{calendar.month_abbr[m]} {y}", "revenue": round(v, 2)}
        for (y, m), v in monthly.items()
    ]

    # ---- Top products & categories (by revenue) ----
    product_stats = defaultdict(lambda: {"quantity": 0, "revenue": 0.0})
    category_stats = defaultdict(float)
    for o in orders:
        for item in o.items:
            if not item.product:
                continue
            item_revenue = item.quantity * (item.price_at_order or 0)
            product_stats[item.product.name]["quantity"] += item.quantity
            product_stats[item.product.name]["revenue"] += item_revenue
            cat_name = item.product.category.name if item.product.category else "Uncategorized"
            category_stats[cat_name] += item_revenue

    top_products = sorted(
        [{"name": k, "quantity_sold": v["quantity"], "revenue": round(v["revenue"], 2)} for k, v in product_stats.items()],
        key=lambda x: x["revenue"], reverse=True
    )[:5]

    top_categories = sorted(
        [{"name": k, "revenue": round(v, 2)} for k, v in category_stats.items()],
        key=lambda x: x["revenue"], reverse=True
    )[:5]

    return {
        "total_visitors": total_visitors,
        "sales_graph": sales_graph,
        "monthly_revenue": monthly_revenue,
        "top_products": top_products,
        "top_categories": top_categories,
    }


# ✅ /admin/orders AUR /admin/orders/{id}/status REMOVE kar diye —
#    yeh dono ab /api/orders/all aur /api/orders/{id}/status se handle hote hain.
#    Frontend ko sirf URL update karna hai (niche dekho).


@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    """Saare users — sirf admin."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(
    user_id: int,
    role_update: schemas.RoleUpdate,  # ✅ dict ki jagah Pydantic schema
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_current_admin)
):
    """User ka role change — sirf admin. Apna role nahi badal sakta."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id and role_update.role != "admin":
        raise HTTPException(
            status_code=400,
            detail="Cannot change your own admin role"
        )

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user