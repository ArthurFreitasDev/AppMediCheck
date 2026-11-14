import hashlib
import hmac
import secrets

from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError

from database import Base, Session, engine
from models import Incompatibilidade, Medicamento, Usuario


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

class UsuarioPayload(BaseModel):
    id: int
    email: str
    senha: str

class LoginPayload(BaseModel):
    email: str
    senha: str





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

@app.post("/usuarios", status_code=status.HTTP_201_CREATED)
def AdicionarUsuario(payload: UsuarioPayload):
    with Session() as db:
        usuario_existente = db.query(Usuario).filter(
            Usuario.email == payload.email
        ).first()
        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este e-mail já está cadastrado.",
            )

        usuario = Usuario(
            email=payload.email,
            senha=payload.senha
        )
        db.add(usuario)
        try:
            db.commit()
            db.refresh(usuario)
        except IntegrityError as error:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este e-mail já está cadastrado.",
            ) from error

        return {"id": usuario.id, "email": usuario.email}

@app.post("/login")
def login(payload: LoginPayload):
    with Session() as db:
        usuario = db.query(Usuario).filter(
            Usuario.email == payload.email,
            Usuario.senha == payload.senha
        ).first()

        if not usuario:
            raise HTTPException(
                status_code=401,
                detail="E-mail ou senha incorretos"
            )

        return {"mensagem": "Login realizado", "email": usuario.email}

@app.post("/incompatibilidades/consultar")
def consultar_incompatibilidade(payload: TesteCompatibilidadePayload):
    ids = sorted(payload.medicamentos_ids)
    numero = int("".join(str(id) for id in ids))

    with Session() as db:
        encontradas = db.query(Incompatibilidade).filter(
            Incompatibilidade.numero == numero
        ).all()

        return {"incompatibilidades": encontradas}