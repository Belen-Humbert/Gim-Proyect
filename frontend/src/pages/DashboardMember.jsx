// frontend/src/pages/DashboardMember.jsx
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DashboardMember = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Mi Panel 🏋️</h1>
      <p>Bienvenido, {user?.firstName} {user?.lastName}</p>
      <button onClick={handleLogout} style={{ marginTop: 20, padding: '10px 20px', cursor: 'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default DashboardMember
