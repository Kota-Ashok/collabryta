from sqlalchemy import create_engine, text
import sys
import os

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.core.config import settings

def add_columns():
    print(f"Connecting to {settings.DATABASE_URL}")
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        columns = [
            ("role", "VARCHAR DEFAULT 'Team Member'"),
            ("avatar", "VARCHAR"),
            ("phone", "VARCHAR"),
            ("address", "VARCHAR"),
            ("bio", "VARCHAR")
        ]
        
        for col_name, col_type in columns:
            try:
                print(f"Adding column {col_name}...")
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                conn.commit()
                print(f"Added column {col_name}")
            except Exception as e:
                # If error contains "already exists", specifically ignore
                err_str = str(e).lower()
                if "already exists" in err_str or "duplicate column" in err_str:
                     print(f"Column {col_name} already exists.")
                else:
                    print(f"Error adding {col_name}: {e}")
                
if __name__ == "__main__":
    add_columns()
