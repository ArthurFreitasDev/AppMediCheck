import { useEffect, useState } from 'react'

const API_URL = '/api'

function TestCompatibilityPage({ onBack }) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState([])
  const [medicamentosSelecionados, setMedicamentosSelecionados] = useState([])
  const [incompatibilidades, setIncompatibilidades] = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [testando, setTestando] = useState(false)
  const [erroBusca, setErroBusca] = useState('')
  const [erroTeste, setErroTeste] = useState('')

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
    setIncompatibilidades(null)
    setErroTeste('')
    setBusca('')
    setResultados([])
  }

  function removerMedicamento(id) {
    setMedicamentosSelecionados((selecionados) => (
      selecionados.filter((medicamento) => medicamento.id !== id)
    ))
    setIncompatibilidades(null)
    setErroTeste('')
  }

  async function testarCompatibilidade() {
    setErroTeste('')
    setIncompatibilidades(null)

    const medicamentosIds = medicamentosSelecionados
      .map((medicamento) => medicamento.id)
      .sort((a, b) => a - b)

    setTestando(true)

    try {
      const resposta = await fetch(`${API_URL}/incompatibilidades/consultar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicamentos_ids: medicamentosIds }),
      })

      const resultado = await resposta.json()
      if (!resposta.ok) {
        throw new Error(resultado.detail || 'Não foi possível testar a compatibilidade.')
      }

      setIncompatibilidades(resultado.incompatibilidades)
    } catch (error) {
      setErroTeste(error.message || 'Não foi possível conectar à API.')
    } finally {
      setTestando(false)
    }
  }

  return (
    <section className="destination" aria-labelledby="page-title">
      <span className="eyebrow">MEDICHECK</span>
      <h1 id="page-title">Testar Compatibilidade</h1>
      <p>Confira se os medicamentos informados correspondem a alguma incompatibilidade cadastrada.</p>

      <div className="page-content">
        <section className="page-panel" aria-labelledby="compatibility-form-title">
          <h2 id="compatibility-form-title">Medicamentos para testar</h2>
          <label className="field" htmlFor="medicine-to-test">
            Nome do medicamento
            <input
              id="medicine-to-test"
              type="search"
              name="medicine-to-test"
              placeholder="Digite o nome do medicamento"
              autoComplete="off"
              value={busca}
              onChange={(event) => {
                setBusca(event.target.value)
                setResultados([])
                setErroBusca('')
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

          {erroTeste && <p className="form-error" role="alert">{erroTeste}</p>}
          <button
            className="submit-button"
            type="button"
            onClick={testarCompatibilidade}
            disabled={testando || medicamentosSelecionados.length < 2}
          >
            {testando ? 'Testando...' : 'Testar compatibilidade'}
          </button>
        </section>

        <section className="page-panel" aria-labelledby="compatibility-result-title">
          <h2 id="compatibility-result-title">Resultado</h2>
          {incompatibilidades === null ? (
            <p>O resultado da consulta aparecerá aqui.</p>
          ) : incompatibilidades.length > 0 ? (
            <>
              <p role="alert">
                {incompatibilidades.length === 1
                  ? 'Foi encontrada uma incompatibilidade cadastrada:'
                  : `Foram encontradas ${incompatibilidades.length} incompatibilidades cadastradas:`}
              </p>
              <ul className="medicine-list">
                {incompatibilidades.map((incompatibilidade) => (
                  <li key={incompatibilidade.id}>
                    <span>Medicamentos selecionados</span>
                    <span>ID: {incompatibilidade.numero}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p role="status">Nenhuma incompatibilidade cadastrada foi encontrada para os medicamentos selecionados.</p>
          )}
          <p className="page-note">
            Esta consulta considera apenas as incompatibilidades cadastradas no MediCheck e não
            substitui a orientação de um profissional de saúde.
          </p>
        </section>
      </div>

      <button className="back-button" type="button" onClick={onBack}>
        Voltar ao início
      </button>
    </section>
  )
}

export default TestCompatibilityPage
