import { useEffect, useState } from 'react'
import './App.css'

const pages = [
  {
    path: '/adicionar-remedios',
    title: 'Adicionar Remédios',
    description: 'Cadastre e organize os medicamentos que você utiliza.',
  },
  {
    path: '/adicionar-incompatibilidades',
    title: 'Adicionar Incompatibilidades',
    description: 'Registre combinações de medicamentos que devem ser evitadas.',
  },
  {
    path: '/testar-compatibilidade',
    title: 'Testar Compatibilidade',
    description: 'Confira se os medicamentos cadastrados podem ser usados juntos.',
  },
]

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const currentPage = pages.find((page) => page.path === currentPath)

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.title = currentPage ? `${currentPage.title} | MediCheck` : 'MediCheck'
  }, [currentPage])

  function navigate(path) {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  function goHome() {
    window.history.pushState({}, '', '/')
    setCurrentPath('/')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" onClick={(event) => {
          event.preventDefault()
          goHome()
        }}>
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>MediCheck</span>
        </a>
        <span className="topbar-label">Sua saúde, com mais cuidado</span>
      </header>

      {currentPage ? (
        <section className="destination" aria-labelledby="page-title">
          <span className="eyebrow">MEDICHECK</span>
          <h1 id="page-title">{currentPage.title}</h1>
          <p>{currentPage.description}</p>
          <button className="back-button" type="button" onClick={goHome}>
            Voltar ao início
          </button>
        </section>
      ) : (
        <section className="dashboard" aria-labelledby="welcome-title">
          <div className="welcome">
            <span className="eyebrow">BEM-VINDO AO MEDICHECK</span>
            <h1 id="welcome-title">Cuidado mais simples,<br />decisões mais seguras.</h1>
            <p>Escolha o que você deseja fazer:</p>
          </div>

          <nav className="actions" aria-label="Ações do MediCheck">
            {pages.map((page, index) => (
              <button
                className="action-card"
                key={page.path}
                type="button"
                onClick={() => navigate(page.path)}
              >
                <span className="action-number">0{index + 1}</span>
                <span className="action-title">{page.title}</span>
                <span className="action-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </nav>

          <p className="disclaimer">
            O MediCheck é um apoio informativo e não substitui a orientação de um profissional de saúde.
          </p>
        </section>
      )}
    </main>
  )
}

export default App
