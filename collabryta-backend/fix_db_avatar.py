from sqlalchemy import create_engine, text
import sys
import os

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.config import settings

def update_db():
    print(f"Connecting to {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        try:
            print("Altering avatar column to TEXT...")
            conn.execute(text("ALTER TABLE users ALTER COLUMN avatar TYPE TEXT;"))
            conn.commit()
            print("Successfully altered avatar column.")
        except Exception as e:
            print(f"Error altering column: {e}")

if __name__ == "__main__":
    update_db()
