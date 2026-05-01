// backend/src/routes/plans.routes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middlewares/auth.middleware');

const prisma = new PrismaClient();

// GET /api/plans
router.get('/', authenticate, async (req, res) => {
  try {
    const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener planes' });
  }
});

module.exports = router;
