from sqlalchemy import Column, Integer, DateTime, String
from datetime import datetime
from app.db.database import Base


class SiteVisit(Base):
    __tablename__ = "site_visits"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), nullable=True)
    path = Column(String(255), nullable=True)
    visited_at = Column(DateTime, default=datetime.utcnow)
