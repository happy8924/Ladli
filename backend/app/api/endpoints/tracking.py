from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models

router = APIRouter(tags=["tracking"])


@router.post("/track-visit", status_code=204)
def track_visit(db: Session = Depends(get_db)):
    """Public, unauthenticated. Records one visit for the admin dashboard's
    'Visitors' stat. No personal/identifying data is stored."""
    db.add(models.SiteVisit())
    db.commit()
    return
