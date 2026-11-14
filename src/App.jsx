import { useEffect, useState } from 'react'
import './App.css'
import AddIncompatibilitiesPage from './pages/AddIncompatibilitiesPage'
import AddMedicinesPage from './pages/AddMedicinesPage'
import TestCompatibilityPage from './pages/TestCompatibilityPage'

const pages = [
  {
    path: '/adicionar-remedios',
    title: 'Adicionar Remédios',
    Component: AddMedicinesPage,
  },
  {
    path: '/adicionar-incompatibilidades',
    title: 'Adicionar Incompatibilidades',
    Component: AddIncompatibilitiesPage,
  },
  {
    path: '/testar-compatibilidade',
    title: 'Testar Compatibilidade',
    Component: TestCompatibilityPage,
  },
]

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [authView, setAuthView] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const isSignup = authView === 'signup'

    try {
      const resposta = await fetch(isSignup ? '/api/usuarios' : '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isSignup ? { id: 0 } : {}),
          email: String(formData.get('email')).trim(),
          senha: String(formData.get('password')),
        }),
      })
      const resultado = await resposta.json()

      if (!resposta.ok) {
        setAuthError(
          typeof resultado.detail === 'string'
            ? resultado.detail
            : 'Não foi possível concluir. Confira os dados e tente novamente.',
        )
        return
      }

      form.reset()
      if (isSignup) {
        setAuthView('login')
        setAuthMessage('Conta criada. Entre com seu e-mail e senha.')
      } else {
        setIsAuthenticated(true)
      }
    } catch {
      setAuthError('Não foi possível conectar à API. Verifique se ela está em execução.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const PageComponent = currentPage?.Component

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
        <span className="topbar-label">
          {isAuthenticated ? 'Sua saúde, com mais cuidado' : 'Cuidado seguro começa aqui'}
        </span>
      </header>

      {!isAuthenticated ? (
        <section className="auth-layout" aria-labelledby="auth-title">
          <div className="auth-intro">
            <span className="eyebrow">CUIDADO MAIS SEGURO</span>
            <h1 id="auth-title">
              Suas informações de saúde, com mais cuidado.
            </h1>
            <p>
              Acesse o MediCheck para conferir compatibilidades e organizar
              informações sobre seus medicamentos.
            </p>
            <div className="auth-note">
              <span className="auth-note-icon" aria-hidden="true">+</span>
              <span>Decisões mais conscientes para cuidar de você.</span>
            </div>
          </div>

          <div className="auth-card">
            <span className="auth-card-eyebrow">
              {authView === 'login' ? 'BEM-VINDO DE VOLTA' : 'JUNTE-SE AO MEDICHECK'}
            </span>
            <h2>{authView === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}</h2>
            <p className="auth-description">
              {authView === 'login'
                ? 'Informe seus dados para continuar.'
                : 'Preencha seus dados para começar.'}
            </p>
            {authError && <p className="form-error" role="alert">{authError}</p>}
            {authMessage && <p className="auth-success" role="status">{authMessage}</p>}

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label className="field" htmlFor="auth-email">
                E-mail
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  required
                />
              </label>
              <label className="field" htmlFor="auth-password">
                Senha
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={authView === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Digite sua senha"
                  required
                />
              </label>
              <button className="auth-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Aguarde...'
                  : authView === 'login'
                    ? 'Entrar'
                    : 'Criar conta'}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className="auth-switch">
              {authView === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}
              <button
                type="button"
                onClick={() => {
                  setAuthView(authView === 'login' ? 'signup' : 'login')
                  setAuthError('')
                  setAuthMessage('')
                }}
              >
                {authView === 'login' ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
            <p className="auth-disclaimer">
              Os dados são enviados para a API do MediCheck.
            </p>
          </div>
        </section>
      ) : currentPage ? (
        <PageComponent onBack={goHome} />
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
