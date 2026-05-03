// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const planRoutes = require('./routes/plans.routes');
const routineRoutes = require('./routes/routine.routes');
const workoutLogsRoutes = require('./routes/workout-logs.routes')

const app = express();

// ─────────────────────────────────────────
// MIDDLEWARES GLOBALES
// ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ─────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/workout-logs', workoutLogsRoutes)
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────
// MANEJO DE ERRORES GLOBAL
// ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

module.exports = app;
