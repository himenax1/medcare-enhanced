from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


SQLALCHEMY_DATABASE_URL = "postgresql://postgres:admin@localhost:5432/medcare"

engine = create_engine(SQLALCHEMY_DATABASE_URL)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from datetime import datetime
from zoneinfo import ZoneInfo

def get_lanka_time():
    """ලංකාවේ නිවැරදි දේශීය වෙලාව (Asia/Colombo) ලබා දෙයි"""
    return datetime.now(ZoneInfo("Asia/Colombo"))