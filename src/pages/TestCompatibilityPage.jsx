function TestCompatibilityPage({ onBack }) {
  return (
    <section className="destination" aria-labelledby="page-title">
      <span className="eyebrow">MEDICHECK</span>
      <h1 id="page-title">Testar Compatibilidade</h1>
      <p>Confira se os medicamentos cadastrados podem ser usados juntos.</p>

      <div className="page-content">
        <section className="page-panel" aria-labelledby="compatibility-form-title">
          <h2 id="compatibility-form-title">Medicamentos para consultar</h2>
          <label className="field">
            Primeiro medicamento
            <input type="text" name="first-medicine" placeholder="Nome do medicamento" />
          </label>
          <label className="field">
            Segundo medicamento
            <input type="text" name="second-medicine" placeholder="Nome do medicamento" />
          </label>
        </section>

        <section className="page-panel" aria-labelledby="compatibility-result-title">
          <h2 id="compatibility-result-title">Resultado</h2>
          <p>A consulta de compatibilidade ainda não está conectada a uma fonte de dados.</p>
          <p className="page-note">
            Não use esta tela para decidir se uma combinação de medicamentos é segura. Consulte um
            profissional de saúde.
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
