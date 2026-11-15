import { useEffect, useState } from 'react'

const API_URL = '/api'

function AddIncompatibilitiesPage({ onBack }) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState([])
  const [incompatibilidades, setIncompatibilidades] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroBusca, setErroBusca] = useState('')
  const [erroCadastro, setErroCadastro] = useState('')
  const [erroLista, setErroLista] = useState('')
  const [sucessoCadastro, setSucessoCadastro] = useState('')

  useEffect(() => {
    async function carregarIncompatibilidades() {
      try {
        const resposta = await fetch(`${API_URL}/incompatibilidades`)
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar as incompatibilidades cadastradas.')
        }
        setIncompatibilidades(await resposta.json())
      } catch {
        setErroLista('Não foi possível carregar as incompatibilidades. Verifique a conexão com a API.')
      }
    }

    carregarIncompatibilidades()
  }, [])

  useEffect(() => {
    const nome = busca.trim()

    if (!nome) {
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      setBuscando(true)
      setErroBusca('')

      try {
        const resposta = await fetch(
          `${API_URL}/medicamentos/buscar?nome=${encodeURIComponent(nome)}`,
          { signal: controller.signal },
        )

        if (!resposta.ok) {
          throw new Error('A busca de medicamentos falhou.')
        }

        setResultados(await resposta.json())
      } catch (error) {
        if (error.name !== 'AbortError') {
          setResultados([])
          setErroBusca('Não foi possível buscar medicamentos. Verifique a conexão com a API.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setBuscando(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [busca])

  function selecionarMedicamento(medicamento) {
    setMedicamentosSelecionados((selecionados) => (
      selecionados.some((item) => item.id === medicamento.id)
        ? selecionados
        : [...selecionados, medicamento]
    ))
    setSucessoCadastro('')
    setErroCadastro('')
  }

  function removerMedicamento(id) {
    setMedicamentosSelecionados((selecionados) => (
      selecionados.filter((medicamento) => medicamento.id !== id)
    ))
  }

  async function adicionarIncompatibilidade() {
    setErroCadastro('')
    setSucessoCadastro('')

    const idsOrdenados = medicamentosSelecionados
      .map((medicamento) => medicamento.id)
      .sort((a, b) => a - b)
    const identificador = idsOrdenados.join('')
    const numero = Number(identificador)

    if (idsOrdenados.length < 2) {
      setErroCadastro('Selecione pelo menos dois medicamentos.')
      return
    }

    if (!Number.isSafeInteger(numero)) {
      setErroCadastro(
        'O identificador formado é grande demais para ser enviado com segurança à API atual.',
      )
      return
    }

    setSalvando(true)

    try {
      const resposta = await fetch(`${API_URL}/incompatibilidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 0,
          numero,
          medicamentos_ids: idsOrdenados,
        }),
      })

      const resultado = await resposta.json()
      if (!resposta.ok) {
        throw new Error(resultado.detail || 'Não foi possível cadastrar a incompatibilidade.')
      }

      setIncompatibilidades((atuais) => [
        ...atuais,
        {
          ...resultado,
          id: resultado.id ?? numero,
          numero: resultado.numero ?? numero,
          medicamentos: [...medicamentosSelecionados],
        },
      ])
      setMedicamentosSelecionados([])
      setBusca('')
      setResultados([])
      setSucessoCadastro(`Incompatibilidade cadastrada com o identificador ${identificador}.`)
    } catch (error) {
      setErroCadastro(error.message || 'Não foi possível conectar à API.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="destination" aria-labelledby="page-title">
      <span className="eyebrow">MEDICHECK</span>
      <h1 id="page-title">Adicionar Incompatibilidades</h1>
      <p>Registre combinações de medicamentos que devem ser evitadas.</p>

      <div className="page-content">
        <section className="page-panel" aria-labelledby="incompatibility-form-title">
          <h2 id="incompatibility-form-title">Nova incompatibilidade</h2>
          <label className="field" htmlFor="medicine-search">
            Nome do medicamento
            <input
              id="medicine-search"
              type="search"
              name="medicine-search"
              placeholder="Digite o nome do medicamento"
              autoComplete="off"
              value={busca}
              onChange={(event) => {
                const valor = event.target.value
                setBusca(valor)
                if (!valor.trim()) {
                  setResultados([])
                  setErroBusca('')
                  setBuscando(false)
                }
              }}
            />
          </label>

          {buscando && <p className="suggestion-empty">Buscando medicamentos...</p>}
          {erroBusca && <p className="form-error" role="alert">{erroBusca}</p>}
          {!buscando && !erroBusca && busca.trim() && resultados.length === 0 && (
            <p className="suggestion-empty">Nenhum medicamento encontrado.</p>
          )}
          {resultados.length > 0 && (
            <ul className="medicine-suggestions">
              {resultados.map((medicamento) => (
                <li key={medicamento.id}>
                  <button
                    className="medicine-suggestion"
                    type="button"
                    onClick={() => selecionarMedicamento(medicamento)}
                    disabled={medicamentosSelecionados.some((item) => item.id === medicamento.id)}
                  >
                    <span>{medicamento.nome} (ID {medicamento.id})</span>
                    <span className="medicine-dosage">{medicamento.dosagem}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="selection-title">Medicamentos selecionados</h3>
          {medicamentosSelecionados.length > 0 ? (
            <ul className="selected-medicines">
              {medicamentosSelecionados.map((medicamento) => (
                <li key={medicamento.id}>
                  <span>{medicamento.nome} (ID {medicamento.id}) — {medicamento.dosagem}</span>
                  <button
                    className="remove-medicine"
                    type="button"
                    onClick={() => removerMedicamento(medicamento.id)}
                    aria-label={`Remover ${medicamento.nome}`}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum medicamento selecionado.</p>
          )}
          {erroCadastro && <p className="form-error" role="alert">{erroCadastro}</p>}
          {sucessoCadastro && <p role="status">{sucessoCadastro}</p>}
          <button
            className="submit-button"
            type="button"
            onClick={adicionarIncompatibilidade}
            disabled={salvando || medicamentosSelecionados.length < 2}
          >
            {salvando ? 'Salvando...' : 'Adicionar incompatibilidade'}
          </button>
        </section>

        <section className="page-panel" aria-labelledby="incompatibility-list-title">
          <h2 id="incompatibility-list-title">Incompatibilidades registradas</h2>
          {erroLista && <p className="form-error" role="alert">{erroLista}</p>}
          {incompatibilidades.length > 0 ? (
            <ul className="medicine-list">
              {incompatibilidades.map((incompatibilidade) => (
                <li key={incompatibilidade.id}>
                  <span>
                    {incompatibilidade.medicamentos?.length
                      ? incompatibilidade.medicamentos.map((medicamento) => (
                        `${medicamento.nome} (ID ${medicamento.id})`
                      )).join(', ')
                      : 'Combinação cadastrada'}
                  </span>
                  <span>ID: {incompatibilidade.numero}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Não há incompatibilidades cadastradas.</p>
          )}
        </section>
      </div>

      <button className="back-button" type="button" onClick={onBack}>
        Voltar ao início
      </button>
    </section>
  )
}

export default AddIncompatibilitiesPage
