from sqlalchemy import Column, ForeignKey, Integer, String

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

class IncompatibilidadeMedicamento(Base):
    __tablename__ = "incompatibilidade_medicamento"

    incompatibilidade_id = Column(
        Integer, ForeignKey("incompatibilidade.id"), primary_key=True
    )
    medicamento_id = Column(
        Integer, ForeignKey("medicamento.id"), primary_key=True
    )

class Usuario(Base):
    __tablename__ = "usuario"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    senha = Column(String)