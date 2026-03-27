"""
Initialize Database - Create all tables
Run this once to set up the schema
"""

from core.database import Base, engine

# Import all models so they're registered with Base
from models.user import User
from models.message import Message
from models.room import Room
from models.message_translation import MessageTranslation
from models.membership import Membership

def init_db():
    """Create all tables in the database"""
    print("Creating database tables...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database initialized successfully!")
        print("\nTables created:")
        from sqlalchemy import inspect
        inspector = inspect(engine)
        for table_name in inspector.get_table_names():
            print(f"  ✓ {table_name}")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    init_db()
