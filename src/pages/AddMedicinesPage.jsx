// Importa os hooks do React usados para guardar dados e executar ações quando a tela é montada.
import { useEffect, useState } from 'react'

// Endereço base da API; os caminhos dos endpoints são adicionados a esta URL.
const API_URL = '/api'

// Componente da tela de cadastro e listagem de medicamentos.
// onBack é a função recebida do componente pai para voltar à página inicial.
function AddMedicinesPage({ onBack }) {
  // Guarda o texto digitado no campo de nome do medicamento.
  const [nome, setNome] = useState('')
  // Guarda o texto digitado no campo de dosagem.
  const [dosagem, setDosagem] = useState('')
  // Guarda os medicamentos recebidos da API e os cadastrados nesta tela.
  const [medicamentos, setMedicamentos] = useState([])
  // Guarda a mensagem de erro que será exibida na tela; string vazia significa sem erro.
  const [erro, setErro] = useState('')
  // Indica que a lista inicial ainda está sendo carregada da API.
  const [carregando, setCarregando] = useState(true)
  // Indica que o envio do formulário está em andamento.
  const [salvando, setSalvando] = useState(false)

  // Executa o carregamento inicial quando o componente aparece na tela.
  useEffect(() => {
    // Consulta a API para obter os medicamentos já cadastrados.
    async function carregarMedicamentos() {
      try {
        // Faz uma requisição GET ao endpoint de listagem.
        const resposta = await fetch(`${API_URL}/medicamentos`)
        // Transforma respostas HTTP de erro em uma exceção para exibir a mensagem abaixo.
        if (!resposta.ok) {
          throw new Error('Não foi possível carregar os medicamentos.')
        }
        // Converte a resposta JSON e atualiza o estado da lista.
        setMedicamentos(await resposta.json())
      } catch {
        // Informa que não foi possível carregar os dados, por erro HTTP ou de conexão.
        setErro('Não foi possível carregar os medicamentos. Verifique a conexão com a API.')
      } finally {
        // Finaliza o estado de carregamento mesmo se a requisição falhar.
        setCarregando(false)
      }
    }

    // Inicia a consulta assim que a tela é montada.
    carregarMedicamentos()
    // A lista vazia faz este efeito ocorrer apenas na montagem do componente.
  }, [])

  // Trata o envio do formulário e cadastra um medicamento na API.
  async function adicionarMedicamento(event) {
    // Impede o comportamento padrão do formulário, que recarregaria a página.
    event.preventDefault()
    // Limpa qualquer erro anterior antes de tentar enviar novamente.
    setErro('')
    // Atualiza a interface para indicar que o cadastro está sendo processado.
    setSalvando(true)
    
    try {
      // Envia os campos ao endpoint de cadastro usando o método POST.
      const resposta = await fetch(`${API_URL}/medicamentos`, {
        // Indica que o corpo da requisição está formatado como JSON.
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // A API atual exige "id" no payload, embora gere o ID salvo pelo banco.
        // trim() remove espaços no começo e no fim dos valores digitados.
        body: JSON.stringify({ id: 0, nome: nome.trim(), dosagem: dosagem.trim() }),
      })

      // Se o servidor responder com erro, exibe uma mensagem em vez de tratar como sucesso.
      if (!resposta.ok) {
        throw new Error('Não foi possível cadastrar o medicamento.')
      }

      // Converte o medicamento criado pela API de JSON para objeto JavaScript.
      const medicamentoSalvo = await resposta.json()
      // Acrescenta o registro recém-criado à lista sem apagar os itens existentes.
      setMedicamentos((listaAtual) => [...listaAtual, medicamentoSalvo])
      // Limpa os campos depois que o cadastro foi concluído.
      setNome('')
      setDosagem('')
    } catch (error) {
      // Exibe o erro recebido ou uma mensagem padrão caso não haja uma descrição.
      setErro(error.message || 'Não foi possível conectar à API.')
    } finally {
      // Reabilita o botão e encerra o estado de envio mesmo em caso de falha.
      setSalvando(false)
    }
  }

  // JSX que descreve o conteúdo visual da página.
  return (
    // Área principal da tela; aria-labelledby relaciona a região ao título da página.
    <section className="destination" aria-labelledby="page-title">
      {/* Identificação visual do produto. */}
      <span className="eyebrow">MEDICHECK</span>
      {/* Título principal, referenciado pelo aria-labelledby acima. */}
      <h1 id="page-title">Adicionar Remédios</h1>
      {/* Texto introdutório da página. */}
      <p>Cadastre e organize os medicamentos que você utiliza.</p>

      {/* Agrupa os painéis de formulário e lista. */}
      <div className="page-content">
        {/* Painel que contém o formulário de cadastro. */}
        <section className="page-panel" aria-labelledby="medicine-form-title">
          {/* Título acessível do painel. */}
          <h2 id="medicine-form-title">Dados do medicamento</h2>
          {/* Ao enviar, chama a função que envia os dados à API. */}
          <form onSubmit={adicionarMedicamento}>
            {/* Rótulo associado ao campo de nome pelo atributo htmlFor. */}
            <label className="field" htmlFor="medicine-name">
              Nome do medicamento
              {/* Campo de texto controlado pelo estado nome; required exige preenchimento. */}
              <input
                id="medicine-name"
                type="text"
                name="medicine-name"
                placeholder="Ex.: nome do medicamento"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />
            </label>
            {/* Rótulo e campo para informar a dosagem. */}
            <label className="field" htmlFor="medicine-dose">
              Dosagem
              {/* Campo de texto controlado pelo estado dosagem; required exige preenchimento. */}
              <input
                id="medicine-dose"
                type="text"
                name="medicine-dose"
                placeholder="Ex.: 500 mg"
                value={dosagem}
                onChange={(event) => setDosagem(event.target.value)}
                required
              />
            </label>
            {/* O tipo submit envia o formulário; disabled evita envios simultâneos. */}
            <button className="submit-button" type="submit" disabled={salvando}>
              {/* Alterna o texto do botão durante o envio. */}
              {salvando ? 'Salvando...' : 'Adicionar medicamento'}
            </button>
          </form>
          {/* Mostra a mensagem de erro somente quando houver uma. role="alert" anuncia o erro. */}
          {erro && <p className="form-error" role="alert">{erro}</p>}
        </section>

        {/* Painel com os medicamentos que vieram da API ou foram cadastrados. */}
        <section className="page-panel" aria-labelledby="medicine-list-title">
          <h2 id="medicine-list-title">Seus medicamentos</h2>
          {/* Exibe um indicador enquanto a consulta inicial não terminou. */}
          {carregando ? (
            <p>Carregando medicamentos...</p>
          // Se a lista não estiver vazia, cria uma linha para cada medicamento.
          ) : medicamentos.length > 0 ? (
            <ul className="medicine-list">
              {/* map() percorre a lista e gera um elemento de interface por registro. */}
              {medicamentos.map((medicamento) => (
                // A chave única ajuda o React a identificar cada linha da lista.
                <li key={medicamento.id}>
                  {/* Exibe o nome armazenado no objeto retornado pela API. */}
                  <span>{medicamento.nome}</span>
                  {/* Exibe a dosagem armazenada no objeto retornado pela API. */}
                  <span>{medicamento.dosagem}</span>
                </li>
              ))}
            </ul>
          ) : (
            // Mensagem exibida quando o carregamento terminou e não há registros.
            <p>Nenhum medicamento cadastrado.</p>
          )}
        </section>
      </div>

      {/* Botão que chama a navegação fornecida pelo componente pai. */}
      <button className="back-button" type="button" onClick={onBack}>
        Voltar ao início
      </button>
    </section>
  )
}

// Permite que outros arquivos importem e exibam este componente.
export default AddMedicinesPage
