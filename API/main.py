from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

from database import Base, Session, engine
from models import Medicamento, Incompatibilidade


app = FastAPI()

Base.metadata.create_all(engine)


class MedicamentosPayload(BaseModel):
    id: int
    nome: str
    dosagen: str

class IncompatibilidadePayload(BaseModel):
    id: int
    numero: int


@app.get("/medicamentos", status_code=status.HTTP_200_OK)
def listar_medicamentos():
    db = Session()
    medicamentos = db.query(Medicamento).all()
    db.close()

    return medicamentos