"""
Adds the new shipping-address & payment-method columns to your existing
'orders' table. Safe to run multiple times — skips columns that already exist.

Run this from your backend folder (where main.py lives):
    python migrate_add_shipping_fields.py
"""

from sqlalchemy import text
from app.db.database import engine

NEW_COLUMNS = [
    ("shipping_name", "VARCHAR(150)"),
    ("shipping_phone", "VARCHAR(20)"),
    ("shipping_address", "VARCHAR(300)"),
    ("shipping_city", "VARCHAR(100)"),
    ("shipping_state", "VARCHAR(100)"),
    ("shipping_pincode", "VARCHAR(10)"),
    ("payment_method", "VARCHAR(30) DEFAULT 'cod'"),
]

def run():
    with engine.connect() as conn:
        existing_cols = set()
        try:
            # SQLite
            result = conn.execute(text("PRAGMA table_info(orders)"))
            existing_cols = {row[1] for row in result}
        except Exception:
            # MySQL fallback
            result = conn.execute(text(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME = 'orders'"
            ))
            existing_cols = {row[0] for row in result}

        added = []
        for col_name, col_type in NEW_COLUMNS:
            if col_name in existing_cols:
                continue
            conn.execute(text(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}"))
            added.append(col_name)

        conn.commit()

    if added:
        print(f"Added columns: {', '.join(added)}")
    else:
        print("All columns already existed — nothing to add.")

if __name__ == "__main__":
    run()
