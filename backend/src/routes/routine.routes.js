// backend/src/routes/routine.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin, isTrainer } = require('../middlewares/roles.middleware');

const prisma = new PrismaClient();

// ── GET /api/routines/member/:userId — Ver rutina de un miembro
router.get('/member/:userId', authenticate, async (req, res) => {
  try {
    const routine = await prisma.routine.findFirst({
      where: { userId: req.params.userId, isActive: true },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: {
            exercises: { orderBy: { order: 'asc' } },
            workoutLogs: {
              where: { userId: req.params.userId }
            }
          }
        }
      }
    });

    res.json({ success: true, data: routine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener rutina' });
  }
});

// ── POST /api/routines — Crear rutina para un miembro
router.post('/', authenticate, isTrainer, async (req, res) => {
  try {
    const { userId, name, description, days } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ success: false, message: 'userId y name son requeridos' });
    }

    // Desactivar rutina anterior si existe
    await prisma.routine.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });

    // Crear nueva rutina con días y ejercicios
    const routine = await prisma.routine.create({
      data: {
        userId,
        name,
        description,
        isActive: true,
        days: {
          create: (days || []).map((day, index) => ({
            dayNumber: day.dayNumber || index + 1,
            name: day.name,
            description: day.description,
            order: index,
            exercises: {
              create: (day.exercises || []).map((ex, exIndex) => ({
                name: ex.name,
                sets: ex.sets ? parseInt(ex.sets) : null,
                reps: ex.reps || null,
                weight: ex.weight || null,
                restSeconds: ex.restSeconds ? parseInt(ex.restSeconds) : null,
                notes: ex.notes || null,
                order: exIndex,
              }))
            }
          }))
        }
      },
      include: {
        days: {
          orderBy: { dayNumber: 'asc' },
          include: { exercises: { orderBy: { order: 'asc' } } }
        }
      }
    });

    res.status(201).json({ success: true, message: 'Rutina creada correctamente', data: routine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear rutina' });
  }
});

// ── PATCH /api/routines/:id — Editar rutina
router.patch('/:id', authenticate, isTrainer, async (req, res) => {
  try {
    const { name, description } = req.body;
    const routine = await prisma.routine.update({
      where: { id: req.params.id },
      data: { name, description }
    });
    res.json({ success: true, data: routine });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar rutina' });
  }
});

// ── DELETE /api/routines/:id — Eliminar rutina
router.delete('/:id', authenticate, isSuperAdmin, async (req, res) => {
  try {
    await prisma.routine.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Rutina eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar rutina' });
  }
});

// ── POST /api/routines/day/:routineDayId/complete — Marcar día como completado
router.post('/day/:routineDayId/complete', authenticate, async (req, res) => {
  try {
    const { completedAt, notes } = req.body;
    const userId = req.user.id;

    const log = await prisma.workoutLog.upsert({
      where: { userId_routineDayId: { userId, routineDayId: req.params.routineDayId } },
      update: { completedAt: completedAt ? new Date(completedAt) : new Date(), notes },
      create: {
        userId,
        routineDayId: req.params.routineDayId,
        completedAt: completedAt ? new Date(completedAt) : new Date(),
        notes,
      }
    });

    res.json({ success: true, message: 'Día completado registrado', data: log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al registrar día completado' });
  }
});

// ── DELETE /api/routines/day/:routineDayId/complete — Desmarcar día
router.delete('/day/:routineDayId/complete', authenticate, async (req, res) => {
  try {
    await prisma.workoutLog.deleteMany({
      where: { userId: req.user.id, routineDayId: req.params.routineDayId }
    });
    res.json({ success: true, message: 'Día desmarcado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al desmarcar día' });
  }
});

module.exports = router;
