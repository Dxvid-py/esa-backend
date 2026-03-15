# ESA website — Backend API

Backend profesional para la agencia ESA website. Node.js + Express + PostgreSQL.

## Estructura

```
src/
├── controllers/
│   ├── authController.js
│   ├── clientsController.js
│   ├── projectsController.js
│   ├── paymentsController.js
│   ├── renewalsController.js
│   └── dashboardController.js
├── routes/
│   ├── auth.js
│   ├── clients.js
│   ├── projects.js
│   ├── payments.js
│   ├── renewals.js
│   └── dashboard.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js
├── config/
│   ├── database.js
│   └── schema.sql
└── index.js
```

## Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| POST | /api/auth/register | Crear admin (requiere ADMIN_SECRET) |
| GET | /api/auth/me | Info del admin logueado |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/clients | Todos los clientes |
| GET | /api/clients/:id | Un cliente + sus proyectos |
| POST | /api/clients | Crear cliente |
| PUT | /api/clients/:id | Actualizar cliente |
| DELETE | /api/clients/:id | Eliminar cliente |

### Proyectos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/projects | Todos los proyectos |
| GET | /api/projects/:id | Un proyecto + pagos + renovaciones |
| GET | /api/projects/client/:clientId | Proyectos de un cliente |
| POST | /api/projects | Crear proyecto |
| PUT | /api/projects/:id | Actualizar proyecto |
| DELETE | /api/projects/:id | Eliminar proyecto |

### Pagos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/payments | Todos los pagos |
| GET | /api/payments/pending | Pagos pendientes/vencidos |
| POST | /api/payments | Registrar pago |
| PUT | /api/payments/:id | Actualizar pago |

### Renovaciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/renewals | Próximas renovaciones (30 días) |
| GET | /api/renewals/all | Todas las renovaciones |
| POST | /api/renewals | Crear renovación |
| PUT | /api/renewals/:id | Actualizar renovación |
| PATCH | /api/renewals/:id/paid | Marcar como pagada |

### Dashboard
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/dashboard | Stats: clientes, proyectos, ingresos, renovaciones |

---

## Despliegue en Railway

### Paso 1 — Subir a GitHub
1. Crea un repositorio nuevo en GitHub llamado `esa-backend`
2. Sube todos estos archivos

### Paso 2 — Crear proyecto en Railway
1. Ve a railway.app
2. Clic en **New Project**
3. Selecciona **Deploy from GitHub repo**
4. Elige el repo `esa-backend`

### Paso 3 — Agregar PostgreSQL
1. En tu proyecto de Railway, clic en **+ New**
2. Selecciona **Database → PostgreSQL**
3. Railway crea la DB automáticamente

### Paso 4 — Variables de entorno
En Railway → tu servicio → **Variables**, agrega:
```
JWT_SECRET=esa_website_secret_super_largo_2026
ADMIN_SECRET=clave_para_crear_admins
NODE_ENV=production
```
La variable `DATABASE_URL` Railway la agrega automáticamente.

### Paso 5 — Crear el schema
1. En Railway, entra al servicio de PostgreSQL
2. Clic en **Query**
3. Copia y pega el contenido de `src/config/schema.sql`
4. Ejecuta

### Paso 6 — Crear tu primer admin
Haz una petición POST a tu API:
```
POST https://tu-api.railway.app/api/auth/register
Content-Type: application/json

{
  "name": "Emanuel",
  "email": "esawebsite.contacto@gmail.com",
  "password": "tu_contraseña",
  "secret": "clave_para_crear_admins"
}
```

### Paso 7 — Probar
```
GET https://tu-api.railway.app/health
```
Debe responder: `{ "status": "ok", "database": "connected" }`

---

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| DATABASE_URL | Railway la genera automáticamente |
| JWT_SECRET | Cadena larga y aleatoria para firmar tokens |
| ADMIN_SECRET | Clave para crear cuentas de admin |
| PORT | Railway lo asigna automáticamente |
| NODE_ENV | production |
