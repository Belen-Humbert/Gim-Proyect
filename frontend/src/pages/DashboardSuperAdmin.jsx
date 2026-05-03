// frontend/src/pages/DashboardSuperAdmin.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import RoutineBuilder from '../components/RoutineBuilder'
import RoutineViewer from '../components/RoutineViewer'
import './DashboardSuperAdmin.css'

const DashboardSuperAdmin = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [search, setSearch] = useState('')

  // Modal de detalle desde dashboard
  const [statModal, setStatModal] = useState(null) // 'active' | 'trainers' | 'expired' | 'expiring' | 'noplan'

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', dni: '', phone: '', email: '', password: '', role: 'MEMBER' })
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ id: '', firstName: '', lastName: '', dni: '', phone: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [planForm, setPlanForm] = useState({ planId: '', startDate: '' })
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState('')

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historyUser, setHistoryUser] = useState(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [showRoutineViewer, setShowRoutineViewer] = useState(false)
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false)
  const [routineMember, setRoutineMember] = useState(null)

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
      await api.patch(`/users/${editForm.id}`, { firstName: editForm.firstName, lastName: editForm.lastName, dni: editForm.dni, phone: editForm.phone })
      setShowEditModal(false); fetchData()
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

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/users/${deleteUser.id}`)
      setShowDeleteModal(false); fetchData()
    } catch (err) { alert(err.response?.data?.message || 'Error al eliminar usuario') }
    finally { setDeleteLoading(false) }
  }

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

  const members = users.filter(u => u.role === 'MEMBER')
  const trainers = users.filter(u => u.role === 'TRAINER')

  const filteredMembers = members.filter(u =>
    `${u.firstName} ${u.lastName} ${u.dni || ''} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )
  const filteredTrainers = trainers.filter(u =>
    `${u.firstName} ${u.lastName} ${u.dni || ''} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const activeMembers = members.filter(u => u.isActive)
  const expiredMembers = members.filter(u => u.userPlan && getDaysUntilExpiry(u.userPlan.endDate) < 0)
  const expiringMembers = members.filter(u => u.userPlan && getDaysUntilExpiry(u.userPlan.endDate) >= 0 && getDaysUntilExpiry(u.userPlan.endDate) <= 7)
  const noPlanMembers = members.filter(u => !u.userPlan)

  // Qué lista muestra el stat modal
  const statModalConfig = {
    active: { title: 'Miembros Activos', list: activeMembers, showPlan: true },
    trainers: { title: 'Entrenadores', list: trainers, showPlan: false },
    expired: { title: 'Planes Vencidos', list: expiredMembers, showPlan: true },
    expiring: { title: 'Vencen en 7 días', list: expiringMembers, showPlan: true },
    noplan: { title: 'Sin Plan Asignado', list: noPlanMembers, showPlan: true },
  }

  // Componente de fila de usuario reutilizable
  const UserRow = ({ u, showPlan = true, isTrainer = false }) => {
    const expiryStatus = u.userPlan ? getExpiryStatus(u.userPlan.endDate) : null
    const days = u.userPlan ? getDaysUntilExpiry(u.userPlan.endDate) : null
    return (
      <tr className={expiryStatus === 'expired' ? 'row-expired' : expiryStatus === 'warning' ? 'row-warning' : ''}>
        <td>
          <div className="sa-user-cell">
            <div className={`sa-avatar sm ${isTrainer ? 'trainer' : ''}`}>{u.firstName[0]}{u.lastName[0]}</div>
            <div><div className="sa-cell-name">{u.firstName} {u.lastName}</div><div className="sa-cell-email">{u.email}</div></div>
          </div>
        </td>
        <td>{u.dni || '—'}</td>
        <td>{u.phone || '—'}</td>
        {showPlan && (
          <>
            <td>{u.userPlan?.plan?.name || <span className="sa-no-plan">Sin plan</span>}</td>
            <td>
              {u.userPlan ? (
                <div>
                  <span className={expiryStatus === 'expired' ? 'sa-expired' : expiryStatus === 'warning' ? 'sa-warning-date' : 'sa-active-date'}>{formatDate(u.userPlan.endDate)}</span>
                  {expiryStatus === 'expired' && <div className="sa-expiry-note">Venció hace {Math.abs(days)} días</div>}
                  {expiryStatus === 'warning' && <div className="sa-expiry-note warning">Vence en {days} días</div>}
                </div>
              ) : '—'}
            </td>
          </>
        )}
        {!showPlan && <td>{u.email}</td>}
        <td><span className={`sa-status ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span></td>
        <td>
          <div className="sa-actions">
            {!isTrainer && <>
              <button data-tooltip="Editar" className="sa-btn-action edit" onClick={() => { setEditForm({ id: u.id, firstName: u.firstName, lastName: u.lastName, dni: u.dni || '', phone: u.phone || '' }); setShowEditModal(true) }}>✏️</button>
              <button data-tooltip="Asignar plan" className="sa-btn-action plan" onClick={() => { setSelectedUser(u); setPlanForm({ planId: '', startDate: '' }); setShowPlanModal(true) }}>💳</button>
              <button data-tooltip="Rutina" className="sa-btn-action routine" onClick={() => { setRoutineMember(u); setShowRoutineViewer(true) }}>🏋️</button>
            </>}
            <button data-tooltip="Resetear clave" className="sa-btn-action reset" onClick={() => { setResetUser(u); setShowResetModal(true) }}>🔑</button>
            <button data-tooltip={u.isActive ? 'Desactivar' : 'Activar'} className={`sa-btn-action ${u.isActive ? 'deactivate' : 'activate'}`} onClick={() => toggleActive(u)}>{u.isActive ? '🔒' : '✅'}</button>
            <button data-tooltip="Eliminar" className="sa-btn-action delete" onClick={() => { setDeleteUser(u); setShowDeleteModal(true) }}>🗑️</button>
          </div>
        </td>
      </tr>
    )
  }

  if (loading) return <div className="sa-loading"><div className="sa-spinner" /></div>

  return (
    <div className="sa-root">
      <aside className="sa-sidebar">
        <div className="sa-logo">
          <span className="sa-logo-icon">⚡</span>
          <span className="sa-logo-text">GIM<strong>PRO</strong></span>
        </div>
        <nav className="sa-nav">
          <button className={`sa-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><span>📊</span> Dashboard</button>
          <button className={`sa-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><span>👥</span> Miembros</button>
          <button className={`sa-nav-item ${activeTab === 'trainers' ? 'active' : ''}`} onClick={() => setActiveTab('trainers')}><span>💪</span> Entrenadores</button>
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
        {activeTab === 'dashboard' && (
          <>
            <div className="sa-header">
              <div><h1 className="sa-title">Dashboard</h1><p className="sa-subtitle">Resumen general del gimnasio</p></div>
              <button className="sa-btn-primary" onClick={() => setShowCreateModal(true)}>+ Nuevo usuario</button>
            </div>
            <div className="sa-stats-grid">
              <div className="sa-stat-card blue clickable" onClick={() => setStatModal('active')}>
                <div className="sa-stat-icon">👥</div>
                <div className="sa-stat-value">{activeMembers.length}</div>
                <div className="sa-stat-label">Miembros activos</div>
                <div className="sa-stat-hint">Ver lista →</div>
              </div>
              <div className="sa-stat-card green clickable" onClick={() => setStatModal('trainers')}>
                <div className="sa-stat-icon">💪</div>
                <div className="sa-stat-value">{trainers.length}</div>
                <div className="sa-stat-label">Entrenadores</div>
                <div className="sa-stat-hint">Ver lista →</div>
              </div>
              <div className="sa-stat-card red clickable" onClick={() => setStatModal('expired')}>
                <div className="sa-stat-icon">⚠️</div>
                <div className="sa-stat-value">{expiredMembers.length}</div>
                <div className="sa-stat-label">Planes vencidos</div>
                <div className="sa-stat-hint">Ver lista →</div>
              </div>
              <div className="sa-stat-card orange clickable" onClick={() => setStatModal('expiring')}>
                <div className="sa-stat-icon">🔔</div>
                <div className="sa-stat-value">{expiringMembers.length}</div>
                <div className="sa-stat-label">Vencen en 7 días</div>
                <div className="sa-stat-hint">Ver lista →</div>
              </div>
              <div className="sa-stat-card gray clickable" onClick={() => setStatModal('noplan')}>
                <div className="sa-stat-icon">📋</div>
                <div className="sa-stat-value">{noPlanMembers.length}</div>
                <div className="sa-stat-label">Sin plan asignado</div>
                <div className="sa-stat-hint">Ver lista →</div>
              </div>
            </div>

            {(expiredMembers.length > 0 || expiringMembers.length > 0) && (
              <div className="sa-alerts">
                <h2 className="sa-section-title">🔔 Alertas</h2>
                <div className="sa-alert-list">
                  {members.filter(u => u.userPlan && getDaysUntilExpiry(u.userPlan.endDate) <= 7)
                    .sort((a, b) => new Date(a.userPlan.endDate) - new Date(b.userPlan.endDate))
                    .map(u => {
                      const days = getDaysUntilExpiry(u.userPlan.endDate)
                      return (
                        <div key={u.id} className={`sa-alert-item ${days < 0 ? 'expired' : 'warning'}`}>
                          <div className="sa-alert-avatar">{u.firstName[0]}{u.lastName[0]}</div>
                          <div className="sa-alert-info">
                            <div className="sa-alert-name">{u.firstName} {u.lastName}</div>
                            <div className="sa-alert-plan">{u.userPlan.plan.name}</div>
                          </div>
                          <div className="sa-alert-date">{days < 0 ? `Venció hace ${Math.abs(days)} días` : days === 0 ? 'Vence hoy' : `Vence en ${days} días`}</div>
                          <button className="sa-btn-action plan" onClick={() => { setSelectedUser(u); setPlanForm({ planId: '', startDate: '' }); setShowPlanModal(true) }}>💳 Renovar</button>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className="sa-header">
              <div><h1 className="sa-title">Miembros</h1><p className="sa-subtitle">{filteredMembers.length} miembros encontrados</p></div>
              <button className="sa-btn-primary" onClick={() => setShowCreateModal(true)}>+ Nuevo usuario</button>
            </div>
            <div className="sa-search-bar">
              <span className="sa-search-icon">🔍</span>
              <input placeholder="Buscar por nombre, DNI o email..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="sa-search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            <div className="sa-card">
              <table className="sa-table">
                <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Plan</th><th>Vencimiento</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredMembers.length === 0 && <tr><td colSpan={7} className="sa-empty">No se encontraron miembros</td></tr>}
                  {filteredMembers.map(u => <UserRow key={u.id} u={u} showPlan={true} />)}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'trainers' && (
          <>
            <div className="sa-header">
              <div><h1 className="sa-title">Entrenadores</h1><p className="sa-subtitle">{filteredTrainers.length} entrenadores encontrados</p></div>
              <button className="sa-btn-primary" onClick={() => setShowCreateModal(true)}>+ Nuevo usuario</button>
            </div>
            <div className="sa-search-bar">
              <span className="sa-search-icon">🔍</span>
              <input placeholder="Buscar por nombre, DNI o email..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="sa-search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            <div className="sa-card">
              <table className="sa-table">
                <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Email</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredTrainers.length === 0 && <tr><td colSpan={6} className="sa-empty">No se encontraron entrenadores</td></tr>}
                  {filteredTrainers.map(u => <UserRow key={u.id} u={u} showPlan={false} isTrainer={true} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* ── Modal Stat Detail ── */}
      {statModal && statModalConfig[statModal] && (
        <div className="sa-overlay" onClick={() => setStatModal(null)}>
          <div className="sa-modal stat-detail" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header">
              <h2>{statModalConfig[statModal].title}</h2>
              <button className="sa-modal-close" onClick={() => setStatModal(null)}>✕</button>
            </div>
            <div className="sa-stat-detail-body">
              {statModalConfig[statModal].list.length === 0 ? (
                <div className="sa-empty">No hay usuarios en esta categoría</div>
              ) : (
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>DNI</th>
                      <th>Teléfono</th>
                      {statModalConfig[statModal].showPlan && <><th>Plan</th><th>Vencimiento</th></>}
                      {!statModalConfig[statModal].showPlan && <th>Email</th>}
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statModalConfig[statModal].list.map(u => (
                      <UserRow
                        key={u.id}
                        u={u}
                        showPlan={statModalConfig[statModal].showPlan}
                        isTrainer={statModal === 'trainers'}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {showCreateModal && (
        <div className="sa-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header"><h2>Nuevo Usuario</h2><button className="sa-modal-close" onClick={() => setShowCreateModal(false)}>✕</button></div>
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

      {/* Modal Editar */}
      {showEditModal && (
        <div className="sa-overlay" onClick={() => setShowEditModal(false)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header"><h2>Editar Usuario</h2><button className="sa-modal-close" onClick={() => setShowEditModal(false)}>✕</button></div>
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
            <div className="sa-modal-header"><h2>Asignar Plan</h2><button className="sa-modal-close" onClick={() => setShowPlanModal(false)}>✕</button></div>
            <p className="sa-modal-subtitle">Miembro: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong></p>
            {selectedUser.userPlan && <div className="sa-current-plan">Plan actual: <strong>{selectedUser.userPlan.plan.name}</strong> — vence el {formatDate(selectedUser.userPlan.endDate)}</div>}
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

      {/* Modal Historial */}
      {showHistoryModal && historyUser && (
        <div className="sa-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header"><h2>Historial de Pagos</h2><button className="sa-modal-close" onClick={() => setShowHistoryModal(false)}>✕</button></div>
            <p className="sa-modal-subtitle">{historyUser.firstName} {historyUser.lastName}</p>
            <div className="sa-modal-form">
              {!historyUser.userPlan ? <div className="sa-empty">Sin planes registrados</div> : (
                <div className="sa-history-list">
                  <div className="sa-history-item">
                    <div className="sa-history-plan">{historyUser.userPlan.plan.name}</div>
                    <div className="sa-history-dates">
                      <span>Inicio: {formatDate(historyUser.userPlan.startDate)}</span>
                      <span>Vencimiento: {formatDate(historyUser.userPlan.endDate)}</span>
                      <span>Pagado: {formatDate(historyUser.userPlan.paidAt)}</span>
                    </div>
                    <span className={`sa-status ${historyUser.userPlan.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{historyUser.userPlan.status === 'ACTIVE' ? 'Activo' : 'Vencido'}</span>
                  </div>
                </div>
              )}
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-primary" onClick={() => setShowHistoryModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && resetUser && (
        <div className="sa-overlay" onClick={() => setShowResetModal(false)}>
          <div className="sa-modal sm" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header"><h2>Resetear Contraseña</h2><button className="sa-modal-close" onClick={() => setShowResetModal(false)}>✕</button></div>
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

      {/* Modal Eliminar */}
      {showDeleteModal && deleteUser && (
        <div className="sa-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal sm" onClick={e => e.stopPropagation()}>
            <div className="sa-modal-header"><h2>Eliminar Usuario</h2><button className="sa-modal-close" onClick={() => setShowDeleteModal(false)}>✕</button></div>
            <div className="sa-modal-form">
              <p className="sa-delete-warning">¿Estás segura que querés eliminar a <strong>{deleteUser.firstName} {deleteUser.lastName}</strong>? Esta acción no se puede deshacer.</p>
              <div className="sa-modal-footer">
                <button type="button" className="sa-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button type="button" className="sa-btn-danger" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? 'Eliminando...' : '🗑️ Eliminar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          onSaved={() => fetchData()}
        />
      )}
    </div>
  )
}

export default DashboardSuperAdmin
