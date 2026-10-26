function AddIncompatibilitiesPage({ onBack }) {
  return (
    <section className="destination" aria-labelledby="page-title">
      <span className="eyebrow">MEDICHECK</span>
      <h1 id="page-title">Adicionar Incompatibilidades</h1>
      <p>Registre combinações de medicamentos que devem ser evitadas.</p>

      <div className="page-content">
        <section className="page-panel" aria-labelledby="incompatibility-form-title">
          <h2 id="incompatibility-form-title">Nova incompatibilidade</h2>
          <label className="field">
            Primeiro medicamento
            <input type="text" name="first-medicine" placeholder="Nome do medicamento" />
          </label>
          <label className="field">
            Segundo medicamento
            <input type="text" name="second-medicine" placeholder="Nome do medicamento" />
          </label>
        </section>

        <section className="page-panel" aria-labelledby="incompatibility-list-title">
          <h2 id="incompatibility-list-title">Incompatibilidades registradas</h2>
          <p>As combinações registradas aparecerão aqui.</p>
        </section>
      </div>

      <button className="back-button" type="button" onClick={onBack}>
        Voltar ao início
      </button>
    </section>
  )
}

export default AddIncompatibilitiesPage
