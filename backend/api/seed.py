from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.db import get_db
from backend.utils.seeder import seed_database

router = APIRouter(prefix="/api/seed", tags=["Seed"])

@router.post("/demo-data")
async def trigger_seed(force: bool = False, db: Session = Depends(get_db)):
    count = await seed_database(db=db, force=force)
    return {
        "message": f"Successfully initialized {count} feedback records with persistent memory and emerging issue trends.",
        "record_count": count
    }
