// src/controllers/auth.controller.js
const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }
    const result = await authService.login(email, password);
    res.json({ success: true, message: 'Login exitoso', data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, dni, phone, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Email, contraseña, nombre y apellido son requeridos' });
    }

    const validRoles = ['MEMBER', 'TRAINER', 'SUPER_ADMIN'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Rol inválido. Disponibles: ${validRoles.join(', ')}` });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const user = await authService.register({
      email, password, firstName, lastName, dni, phone, role, createdBy: req.user.id
    });

    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: user });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token requerido' });
    const result = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Contraseña actual y nueva son requeridas' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// Super Admin resetea la contraseña de cualquier usuario
const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
    }
    await authService.resetPassword(userId, newPassword);
    res.json({ success: true, message: 'Contraseña reseteada correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { login, register, refresh, logout, changePassword, resetPassword, me };
