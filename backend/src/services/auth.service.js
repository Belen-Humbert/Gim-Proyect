// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Credenciales inválidas' };
  if (!user.isActive) throw { status: 403, message: 'Tu cuenta está desactivada. Contactá al administrador.' };

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw { status: 401, message: 'Credenciales inválidas' };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await saveRefreshToken(user.id, refreshToken);

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

const register = async ({ email, password, firstName, lastName, dni, phone, role, createdBy }) => {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw { status: 409, message: 'Ya existe un usuario con ese email' };

  if (dni) {
    const existingDni = await prisma.user.findUnique({ where: { dni } });
    if (existingDni) throw { status: 409, message: 'Ya existe un usuario con ese DNI' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      dni: dni || null,
      phone: phone || null,
      role: role || 'MEMBER',
      createdBy,
    }
  });

  if (user.role === 'TRAINER') {
    await prisma.trainer.create({ data: { userId: user.id } });
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const refreshAccessToken = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw { status: 401, message: 'Refresh token inválido o expirado' };
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw { status: 401, message: 'Refresh token inválido o expirado' };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || !user.isActive) throw { status: 401, message: 'Usuario no válido' };

  return { accessToken: generateAccessToken(user) };
};

const logout = async (refreshToken) => {
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw { status: 400, message: 'La contraseña actual es incorrecta' };
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};

const resetPassword = async (targetUserId, newPassword) => {
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: targetUserId }, data: { password: hashed } });
};

module.exports = { login, register, refreshAccessToken, logout, changePassword, resetPassword };
