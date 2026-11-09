from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query, status

from database import Base, Session, engine
from models import Medicamento, Incompatibilidade


app = FastAPI()

Base.metadata.create_all(engine)


class MedicamentosPayload(BaseModel):
    id: int
    nome: str
    dosagem: str

class IncompatibilidadePayload(BaseModel):
    id: int
    numero: int

class TesteCompatibilidadePayload(BaseModel):
    medicamentos_ids: list[int]


@app.get("/medicamentos", status_code=status.HTTP_200_OK)
def listar_medicamentos():
    db = Session()
    medicamentos = db.query(Medicamento).all()
    db.close()

    return medicamentos

@app.post("/medicamentos", status_code=status.HTTP_201_CREATED)
def adicionarMedicamento(playload: MedicamentosPayload):
    with Session() as db:
        medicamento = Medicamento(
            nome=playload.nome,
            dosagem=playload.dosagem,
        )
        db.add(medicamento)
        db.commit()
        db.refresh(medicamento)
        return medicamento

@app.get("/medicamentos/buscar", status_code=status.HTTP_200_OK)
def buscarMedicamento(nome: str = Query(min_length=1)):
    with Session() as db:
        return(
            db.query(Medicamento).filter(Medicamento.nome.like(f"%{nome}")).all()
        )

@app.post("/incompatibilidades", status_code=status.HTTP_201_CREATED)
def adicionarIncompatibilidade(payload: IncompatibilidadePayload):
    with Session() as db:
        medicamento = Incompatibilidade(
            numero=payload.numero
        )
        db.add(medicamento)
        db.commit()
        db.refresh(medicamento)
        return medicamento

@app.post("/incompatibilidades/consultar")
def consultar_incompatibilidade(payload: TesteCompatibilidadePayload):
    ids = sorted(payload.medicamentos_ids)
    numero = int("".join(str(id) for id in ids))

    with Session() as db:
        encontradas = db.query(Incompatibilidade).filter(
            Incompatibilidade.numero == numero
        ).all()

        return {"incompatibilidades": encontradas}