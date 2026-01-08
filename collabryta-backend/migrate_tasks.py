import sys
import os
sys.path.append(os.getcwd())

from sqlalchemy import text
from app.db.session import engine

def migrate():
    with engine.connect() as connection:
        print("Adding updated_at column to tasks table...")
        try:
            connection.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"))
            connection.commit()
            print("Successfully added updated_at column.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
