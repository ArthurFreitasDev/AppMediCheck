from sqlalchemy import Column, Integer, String

from database import Base


class Medicamento(Base):
    __tablename__ = "medicamento"

    id = Column(Integer, primary_key=True)
    nome = Column(String)
    dosagem = Column(Integer)

class Incompatibilidade(Base):
    __tablename__ = "incompatibilidade"

    id = Column(Integer, primary_key=True)
    numero = Column(Integer)