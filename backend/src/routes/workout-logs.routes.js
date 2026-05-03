// backend/src/routes/workout-logs.routes.js
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authenticate } = require('../middlewares/auth.middleware')

const prisma = new PrismaClient()

// GET /api/workout-logs/:userId — Obtener logs de un usuario
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const logs = await prisma.freeWorkoutLog.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: 'desc' },
    })
    res.json({ success: true, data: logs })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Error al obtener entrenamientos' })
  }
})

// POST /api/workout-logs/free — Crear log de entrenamiento libre
router.post('/free', authenticate, async (req, res) => {
  try {
    const { date, dayName, duration, exercises } = req.body
    const log = await prisma.freeWorkoutLog.create({
      data: {
        userId: req.user.id,
        date: new Date(date),
        dayName: dayName || null,
        duration: duration ? parseInt(duration) : null,
        exercises: exercises || [],
      }
    })
    res.status(201).json({ success: true, data: log })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Error al guardar entrenamiento' })
  }
})

module.exports = router
