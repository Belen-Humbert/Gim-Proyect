// src/middlewares/roles.middleware.js

/**
 * Middleware de autorización por roles.
 * Uso: authorizeRoles('SUPER_ADMIN', 'TRAINER')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

// Shortcuts para roles específicos
const isSuperAdmin = authorizeRoles('SUPER_ADMIN');
const isTrainer = authorizeRoles('SUPER_ADMIN', 'TRAINER');
const isMember = authorizeRoles('SUPER_ADMIN', 'TRAINER', 'MEMBER');

module.exports = { authorizeRoles, isSuperAdmin, isTrainer, isMember };
