function AddMedicinesPage({ onBack }) {
  return (
    <section className="destination" aria-labelledby="page-title">
      <span className="eyebrow">MEDICHECK</span>
      <h1 id="page-title">Adicionar Remédios</h1>
      <p>Cadastre e organize os medicamentos que você utiliza.</p>

      <div className="page-content">
        <section className="page-panel" aria-labelledby="medicine-form-title">
          <h2 id="medicine-form-title">Dados do medicamento</h2>
          <label className="field">
            Nome do medicamento
            <input type="text" name="medicine-name" placeholder="Ex.: nome do medicamento" />
          </label>
          <label className="field">
            Dosagem
            <input type="text" name="medicine-dose" placeholder="Ex.: 500 mg" />
          </label>
        </section>

        <section className="page-panel" aria-labelledby="medicine-list-title">
          <h2 id="medicine-list-title">Seus medicamentos</h2>
          <p>A lista de medicamentos cadastrados aparecerá aqui.</p>
        </section>
      </div>

      <button className="back-button" type="button" onClick={onBack}>
        Voltar ao início
      </button>
    </section>
  )
}

export default AddMedicinesPage
