// frontend/src/pages/DashboardTrainer.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import RoutineBuilder from '../components/RoutineBuilder'
import RoutineViewer from '../components/RoutineViewer'
import './DashboardTrainer.css'

const DashboardTrainer = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showRoutineViewer, setShowRoutineViewer] = useState(false)
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false)
  const [routineMember, setRoutineMember] = useState(null)

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users?role=MEMBER')
      setMembers(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null
    const diff = new Date(endDate) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getExpiryStatus = (endDate) => {
    const days = getDaysUntilExpiry(endDate)
    if (days === null) return null
    if (days < 0) return 'expired'
    if (days <= 7) return 'warning'
    return 'ok'
  }

  const filteredMembers = members.filter(u =>
    `${u.firstName} ${u.lastName} ${u.dni || ''} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="tr-loading"><div className="tr-spinner" /></div>

  return (
    <div className="tr-root">
      <aside className="tr-sidebar">
        <div className="tr-logo">
          <span className="tr-logo-icon">⚡</span>
          <span className="tr-logo-text">GIM<strong>PRO</strong></span>
        </div>
        <nav className="tr-nav">
          <button className="tr-nav-item active"><span>👥</span> Mis Miembros</button>
        </nav>
        <div className="tr-sidebar-footer">
          <div className="tr-user-info">
            <div className="tr-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div>
              <div className="tr-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="tr-user-role">Entrenador</div>
            </div>
          </div>
          <button className="tr-logout" onClick={handleLogout}>Salir</button>
        </div>
      </aside>

      <main className="tr-main">
        <div className="tr-header">
          <div>
            <h1 className="tr-title">Mis Miembros</h1>
            <p className="tr-subtitle">{filteredMembers.length} miembros en el gimnasio</p>
          </div>
        </div>

        <div className="tr-search-bar">
          <span>🔍</span>
          <input
            placeholder="Buscar por nombre, DNI o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="tr-card">
          <table className="tr-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Plan</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Rutina</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 && (
                <tr><td colSpan={7} className="tr-empty">No se encontraron miembros</td></tr>
              )}
              {filteredMembers.map(u => {
                const expiryStatus = u.userPlan ? getExpiryStatus(u.userPlan.endDate) : null
                const days = u.userPlan ? getDaysUntilExpiry(u.userPlan.endDate) : null
                return (
                  <tr key={u.id} className={expiryStatus === 'expired' ? 'row-expired' : expiryStatus === 'warning' ? 'row-warning' : ''}>
                    <td>
                      <div className="tr-user-cell">
                        <div className="tr-avatar sm">{u.firstName[0]}{u.lastName[0]}</div>
                        <div>
                          <div className="tr-cell-name">{u.firstName} {u.lastName}</div>
                          <div className="tr-cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.dni || '—'}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.userPlan?.plan?.name || <span className="tr-no-plan">Sin plan</span>}</td>
                    <td>
                      {u.userPlan ? (
                        <div>
                          <span className={
                            expiryStatus === 'expired' ? 'tr-expired' :
                            expiryStatus === 'warning' ? 'tr-warning-date' : 'tr-active-date'
                          }>{formatDate(u.userPlan.endDate)}</span>
                          {expiryStatus === 'expired' && <div className="tr-expiry-note">Venció hace {Math.abs(days)} días</div>}
                          {expiryStatus === 'warning' && <div className="tr-expiry-note warning">Vence en {days} días</div>}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`tr-status ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        data-tooltip="Ver / Crear rutina"
                        className="tr-btn-routine"
                        onClick={() => { setRoutineMember(u); setShowRoutineViewer(true) }}
                      >
                        🏋️ Rutina
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {showRoutineViewer && routineMember && (
        <RoutineViewer
          member={routineMember}
          onClose={() => { setShowRoutineViewer(false); setRoutineMember(null) }}
          onEdit={() => { setShowRoutineViewer(false); setShowRoutineBuilder(true) }}
        />
      )}

      {showRoutineBuilder && routineMember && (
        <RoutineBuilder
          member={routineMember}
          onClose={() => { setShowRoutineBuilder(false); setRoutineMember(null) }}
          onSaved={() => fetchMembers()}
        />
      )}
    </div>
  )
}

export default DashboardTrainer
