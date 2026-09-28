import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Database path
DATA_DIR = BASE_DIR / "backend" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'aether.db'}")
VECTOR_STORE_PATH = os.getenv("VECTOR_STORE_PATH", str(DATA_DIR / "vector_store.json"))

IS_DEMO_AI_MODE = not bool(GEMINI_API_KEY)
