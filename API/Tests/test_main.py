from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_cadastro_e_login():
    email = "teste@example.com"
    senha = "senha-de-teste"

    cadastro = client.post(
        "/usuarios",
        json={"id": 0, "email": email, "senha": senha},
    )
    assert cadastro.status_code == 201

    login = client.post(
        "/login",
        json={"email": email, "senha": senha},
    )
    assert login.status_code == 200
    assert login.json()["email"] == email


def test_login_com_senha_incorreta():
    resposta = client.post(
        "/login",
        json={"email": "naoexiste@example.com", "senha": "senha-errada"},
    )
    assert resposta.status_code == 401
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import main
from database import Base


@pytest.fixture
def client(tmp_path, monkeypatch):
    test_engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}")
    TestSession = sessionmaker(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    monkeypatch.setattr(main, "Session", TestSession)

    with TestClient(main.app) as test_client:
        yield test_client

    test_engine.dispose()


def test_cadastrar_e_listar_medicamento(client):
    resposta = client.post(
        "/medicamentos",
        json={"id": 0, "nome": "Paracetamol", "dosagem": "500 mg"},
    )

    assert resposta.status_code == 201
    medicamento = resposta.json()
    assert medicamento["id"] > 0
    assert medicamento["nome"] == "Paracetamol"
    assert medicamento["dosagem"] == "500 mg"

    lista = client.get("/medicamentos")
    assert lista.status_code == 200
    assert any(item["id"] == medicamento["id"] for item in lista.json())


def test_buscar_medicamento_por_nome(client):
    client.post(
        "/medicamentos",
        json={"id": 0, "nome": "Paracetamol", "dosagem": "500 mg"},
    )

    resposta = client.get("/medicamentos/buscar", params={"nome": "mol"})

    assert resposta.status_code == 200
    assert [item["nome"] for item in resposta.json()] == ["Paracetamol"]


def test_buscar_medicamento_por_prefixo(client):
    client.post(
        "/medicamentos",
        json={"id": 0, "nome": "Dipirona", "dosagem": "500 mg"},
    )

    resposta = client.get("/medicamentos/buscar", params={"nome": "dipi"})

    assert resposta.status_code == 200
    assert [item["nome"] for item in resposta.json()] == ["Dipirona"]


def test_consultar_incompatibilidade_independente_da_ordem_dos_ids(client):
    medicamentos = []
    for nome in ("Medicamento A", "Medicamento B"):
        resposta = client.post(
            "/medicamentos",
            json={"id": 0, "nome": nome, "dosagem": "10 mg"},
        )
        assert resposta.status_code == 201
        medicamentos.append(resposta.json())

    ids = [medicamento["id"] for medicamento in medicamentos]
    numero = int("".join(str(id) for id in sorted(ids)))
    cadastro = client.post(
        "/incompatibilidades",
        json={"id": 0, "numero": numero, "medicamentos_ids": ids},
    )
    assert cadastro.status_code == 201

    consulta = client.post(
        "/incompatibilidades/consultar",
        json={"medicamentos_ids": list(reversed(ids))},
    )

    assert consulta.status_code == 200
    incompatibilidades = consulta.json()["incompatibilidades"]
    assert len(incompatibilidades) == 1
    assert incompatibilidades[0]["numero"] == numero


def test_consultar_combinacao_sem_incompatibilidade(client):
    resposta = client.post(
        "/incompatibilidades/consultar",
        json={"medicamentos_ids": [1, 2]},
    )

    assert resposta.status_code == 200
    assert resposta.json() == {"incompatibilidades": []}


def test_listar_incompatibilidades_cadastradas_com_medicamentos(client):
    medicamentos = []
    for nome in ("Dipirona", "Paracetamol"):
        resposta = client.post(
            "/medicamentos",
            json={"id": 0, "nome": nome, "dosagem": "500 mg"},
        )
        assert resposta.status_code == 201
        medicamentos.append(resposta.json())

    ids = [medicamento["id"] for medicamento in medicamentos]
    cadastro = client.post(
        "/incompatibilidades",
        json={
            "id": 0,
            "numero": int("".join(str(id) for id in sorted(ids))),
            "medicamentos_ids": ids,
        },
    )
    assert cadastro.status_code == 201

    resposta = client.get("/incompatibilidades")

    assert resposta.status_code == 200
    incompatibilidades = resposta.json()
    assert len(incompatibilidades) == 1
    assert incompatibilidades[0]["numero"] == int(
        "".join(str(id) for id in sorted(ids))
    )
    assert incompatibilidades[0]["medicamentos"] == [
        {
            "id": medicamento["id"],
            "nome": medicamento["nome"],
            "dosagem": medicamento["dosagem"],
        }
        for medicamento in medicamentos
    ]


def test_consultar_sem_ids_retorna_erro_de_validacao(client):
    resposta = client.post(
        "/incompatibilidades/consultar",
        json={"medicamentos_ids": []},
    )

    assert resposta.status_code == 422


def test_consultar_ids_12_e_3_nao_encontra_numero_123(client):
    cadastro = client.post(
        "/incompatibilidades",
        json={"id": 0, "numero": 123, "medicamentos_ids": [1, 2, 3]},
    )
    assert cadastro.status_code == 201

    consulta = client.post(
        "/incompatibilidades/consultar",
        json={"medicamentos_ids": [12, 3]},
    )

    assert consulta.status_code == 200
    assert consulta.json() == {"incompatibilidades": []}


def test_cadastro_e_login(client):
    email = "teste@example.com"
    senha = "senha-de-teste"

    cadastro = client.post(
        "/usuarios",
        json={"id": 0, "email": email, "senha": senha},
    )
    assert cadastro.status_code == 201

    login = client.post(
        "/login",
        json={"email": email, "senha": senha},
    )
    assert login.status_code == 200
    assert login.json()["email"] == email


def test_login_com_senha_incorreta(client):
    resposta = client.post(
        "/login",
        json={"email": "naoexiste@example.com", "senha": "senha-errada"},
    )
    assert resposta.status_code == 401


def test_consultar_1_e_23_nao_encontra_combinacao_1_2_3(client):
    client.post(
        "/incompatibilidades",
        json={"id": 0, "numero": 123, "medicamentos_ids": [1, 2, 3]},
    )
    consulta = client.post(
        "/incompatibilidades/consultar",
        json={"medicamentos_ids": [1, 23]},
    )

    assert consulta.json() == {"incompatibilidades": []}