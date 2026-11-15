import hashlib
import hmac
import secrets

from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError

from database import Base, Session, engine
from models import Incompatibilidade, IncompatibilidadeMedicamento, Medicamento, Usuario


app = FastAPI()

Base.metadata.create_all(engine)


class MedicamentosPayload(BaseModel):
    id: int
    nome: str
    dosagem: str

class IncompatibilidadePayload(BaseModel):
    id: int
    numero: int
    medicamentos_ids: list[int] = Field(default_factory=list)

class TesteCompatibilidadePayload(BaseModel):
    medicamentos_ids: list[int] = Field(min_length=1)

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
            db.query(Medicamento).filter(Medicamento.nome.ilike(f"%{nome}%")).all()
        )

@app.post("/incompatibilidades", status_code=status.HTTP_201_CREATED)
def adicionarIncompatibilidade(payload: IncompatibilidadePayload):
    with Session() as db:
        incompatibilidade = Incompatibilidade(
            numero=payload.numero
        )
        db.add(incompatibilidade)
        db.commit()
        db.refresh(incompatibilidade)

        for medicamento_id in sorted(set(payload.medicamentos_ids)):
            db.add(
                IncompatibilidadeMedicamento(
                    incompatibilidade_id=incompatibilidade.id,
                    medicamento_id=medicamento_id,
                )
            )
        db.commit()
        return incompatibilidade

@app.get("/incompatibilidades", status_code=status.HTTP_200_OK)
def listar_incompatibilidades():
    with Session() as db:
        incompatibilidades = db.query(Incompatibilidade).all()
        associacoes = db.query(IncompatibilidadeMedicamento).all()
        medicamentos = {
            medicamento.id: medicamento
            for medicamento in db.query(Medicamento).all()
        }

        medicamentos_por_incompatibilidade = {}
        for associacao in associacoes:
            medicamento = medicamentos.get(associacao.medicamento_id)
            if medicamento is not None:
                medicamentos_por_incompatibilidade.setdefault(
                    associacao.incompatibilidade_id, []
                ).append({
                    "id": medicamento.id,
                    "nome": medicamento.nome,
                    "dosagem": medicamento.dosagem,
                })

        return [
            {
                "id": incompatibilidade.id,
                "numero": incompatibilidade.numero,
                "medicamentos": medicamentos_por_incompatibilidade.get(
                    incompatibilidade.id, []
                ),
            }
            for incompatibilidade in incompatibilidades
        ]

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