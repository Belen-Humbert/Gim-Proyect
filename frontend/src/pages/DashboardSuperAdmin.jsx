// frontend/src/pages/DashboardSuperAdmin.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './DashboardSuperAdmin.css'

const DashboardSuperAdmin = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', dni: '', phone: '', email: '', password: '', role: 'MEMBER' })
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [planForm, setPlanForm] = useState({ planId: '', startDate: '' })
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState('')

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ id: '', firstName: '', lastName: '', dni: '', phone: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [usersRes, plansRes] = await Promise.all([api.get('/users'), api.get('/plans')])
      setUsers(usersRes.data.data)
      setPlans(plansRes.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  const handleCreate = async (e) => {
    e.preventDefault(); setCreateError(''); setCreateLoading(true)
    try {
      await api.post('/auth/register', createForm)
      setShowCreateModal(false)
      setCreateForm({ firstName: '', lastName: '', dni: '', phone: '', email: '', password: '', role: 'MEMBER' })
      fetchData()
    } catch (err) { setCreateError(err.response?.data?.message || 'Error al crear usuario') }
    finally { setCreateLoading(false) }
  }

  const handleEdit = async (e) => {
    e.preventDefault(); setEditError(''); setEditLoading(true)
    try {
      await api.patch(`/users/${editForm.id}`, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        dni: editForm.dni,
        phone: editForm.phone,
      })
      setShowEditModal(false)
      fetchData()
    } catch (err) { setEditError(err.response?.data?.message || 'Error al actualizar usuario') }
    finally { setEditLoading(false) }
  }

  const toggleActive = async (u) => {
    try { await api.patch(`/users/${u.id}`, { isActive: !u.isActive }); fetchData() }
    catch (err) { console.error(err) }
  }

  const handleAssignPlan = async (e) => {
    e.preventDefault(); setPlanError(''); setPlanLoading(true)
    try {
      await api.post(`/users/${selectedUser.id}/plan`, { planId: planForm.planId, startDate: planForm.startDate, paidAt: new Date().toISOString() })
      setShowPlanModal(false); setPlanForm({ planId: '', startDate: '' }); fetchData()
    } catch (err) { setPlanError(err.response?.data?.message || 'Error al asignar plan') }
    finally { setPlanLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault(); setResetLoading(true)
    try {
      await api.patch(`/auth/reset-password/${resetUser.id}`, { newPassword })
      setShowResetModal(false); setNewPassword('')
      alert(`Contraseña actualizada para ${resetUser.firstName}`)
    } catch (err) { alert(err.response?.data?.message || 'Error al resetear contraseña') }
    finally { setResetLoading(false) }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const members = users.filter(u => u.role === 'MEMBER')
  const trainers = users.filter(u => u.role === 'TRAINER')

  if (loading) return <div className="sa-loading"><div className="sa-spinner" /></div>

  return (
    <div className="sa-root">
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <span className="sa-logo-icon">⚡</span>
          <span className="sa-logo-text">GIM<strong>PRO</strong></span>
        </div>
        <nav className="sa-nav">
          <button className={`sa-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <span>👥</span> Miembros
          </button>
          <button className={`sa-nav-item ${activeTab === 'trainers' ? 'active' : ''}`} onClick={() => setActiveTab('trainers')}>
            <span>💪</span> Entrenadores
          </button>
        </nav>
        <div className="sa-sidebar-footer">
          <div className="sa-user-info">
            <div className="sa-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div>
              <div className="sa-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="sa-user-role">Super Admin</div>
            </div>
          </div>
          <button className="sa-logout" onClick={handleLogout}>Salir</button>
        </div>
      </aside>

      <main className="sa-main">
        <div className="sa-header">
          <div>
            <h1 className="sa-title">{activeTab === 'users' ? 'Miembros' : 'Entrenadores'}</h1>
            <p className="sa-subtitle">{activeTab === 'users' ? `${members.length} miembros registrados` : `${trainers.length} entrenadores registrados`}</p>
          </div>
          <button className="sa-btn-primary" onClick={() => setShowCreateModal(true)}>+ Nuevo usuario</button>
        </div>

        {activeTab === 'users' && (
          <div className="sa-card">
            <table className="sa-table">
              <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Plan</th><th>Último pago</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {members.length === 0 && <tr><td colSpan={8} className="sa-empty">No hay miembros registrados</td></tr>}
                {members.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="sa-user-cell">
                        <div className="sa-avatar sm">{u.firstName[0]}{u.lastName[0]}</div>
                        <div><div className="sa-cell-name">{u.firstName} {u.lastName}</div><div className="sa-cell-email">{u.email}</div></div>
                      </div>
                    </td>
                    <td>{u.dni || '—'}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.userPlan?.plan?.name || <span className="sa-no-plan">Sin plan</span>}</td>
                    <td>{formatDate(u.userPlan?.paidAt)}</td>
                    <td>
                      {u.userPlan
                        ? <span className={new Date(u.userPlan.endDate) < new Date() ? 'sa-expired' : 'sa-active-date'}>{formatDate(u.userPlan.endDate)}</span>
                        : '—'}
                    </td>
                    <td><span className={`sa-status ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <div className="sa-actions">
                        <button className="sa-btn-action edit" onClick={() => { setEditForm({ id: u.id, firstName: u.firstName, lastName: u.lastName, dni: u.dni || '', phone: u.phone || '' }); setShowEditModal(true) }}>✏️ Editar</button>
                        <button className="sa-btn-action plan" onClick={() => { setSelectedUser(u); setPlanForm({ planId: '', startDate: '' }); setShowPlanModal(true) }}>💳 Plan</button>
                        <button className="sa-btn-action reset" onClick={() => { setResetUser(u); setShowResetModal(true) }}>🔑 Clave</button>
                        <button className={`sa-btn-action ${u.isActive ? 'deactivate' : 'activate'}`} onClick={() => toggleActive(u)}>{u.isActive ? '🔒 Desactivar' : '✅ Activar'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'trainers' && (
          <div className="sa-card">
            <table className="sa-table">
              <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {trainers.length === 0 && <tr><td colSpan={6} className="sa-empty">No hay entrenadores registrados</td></tr>}
                {trainers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="sa-user-cell">
                        <div className="sa-avatar sm trainer">{u.firstName[0]}{u.lastName[0]}</div>
                        <div><div className="sa-cell-name">{u.firstName} {u.lastName}</div></div>
                      </div>
                    </td>
                    <td>{u.dni || '—'}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.email}</td>
                    <td><span className={`sa-status ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <div className="sa-actions">
                        <button className="sa-btn-action edit" onClick={() => { setEditForm({ id: u.id, firstName: u.firstName, lastName: u.lastName, dni: u.dni || '', phone: u.phone || '' }); setShowEditModal(true) }}>✏️ Editar</button>
                        <button className="sa-btn-action reset" onClick={() => { setResetUser(u); setShowResetModal(true) }}>🔑 Clave</button>
                        <button className={`sa-btn-action ${u.isActive ? 'deactivate' : 'activate'}`} onClick={() => toggleActive(u)}>{u.isActive ? '🔒 Desactivar' : '✅ Activar'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div className="sa-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2>Nuevo Usuario</h2>
              <button className="sa-modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate} className="sa-modal-form">
              <div className="sa-form-row">
                <div className="sa-form-field"><label>Nombre</label><input value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} placeholder="Juan" required /></div>
                <div className="sa-form-field"><label>Apellido</label><input value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} placeholder="Pérez" required /></div>
              </div>
              <div className="sa-form-row">
                <div className="sa-form-field"><label>DNI</label><input value={createForm.dni} onChange={e => setCreateForm({...createForm, dni: e.target.value})} placeholder="38123456" /></div>
                <div className="sa-form-field"><label>Teléfono</label><input value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} placeholder="1155667788" /></div>
              </div>
              <div className="sa-form-field"><label>Email</label><input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} placeholder="juan@email.com" required /></div>
              <div className="sa-form-field"><label>Contraseña</label><input type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} placeholder="Mínimo 8 caracteres" required /></div>
              <div className="sa-form-field">
                <label>Rol</label>
                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})}>
                  <option value="MEMBER">Miembro</option>
                  <option value="TRAINER">Entrenador</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              {createError && <div className="sa-form-error">{createError}</div>}
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="sa-btn-primary" disabled={createLoading}>{createLoading ? 'Creando...' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditModal && (
        <div className="sa-overlay" onClick={() => setShowEditModal(false)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2>Editar Usuario</h2>
              <button className="sa-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleEdit} className="sa-modal-form">
              <div className="sa-form-row">
                <div className="sa-form-field"><label>Nombre</label><input value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} required /></div>
                <div className="sa-form-field"><label>Apellido</label><input value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} required /></div>
              </div>
              <div className="sa-form-row">
                <div className="sa-form-field"><label>DNI</label><input value={editForm.dni} onChange={e => setEditForm({...editForm, dni: e.target.value})} /></div>
                <div className="sa-form-field"><label>Teléfono</label><input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
              </div>
              {editError && <div className="sa-form-error">{editError}</div>}
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className="sa-btn-primary" disabled={editLoading}>{editLoading ? 'Guardando...' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Plan */}
      {showPlanModal && selectedUser && (
        <div className="sa-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2>Asignar Plan</h2>
              <button className="sa-modal-close" onClick={() => setShowPlanModal(false)}>✕</button>
            </div>
            <p className="sa-modal-subtitle">Miembro: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong></p>
            {selectedUser.userPlan && (
              <div className="sa-current-plan">Plan actual: <strong>{selectedUser.userPlan.plan.name}</strong> — vence el {formatDate(selectedUser.userPlan.endDate)}</div>
            )}
            <form onSubmit={handleAssignPlan} className="sa-modal-form">
              <div className="sa-form-field">
                <label>Plan</label>
                <select value={planForm.planId} onChange={e => setPlanForm({...planForm, planId: e.target.value})} required>
                  <option value="">Seleccioná un plan</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="sa-form-field"><label>Fecha de inicio</label><input type="date" value={planForm.startDate} onChange={e => setPlanForm({...planForm, startDate: e.target.value})} required /></div>
              {planError && <div className="sa-form-error">{planError}</div>}
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-secondary" onClick={() => setShowPlanModal(false)}>Cancelar</button>
                <button type="submit" className="sa-btn-primary" disabled={planLoading}>{planLoading ? 'Asignando...' : 'Asignar Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && resetUser && (
        <div className="sa-overlay" onClick={() => setShowResetModal(false)}>
          <div className="sa-modal sm" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2>Resetear Contraseña</h2>
              <button className="sa-modal-close" onClick={() => setShowResetModal(false)}>✕</button>
            </div>
            <p className="sa-modal-subtitle">Usuario: <strong>{resetUser.firstName} {resetUser.lastName}</strong></p>
            <form onSubmit={handleResetPassword} className="sa-modal-form">
              <div className="sa-form-field"><label>Nueva contraseña</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} /></div>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-secondary" onClick={() => setShowResetModal(false)}>Cancelar</button>
                <button type="submit" className="sa-btn-primary" disabled={resetLoading}>{resetLoading ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardSuperAdmin
