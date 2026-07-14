"""
Adds razorpay_order_id and razorpay_payment_id columns to the existing
'orders' table, needed for online payment tracking. Safe to run multiple
times — skips columns that already exist.

Run this from your backend folder (where main.py lives):
    python migrate_add_razorpay_fields.py
"""

from sqlalchemy import text
from app.db.database import engine

NEW_COLUMNS = [
    ("razorpay_order_id", "VARCHAR(100)"),
    ("razorpay_payment_id", "VARCHAR(100)"),
]

def run():
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(orders)"))
            existing_cols = {row[1] for row in result}
        except Exception:
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
