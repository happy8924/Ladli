from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "ladli_store")

# Attempt MySQL connection string first
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Fallback to SQLite if MySQL is not available or explicitly requested
# In a real environment, we'd check connectivity, but here we can check an ENV var or catch the error during engine creation
try:
    # We use connect_args only for sqlite
    engine = create_engine(DATABASE_URL)
    # Test connection
    engine.connect().close()
    print("Database: Connected to MySQL")
except Exception as e:
    print(f"Database: MySQL connection failed ({e}). Falling back to SQLite...")
    DATABASE_URL = "sqlite:///./ladli_v2.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print("Database: Using SQLite locally at ./ladli_v2.db")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
