// frontend/src/pages/DashboardMember.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './DashboardMember.css'

const emptyExercise = () => ({ name: '', sets: '', reps: '', weight: '', notes: '' })

const DashboardMember = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null)
  const [routine, setRoutine] = useState(null)
  const [workoutLogs, setWorkoutLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('plan')

  const [showWorkoutModal, setShowWorkoutModal] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [workoutForm, setWorkoutForm] = useState({
    date: new Date().toISOString().split('T')[0],
    dayName: '',
    duration: '',
    exercises: [emptyExercise()]
  })
  const [savingWorkout, setSavingWorkout] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingLog, setDeletingLog] = useState(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const [checkingDay, setCheckingDay] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [userRes, routineRes, logsRes] = await Promise.all([
        api.get(`/users/${user.id}`),
        api.get(`/routines/member/${user.id}`),
        api.get(`/workout-logs/${user.id}`),
      ])
      setPlan(userRes.data.data.userPlan)
      setRoutine(routineRes.data.data)
      setWorkoutLogs(logsRes.data.data || [])
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

  const getDaysUntilPayment = () => {
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24))
  }

  const isPersonalized = plan?.plan?.name?.toLowerCase().includes('personalizado')

  const handleCheckDay = async (day) => {
    const isCompleted = day.workoutLogs?.length > 0
    setCheckingDay(day.id)
    try {
      if (isCompleted) {
        await api.delete(`/routines/day/${day.id}/complete`)
      } else {
        await api.post(`/routines/day/${day.id}/complete`, { completedAt: new Date().toISOString() })
      }
      fetchData()
    } catch (err) { console.error(err) }
    finally { setCheckingDay(null) }
  }

  // ── Abrir modal para crear ──
  const openCreateModal = () => {
    setEditingLog(null)
    setWorkoutForm({
      date: new Date().toISOString().split('T')[0],
      dayName: '',
      duration: '',
      exercises: [emptyExercise()]
    })
    setShowWorkoutModal(true)
  }

  // ── Abrir modal para editar ──
  const openEditModal = (log) => {
    setEditingLog(log)
    setWorkoutForm({
      date: new Date(log.date).toISOString().split('T')[0],
      dayName: log.dayName || '',
      duration: log.duration?.toString() || '',
      exercises: log.exercises?.length > 0
        ? log.exercises.map(e => ({ name: e.name || '', sets: e.sets || '', reps: e.reps || '', weight: e.weight || '', notes: e.notes || '' }))
        : [emptyExercise()]
    })
    setShowWorkoutModal(true)
  }

  const addExerciseToForm = () => {
    setWorkoutForm({ ...workoutForm, exercises: [...workoutForm.exercises, emptyExercise()] })
  }

  const updateFormExercise = (index, field, value) => {
    const updated = [...workoutForm.exercises]
    updated[index] = { ...updated[index], [field]: value }
    setWorkoutForm({ ...workoutForm, exercises: updated })
  }

  const removeFormExercise = (index) => {
    setWorkoutForm({ ...workoutForm, exercises: workoutForm.exercises.filter((_, i) => i !== index) })
  }

  // ── Guardar (crear o editar) ──
  const handleSaveWorkout = async () => {
    setSavingWorkout(true)
    try {
      const payload = {
        date: workoutForm.date,
        dayName: workoutForm.dayName,
        duration: workoutForm.duration,
        exercises: workoutForm.exercises.filter(e => e.name.trim())
      }

      if (editingLog) {
        await api.patch(`/workout-logs/free/${editingLog.id}`, payload)
      } else {
        await api.post('/workout-logs/free', payload)
      }

      setShowWorkoutModal(false)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setSavingWorkout(false) }
  }

  // ── Eliminar ──
  const handleDeleteLog = async () => {
    setDeletingLoading(true)
    try {
      await api.delete(`/workout-logs/free/${deletingLog.id}`)
      setShowDeleteModal(false)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setDeletingLoading(false) }
  }

  const daysLeft = plan ? getDaysUntilExpiry(plan.endDate) : null

  if (loading) return <div className="mb-loading"><div className="mb-spinner" /></div>

  return (
    <div className="mb-root">
      <aside className="mb-sidebar">
        <div className="mb-logo">
          <span className="mb-logo-icon">⚡</span>
          <span className="mb-logo-text">GIM<strong>PRO</strong></span>
        </div>
        <nav className="mb-nav">
          <button className={`mb-nav-item ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}><span>📋</span> Mi Plan</button>
          <button className={`mb-nav-item ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}><span>🏋️</span> Mi Rutina</button>
          <button className={`mb-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><span>📅</span> Historial</button>
        </nav>
        <div className="mb-sidebar-footer">
          <div className="mb-user-info">
            <div className="mb-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div>
              <div className="mb-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="mb-user-role">Miembro</div>
            </div>
          </div>
          <button className="mb-logout" onClick={handleLogout}>Salir</button>
        </div>
      </aside>

      <main className="mb-main">

        {/* ── MI PLAN ── */}
        {activeTab === 'plan' && (
          <>
            <div className="mb-header">
              <h1 className="mb-title">Mi Plan</h1>
              <p className="mb-subtitle">Información de tu membresía</p>
            </div>
            {!plan ? (
              <div className="mb-empty-plan">
                <div className="mb-empty-icon">📋</div>
                <h3>No tenés un plan asignado</h3>
                <p>Contactá al administrador para que te asigne un plan.</p>
              </div>
            ) : (
              <div className="mb-plan-grid">
                <div className="mb-plan-card main">
                  <div className="mb-plan-name">{plan.plan.name}</div>
                  <div className="mb-plan-status">
                    {daysLeft !== null && daysLeft < 0
                      ? <span className="mb-badge expired">Vencido</span>
                      : <span className="mb-badge active">Activo</span>}
                  </div>
                </div>
                <div className="mb-info-card">
                  <div className="mb-info-icon">💳</div>
                  <div className="mb-info-label">Último pago</div>
                  <div className="mb-info-value">{formatDate(plan.paidAt)}</div>
                </div>
                <div className="mb-info-card">
                  <div className="mb-info-icon">📅</div>
                  <div className="mb-info-label">Fecha de inicio</div>
                  <div className="mb-info-value">{formatDate(plan.startDate)}</div>
                </div>
                <div className={`mb-info-card ${daysLeft !== null && daysLeft <= 7 ? 'warning' : ''} ${daysLeft !== null && daysLeft < 0 ? 'expired' : ''}`}>
                  <div className="mb-info-icon">⏰</div>
                  <div className="mb-info-label">Vencimiento</div>
                  <div className="mb-info-value">{formatDate(plan.endDate)}</div>
                  {daysLeft !== null && daysLeft >= 0 && <div className="mb-info-note">{daysLeft === 0 ? 'Vence hoy' : `Vence en ${daysLeft} días`}</div>}
                  {daysLeft !== null && daysLeft < 0 && <div className="mb-info-note expired">Venció hace {Math.abs(daysLeft)} días</div>}
                </div>
                <div className="mb-info-card payment">
                  <div className="mb-info-icon">🔔</div>
                  <div className="mb-info-label">Próximo pago</div>
                  <div className="mb-info-value">Del 1 al 7 del mes</div>
                  <div className="mb-info-note">En {getDaysUntilPayment()} días comienza el período de pago</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MI RUTINA ── */}
        {activeTab === 'routine' && (
          <>
            <div className="mb-header">
              <div>
                <h1 className="mb-title">Mi Rutina</h1>
                <p className="mb-subtitle">{isPersonalized ? 'Rutina personalizada — marcá los días completados' : 'Registrá tus entrenamientos'}</p>
              </div>
              {!isPersonalized && (
                <button className="mb-btn-primary" onClick={openCreateModal}>+ Registrar entrenamiento</button>
              )}
            </div>

            {isPersonalized && (
              <>
                {!routine ? (
                  <div className="mb-empty-plan">
                    <div className="mb-empty-icon">🏋️</div>
                    <h3>No tenés una rutina asignada</h3>
                    <p>Tu entrenador te asignará una rutina pronto.</p>
                  </div>
                ) : (
                  <div className="mb-routine-days">
                    {routine.days.map(day => {
                      const isCompleted = day.workoutLogs?.length > 0
                      const completedAt = day.workoutLogs?.[0]?.completedAt
                      return (
                        <div key={day.id} className={`mb-day-card ${isCompleted ? 'completed' : ''}`}>
                          <div className="mb-day-header">
                            <div className="mb-day-info">
                              <span className="mb-day-badge">Día {day.dayNumber}</span>
                              <span className="mb-day-name">{day.name}</span>
                            </div>
                            <button className={`mb-check-btn ${isCompleted ? 'checked' : ''}`} onClick={() => handleCheckDay(day)} disabled={checkingDay === day.id}>
                              {checkingDay === day.id ? '...' : isCompleted ? '✅ Completado' : '⬜ Marcar como hecho'}
                            </button>
                          </div>
                          {isCompleted && completedAt && <div className="mb-completed-date">Completado el {formatDate(completedAt)}</div>}
                          {day.description && <p className="mb-day-desc">{day.description}</p>}
                          <div className="mb-exercises">
                            {day.exercises.map((ex, i) => (
                              <div key={ex.id} className="mb-exercise">
                                <div className="mb-ex-num">{i + 1}</div>
                                <div className="mb-ex-body">
                                  <div className="mb-ex-name">{ex.name}</div>
                                  <div className="mb-ex-details">
                                    {ex.sets && <span>📊 {ex.sets} series</span>}
                                    {ex.reps && <span>🔄 {ex.reps} reps</span>}
                                    {ex.weight && <span>⚖️ {ex.weight}</span>}
                                    {ex.restSeconds && <span>⏱️ {ex.restSeconds}s descanso</span>}
                                  </div>
                                  {ex.notes && <div className="mb-ex-notes">💡 {ex.notes}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {!isPersonalized && (
              <div className="mb-free-logs">
                {workoutLogs.length === 0 ? (
                  <div className="mb-empty-plan">
                    <div className="mb-empty-icon">📅</div>
                    <h3>No hay entrenamientos registrados</h3>
                    <p>Presioná el botón para registrar tu primer entrenamiento.</p>
                  </div>
                ) : (
                  workoutLogs.map(log => (
                    <div key={log.id} className="mb-free-log-card">
                      <div className="mb-free-log-header">
                        <div>
                          <div className="mb-free-log-title">{log.dayName || 'Entrenamiento'}</div>
                          <div className="mb-free-log-date">{formatDate(log.date)}{log.duration && ` · ${log.duration} min`}</div>
                        </div>
                        <div className="mb-log-actions">
                          <button data-tooltip="Editar" className="mb-log-btn edit" onClick={() => openEditModal(log)}>✏️</button>
                          <button data-tooltip="Eliminar" className="mb-log-btn delete" onClick={() => { setDeletingLog(log); setShowDeleteModal(true) }}>🗑️</button>
                        </div>
                      </div>
                      {log.exercises && log.exercises.length > 0 && (
                        <div className="mb-exercises">
                          {log.exercises.map((ex, i) => (
                            <div key={i} className="mb-exercise">
                              <div className="mb-ex-num">{i + 1}</div>
                              <div className="mb-ex-body">
                                <div className="mb-ex-name">{ex.name}</div>
                                <div className="mb-ex-details">
                                  {ex.sets && <span>📊 {ex.sets} series</span>}
                                  {ex.reps && <span>🔄 {ex.reps} reps</span>}
                                  {ex.weight && <span>⚖️ {ex.weight}</span>}
                                </div>
                                {ex.notes && <div className="mb-ex-notes">💡 {ex.notes}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ── HISTORIAL ── */}
        {activeTab === 'history' && (
          <>
            <div className="mb-header">
              <h1 className="mb-title">Historial</h1>
              <p className="mb-subtitle">Tus entrenamientos registrados</p>
            </div>
            {isPersonalized ? (
              <div className="mb-history-list">
                {routine?.days?.filter(d => d.workoutLogs?.length > 0).length === 0 ? (
                  <div className="mb-empty-plan"><div className="mb-empty-icon">📅</div><h3>No hay días completados todavía</h3></div>
                ) : (
                  routine?.days?.filter(d => d.workoutLogs?.length > 0).map(day => (
                    <div key={day.id} className="mb-history-item">
                      <div className="mb-history-day">Día {day.dayNumber} — {day.name}</div>
                      <div className="mb-history-date">✅ Completado el {formatDate(day.workoutLogs[0].completedAt)}</div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="mb-history-list">
                {workoutLogs.length === 0 ? (
                  <div className="mb-empty-plan"><div className="mb-empty-icon">📅</div><h3>No hay entrenamientos registrados</h3></div>
                ) : (
                  workoutLogs.map(log => (
                    <div key={log.id} className="mb-history-item">
                      <div className="mb-history-day">{log.dayName || 'Entrenamiento'}</div>
                      <div className="mb-history-date">📅 {formatDate(log.date)}{log.duration && ` · ${log.duration} min`}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Modal crear/editar entrenamiento ── */}
      {showWorkoutModal && (
        <div className="mb-overlay" onClick={() => setShowWorkoutModal(false)}>
          <div className="mb-modal" onClick={e => e.stopPropagation()}>
            <div className="mb-modal-header">
              <h2>{editingLog ? 'Editar Entrenamiento' : 'Registrar Entrenamiento'}</h2>
              <button className="mb-modal-close" onClick={() => setShowWorkoutModal(false)}>✕</button>
            </div>
            <div className="mb-modal-body">
              <div className="mb-form-row">
                <div className="mb-form-field">
                  <label>Fecha</label>
                  <input type="date" value={workoutForm.date} onChange={e => setWorkoutForm({...workoutForm, date: e.target.value})} />
                </div>
                <div className="mb-form-field">
                  <label>Duración (minutos)</label>
                  <input type="number" value={workoutForm.duration} onChange={e => setWorkoutForm({...workoutForm, duration: e.target.value})} placeholder="60" />
                </div>
              </div>
              <div className="mb-form-field">
                <label>Nombre del día (opcional)</label>
                <input value={workoutForm.dayName} onChange={e => setWorkoutForm({...workoutForm, dayName: e.target.value})} placeholder="Ej: Pecho y Tríceps" />
              </div>
              <div className="mb-exercises-title">Ejercicios</div>
              {workoutForm.exercises.map((ex, i) => (
                <div key={i} className="mb-exercise-form">
                  <div className="mb-ex-num">{i + 1}</div>
                  <div className="mb-ex-form-fields">
                    <div className="mb-form-field full">
                      <label>Ejercicio</label>
                      <input value={ex.name} onChange={e => updateFormExercise(i, 'name', e.target.value)} placeholder="Ej: Press de banca" />
                    </div>
                    <div className="mb-form-row-4">
                      <div className="mb-form-field"><label>Series</label><input type="number" value={ex.sets} onChange={e => updateFormExercise(i, 'sets', e.target.value)} placeholder="3" /></div>
                      <div className="mb-form-field"><label>Reps</label><input value={ex.reps} onChange={e => updateFormExercise(i, 'reps', e.target.value)} placeholder="10-12" /></div>
                      <div className="mb-form-field"><label>Peso</label><input value={ex.weight} onChange={e => updateFormExercise(i, 'weight', e.target.value)} placeholder="20kg" /></div>
                      <div className="mb-form-field"><label>Notas</label><input value={ex.notes} onChange={e => updateFormExercise(i, 'notes', e.target.value)} placeholder="Opcional" /></div>
                    </div>
                  </div>
                  {workoutForm.exercises.length > 1 && (
                    <button className="mb-remove-ex" onClick={() => removeFormExercise(i)}>🗑️</button>
                  )}
                </div>
              ))}
              <button className="mb-add-ex" onClick={addExerciseToForm}>+ Agregar ejercicio</button>
            </div>
            <div className="mb-modal-footer">
              <button className="mb-btn-secondary" onClick={() => setShowWorkoutModal(false)}>Cancelar</button>
              <button className="mb-btn-primary" onClick={handleSaveWorkout} disabled={savingWorkout}>
                {savingWorkout ? 'Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal eliminar ── */}
      {showDeleteModal && deletingLog && (
        <div className="mb-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="mb-modal sm" onClick={e => e.stopPropagation()}>
            <div className="mb-modal-header">
              <h2>Eliminar Entrenamiento</h2>
              <button className="mb-modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="mb-modal-body">
              <p style={{ color: '#0a1628', fontSize: 15, lineHeight: 1.6 }}>
                ¿Estás segura que querés eliminar el entrenamiento <strong>{deletingLog.dayName || 'del ' + formatDate(deletingLog.date)}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="mb-modal-footer">
              <button className="mb-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="mb-btn-danger" onClick={handleDeleteLog} disabled={deletingLoading}>
                {deletingLoading ? 'Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardMember
