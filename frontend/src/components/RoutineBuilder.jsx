// frontend/src/components/RoutineBuilder.jsx
import { useState } from 'react'
import api from '../services/api'
import './RoutineBuilder.css'

const emptyExercise = () => ({ name: '', sets: '', reps: '', weight: '', restSeconds: '', notes: '' })
const emptyDay = (num) => ({ dayNumber: num, name: `Día ${num}`, description: '', exercises: [emptyExercise()] })

const RoutineBuilder = ({ member, onClose, onSaved }) => {
  const [routineName, setRoutineName] = useState(`Rutina de ${member.firstName}`)
  const [description, setDescription] = useState('')
  const [days, setDays] = useState([emptyDay(1)])
  const [activeDay, setActiveDay] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Días ──
  const addDay = () => {
    const newDay = emptyDay(days.length + 1)
    setDays([...days, newDay])
    setActiveDay(days.length)
  }

  const removeDay = (index) => {
    if (days.length === 1) return
    const updated = days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1, name: d.name.startsWith('Día ') ? `Día ${i + 1}` : d.name }))
    setDays(updated)
    setActiveDay(Math.min(activeDay, updated.length - 1))
  }

  const updateDay = (index, field, value) => {
    const updated = [...days]
    updated[index] = { ...updated[index], [field]: value }
    setDays(updated)
  }

  // ── Ejercicios ──
  const addExercise = (dayIndex) => {
    const updated = [...days]
    updated[dayIndex].exercises.push(emptyExercise())
    setDays(updated)
  }

  const removeExercise = (dayIndex, exIndex) => {
    const updated = [...days]
    updated[dayIndex].exercises = updated[dayIndex].exercises.filter((_, i) => i !== exIndex)
    setDays(updated)
  }

  const updateExercise = (dayIndex, exIndex, field, value) => {
    const updated = [...days]
    updated[dayIndex].exercises[exIndex] = { ...updated[dayIndex].exercises[exIndex], [field]: value }
    setDays(updated)
  }

  // ── Guardar ──
const handleSave = async () => {
  setError('')
  if (!routineName.trim()) return setError('El nombre de la rutina es requerido')
  for (const day of days) {
    if (!day.name.trim()) return setError(`Falta el nombre de un día`)
    for (const ex of day.exercises) {
      if (!ex.name.trim()) return setError(`Falta el nombre de un ejercicio en ${day.name}`)
    }
  }

  setLoading(true)
  try {
    await api.post('/routines', { userId: member.id, name: routineName, description, days })
    onSaved()
    onClose()
  } catch (err) {
    setError(err.response?.data?.message || 'Error al guardar la rutina')
  } finally {
    setLoading(false)
  }
}

  const currentDay = days[activeDay]

  return (
    <div className="rb-overlay" onClick={onClose}>
      <div className="rb-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="rb-header">
          <div>
            <h2>Crear Rutina</h2>
            <p>Para: <strong>{member.firstName} {member.lastName}</strong></p>
          </div>
          <button className="rb-close" onClick={onClose}>✕</button>
        </div>

        {/* Nombre de rutina */}
        <div className="rb-routine-info">
          <div className="rb-field">
            <label>Nombre de la rutina</label>
            <input value={routineName} onChange={e => setRoutineName(e.target.value)} placeholder="Ej: Rutina de fuerza 3 días" />
          </div>
          <div className="rb-field">
            <label>Descripción (opcional)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Rutina enfocada en hipertrofia" />
          </div>
        </div>

        <div className="rb-body">
          {/* Panel de días */}
          <div className="rb-days-panel">
            <div className="rb-days-title">Días</div>
            {days.map((day, i) => (
              <div key={i} className={`rb-day-tab ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>
                <span>{day.name || `Día ${i + 1}`}</span>
                {days.length > 1 && (
                  <button className="rb-remove-day" onClick={e => { e.stopPropagation(); removeDay(i) }}>✕</button>
                )}
              </div>
            ))}
            <button className="rb-add-day" onClick={addDay}>+ Agregar día</button>
          </div>

          {/* Panel de ejercicios */}
          <div className="rb-exercises-panel">
            <div className="rb-day-header">
              <div className="rb-field">
                <label>Nombre del día</label>
                <input
                  value={currentDay.name}
                  onChange={e => updateDay(activeDay, 'name', e.target.value)}
                  placeholder="Ej: Día 1 - Pecho y Tríceps"
                />
              </div>
              <div className="rb-field">
                <label>Descripción del día (opcional)</label>
                <input
                  value={currentDay.description}
                  onChange={e => updateDay(activeDay, 'description', e.target.value)}
                  placeholder="Ej: Enfocado en empuje"
                />
              </div>
            </div>

            <div className="rb-exercises-title">Ejercicios</div>

            {currentDay.exercises.map((ex, exIndex) => (
              <div key={exIndex} className="rb-exercise-card">
                <div className="rb-exercise-num">#{exIndex + 1}</div>
                <div className="rb-exercise-fields">
                  <div className="rb-field full">
                    <label>Nombre del ejercicio</label>
                    <input value={ex.name} onChange={e => updateExercise(activeDay, exIndex, 'name', e.target.value)} placeholder="Ej: Press de banca, Sentadilla..." />
                  </div>
                  <div className="rb-field-row">
                    <div className="rb-field">
                      <label>Series</label>
                      <input type="number" value={ex.sets} onChange={e => updateExercise(activeDay, exIndex, 'sets', e.target.value)} placeholder="3" min="1" />
                    </div>
                    <div className="rb-field">
                      <label>Repeticiones</label>
                      <input value={ex.reps} onChange={e => updateExercise(activeDay, exIndex, 'reps', e.target.value)} placeholder="10-12 / Al fallo" />
                    </div>
                    <div className="rb-field">
                      <label>Peso</label>
                      <input value={ex.weight} onChange={e => updateExercise(activeDay, exIndex, 'weight', e.target.value)} placeholder="20kg / Corporal" />
                    </div>
                    <div className="rb-field">
                      <label>Descanso (seg)</label>
                      <input type="number" value={ex.restSeconds} onChange={e => updateExercise(activeDay, exIndex, 'restSeconds', e.target.value)} placeholder="60" min="0" />
                    </div>
                  </div>
                  <div className="rb-field full">
                    <label>Notas (opcional)</label>
                    <input value={ex.notes} onChange={e => updateExercise(activeDay, exIndex, 'notes', e.target.value)} placeholder="Ej: Bajar lento, controlar el movimiento..." />
                  </div>
                </div>
                {currentDay.exercises.length > 1 && (
                  <button className="rb-remove-ex" onClick={() => removeExercise(activeDay, exIndex)}>🗑️</button>
                )}
              </div>
            ))}

            <button className="rb-add-ex" onClick={() => addExercise(activeDay)}>+ Agregar ejercicio</button>
          </div>
        </div>

        {error && <div className="rb-error">{error}</div>}

        <div className="rb-footer">
          <button className="rb-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="rb-btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : '💾 Guardar Rutina'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoutineBuilder
