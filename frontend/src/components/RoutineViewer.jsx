// frontend/src/components/RoutineViewer.jsx
import { useState, useEffect } from 'react'
import api from '../services/api'
import './RoutineViewer.css'

const RoutineViewer = ({ member, onClose, onEdit }) => {
  const [routine, setRoutine] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoutine()
  }, [])

  const fetchRoutine = async () => {
    try {
      const res = await api.get(`/routines/member/${member.id}`)
      setRoutine(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rv-overlay" onClick={onClose}>
      <div className="rv-modal" onClick={e => e.stopPropagation()}>
        <div className="rv-header">
          <div>
            <h2>{routine?.name || 'Rutina'}</h2>
            <p>{member.firstName} {member.lastName}</p>
          </div>
          <div className="rv-header-actions">
            <button className="rv-btn-edit" onClick={onEdit}>✏️ Editar rutina</button>
            <button className="rv-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {loading && <div className="rv-loading"><div className="rv-spinner" /></div>}

        {!loading && !routine && (
          <div className="rv-empty">
            <p>Este miembro no tiene rutina asignada.</p>
            <button className="rv-btn-primary" onClick={onEdit}>+ Crear rutina</button>
          </div>
        )}

        {!loading && routine && (
          <div className="rv-body">
            {routine.description && <p className="rv-description">{routine.description}</p>}
            <div className="rv-days">
              {routine.days.map(day => (
                <div key={day.id} className="rv-day-card">
                  <div className="rv-day-header">
                    <div className="rv-day-number">Día {day.dayNumber}</div>
                    <div className="rv-day-name">{day.name}</div>
                  </div>
                  {day.description && <p className="rv-day-desc">{day.description}</p>}
                  <div className="rv-exercises">
                    {day.exercises.map((ex, i) => (
                      <div key={ex.id} className="rv-exercise">
                        <div className="rv-ex-num">{i + 1}</div>
                        <div className="rv-ex-info">
                          <div className="rv-ex-name">{ex.name}</div>
                          <div className="rv-ex-details">
                            {ex.sets && <span>📊 {ex.sets} series</span>}
                            {ex.reps && <span>🔄 {ex.reps} reps</span>}
                            {ex.weight && <span>⚖️ {ex.weight}</span>}
                            {ex.restSeconds && <span>⏱️ {ex.restSeconds}s descanso</span>}
                          </div>
                          {ex.notes && <div className="rv-ex-notes">💡 {ex.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoutineViewer
