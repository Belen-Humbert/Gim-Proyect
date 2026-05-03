// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin, isTrainer } = require('../middlewares/roles.middleware');

const prisma = new PrismaClient();

// GET /api/users — Super Admin: listar todos los usuarios
router.get('/', authenticate, isTrainer, async (req, res) => {
  try {
    const { role, isActive } = req.query;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dni: true,
        role: true,
        isActive: true,
        phone: true,
        createdAt: true,
        userPlan: {
          include: { plan: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});

// GET /api/users/:id — Ver usuario específico
router.get('/:id', authenticate, isTrainer, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
         dni: true,
        role: true,
        isActive: true,
        phone: true,
        createdAt: true,
        userPlan: { include: { plan: true } },
        userRoutines: {
          where: { isActive: true },
          include: { routine: { include: { exercises: true } } }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
});

// PATCH /api/users/:id — Actualizar usuario (Super Admin)
router.patch('/:id', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, phone, dni, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, dni, isActive },
      select: {
        id: true, email: true, firstName: true,
        lastName: true, role: true, isActive: true
      }
    });

    res.json({ success: true, message: 'Usuario actualizado', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
});

// POST /api/users/:id/plan — Asignar/renovar plan (Super Admin)
router.post('/:id/plan', authenticate, isSuperAdmin, async (req, res) => {
  try {
    const { planId, startDate, paidAt, notes } = req.body;

    if (!planId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'planId y startDate son requeridos'
      });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan no encontrado' });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    // Upsert: crear o actualizar plan del usuario
    const userPlan = await prisma.userPlan.upsert({
      where: { userId: req.params.id },
      update: {
        planId,
        status: 'ACTIVE',
        startDate: start,
        endDate: end,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        notes,
      },
      create: {
        userId: req.params.id,
        planId,
        status: 'ACTIVE',
        startDate: start,
        endDate: end,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        notes,
      },
      include: { plan: true }
    });

    res.json({ success: true, message: 'Plan asignado correctamente', data: userPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al asignar plan' });
  }
});

router.delete('/:id', authenticate, isSuperAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
