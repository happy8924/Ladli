"""
reset_password.py
==================
Yeh script 2 kaam karta hai:

1. Saare users aur unke exact username/email list karta hai
   (taaki aap sahi combination dekh sako)

2. Kisi bhi user ka password DIRECTLY reset kar deta hai
   (Forgot Password form ke bina, seedha database mein)

USAGE:
------
Step 1 -- Pehle saare users dekho:
    cd D:\\ladli\\backend
    python reset_password.py

Step 2 -- Kisi specific user ka password reset karo:
    python reset_password.py USERNAME NAYA_PASSWORD

Example:
    python reset_password.py admin MyNewPass123
"""

import sys
from app.db.database import SessionLocal
from app.models import models
from app.core.auth import get_password_hash


def list_users(db):
    users = db.query(models.User).all()
    if not users:
        print("Database mein koi user nahi mila. Pehle Register karo.")
        return
    print(f"\nTotal {len(users)} users mile:\n")
    print(f"{'Username':<20} {'Email':<35} {'Role':<10}")
    print("-" * 65)
    for u in users:
        print(f"{u.username:<20} {u.email:<35} {u.role:<10}")
    print()


def reset_password(db, username, new_password):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        print(f"Username '{username}' nahi mila. Neeche exact list dekho:")
        list_users(db)
        return

    if len(new_password) < 6:
        print("Password kam se kam 6 characters ka hona chahiye.")
        return

    user.hashed_password = get_password_hash(new_password)
    db.commit()
    print(f"\n'{username}' ka password successfully reset ho gaya!")
    print(f"   Naya password: {new_password}")
    print(f"   Ab is username aur naye password se login karo.\n")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        if len(sys.argv) == 1:
            list_users(db)
            print("Password reset karne ke liye:")
            print("   python reset_password.py USERNAME NAYA_PASSWORD\n")
        elif len(sys.argv) == 3:
            reset_password(db, sys.argv[1], sys.argv[2])
        else:
            print("Usage: python reset_password.py USERNAME NAYA_PASSWORD")
    finally:
        db.close()
