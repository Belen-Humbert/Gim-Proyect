// frontend/src/pages/DashboardTrainer.jsx
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DashboardTrainer = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Panel Entrenador 💪</h1>
      <p>Bienvenido, {user?.firstName} {user?.lastName}</p>
      <button onClick={handleLogout} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default DashboardTrainer
