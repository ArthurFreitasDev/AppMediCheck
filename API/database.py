from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine("sqlite:///API/medCheck.db")

Session = sessionmaker(bind=engine)

Base = declarative_base()