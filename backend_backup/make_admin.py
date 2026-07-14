"""
make_admin.py
=============
Yeh script kisi bhi existing user ko 'admin' role de deta hai.

USAGE:
    cd D:\\ladli\\backend
    python make_admin.py YOUR_USERNAME

Example:
    python make_admin.py sohel
"""

import sys
from app.db.database import SessionLocal
from app.models import models

def make_admin(username):
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.username == username).first()

    if not user:
        print(f"❌ User '{username}' nahi mila. Yeh users database mein hain:")
        all_users = db.query(models.User).all()
        for u in all_users:
            print(f"   - {u.username} (role: {u.role})")
        db.close()
        return

    old_role = user.role
    user.role = "admin"
    db.commit()
    print(f"✅ '{username}' ka role '{old_role}' se 'admin' kar diya gaya!")
    print("Ab browser mein logout karke dobara login karo.")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py YOUR_USERNAME")
        print("\nSaare users dekhne ke liye:")
        db = SessionLocal()
        all_users = db.query(models.User).all()
        if not all_users:
            print("   (Koi user nahi mila — pehle register karo)")
        for u in all_users:
            print(f"   - {u.username} (role: {u.role})")
        db.close()
        sys.exit(1)

    make_admin(sys.argv[1])
