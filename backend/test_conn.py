import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print(f"Original URL: {db_url}")

# Try with encoded password if it contains #
if db_url and "#" in db_url:
    # This is a bit hacky, but let's try to extract parts and re-assemble
    # Or just replace # with %23
    db_url_encoded = db_url.replace("#", "%23")
    print(f"Encoded URL: {db_url_encoded}")
    engine = create_engine(db_url_encoded)
else:
    engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Connection successful!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
