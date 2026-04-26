# 🏋️ Gym Backend API

Backend para sistema de gestión de gimnasio con Node.js, Express, Prisma y PostgreSQL.

---

## 🚀 Setup paso a paso

### 1. Clonar e instalar dependencias

```bash
cd gym-backend
npm install
```

---

### 2. Crear base de datos en Railway

1. Entrá a [railway.app](https://railway.app) y creá una cuenta
2. **New Project → Deploy PostgreSQL**
3. Una vez creado, hacé clic en la instancia de PostgreSQL
4. Ir a la pestaña **"Variables"** y copiá el valor de `DATABASE_URL`

---

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá el archivo `.env` y pegá tu `DATABASE_URL` de Railway:

```env
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="generá-un-string-aleatorio-largo"
JWT_REFRESH_SECRET="otro-string-aleatorio-diferente"
```

> Para generar secrets seguros podés correr: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

### 4. Generar cliente de Prisma y migrar la base de datos

```bash
# Genera el cliente de Prisma
npm run db:generate

# Crea las tablas en la base de datos
npm run db:migrate
# (cuando te pida nombre de la migración, escribí: "init")
```

---

### 5. Seed: crear datos iniciales

```bash
npm run db:seed
```

Esto crea:
- ✅ **Super Admin** → `admin@gimnasio.com` / `Admin1234!`
- ✅ Tres planes de ejemplo (Mensual, Trimestral, Anual)

---

### 6. Levantar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor corre en `http://localhost:3000`

---

## 📡 Endpoints disponibles

### Auth
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Público | Iniciar sesión |
| POST | `/api/auth/logout` | Autenticado | Cerrar sesión |
| POST | `/api/auth/refresh` | Público | Renovar access token |
| GET | `/api/auth/me` | Autenticado | Ver perfil propio |
| POST | `/api/auth/register` | Super Admin | Crear nuevo usuario |
| POST | `/api/auth/change-password` | Autenticado | Cambiar contraseña |

### Usuarios
| Método | Endpoint | Acceso | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/users` | Super Admin | Listar usuarios |
| GET | `/api/users/:id` | Trainer+ | Ver usuario |
| PATCH | `/api/users/:id` | Super Admin | Editar usuario |
| POST | `/api/users/:id/plan` | Super Admin | Asignar plan |

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <access_token>
```

El access token expira en **15 minutos**. Usar el refresh token para renovarlo.

---

## 👥 Roles

| Rol | Descripción |
|-----|-------------|
| `SUPER_ADMIN` | Acceso total a la plataforma |
| `TRAINER` | Puede crear y asignar rutinas |
| `MEMBER` | Puede ver su plan, rutina y registrar entrenamientos |

---

## 🗂️ Estructura del proyecto

```
gym-backend/
├── prisma/
│   ├── schema.prisma      # Modelos de base de datos
│   └── seed.js            # Datos iniciales
├── src/
│   ├── controllers/       # Lógica de request/response
│   ├── middlewares/       # Auth y roles
│   ├── routes/            # Definición de rutas
│   ├── services/          # Lógica de negocio
│   └── app.js             # Configuración de Express
├── .env.example
└── server.js
```
