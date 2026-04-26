// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSuperAdmin } = require('../middlewares/roles.middleware');

// Públicas
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Autenticadas
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);

// Solo Super Admin
router.post('/register', authenticate, isSuperAdmin, authController.register);
router.patch('/reset-password/:userId', authenticate, isSuperAdmin, authController.resetPassword);

module.exports = router;
