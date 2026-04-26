// frontend/src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)

      const redirects = {
        SUPER_ADMIN: '/admin',
        TRAINER: '/trainer',
        MEMBER: '/member',
      }
      navigate(redirects[user.role] || '/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="login-bg-text">PUSH<br/>YOUR<br/>LIMITS</div>
      </div>

      <div className="login-panel">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <span className="login-logo-name">GIM<strong>PRO</strong></span>
        </div>

        <h1 className="login-title">Bienvenido</h1>
        <p className="login-subtitle">Ingresá a tu plataforma</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'INGRESAR'}
          </button>
        </form>

        <p className="login-footer">
          ¿Problemas para ingresar? Contactá al administrador.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
