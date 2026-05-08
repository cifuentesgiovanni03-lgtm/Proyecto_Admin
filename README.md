# 🏦 ERP Bancario - Backend API

Sistema backend de un ERP bancario con Node.js, Express, MySQL y MongoDB. Proyecto universitario para simular operaciones bancarias entre diferentes grupos.

## 🚀 Tecnologías

- **Node.js** + **Express** — Servidor API REST
- **MySQL** — Datos relacionales (clientes, cuentas, transacciones, usuarios)
- **MongoDB** — Auditoría y logs del sistema
- **JWT** — Autenticación
- **Docker** — Contenedorización

## 📋 Funcionalidades

- CRUD completo de Usuarios, Roles, Permisos, Clientes, Cuentas y Bancos
- Autenticación JWT con control de roles
- Transacciones: depósitos, retiros, transferencias internas
- Transferencias externas (salientes y entrantes) entre distintos bancos/grupos
- Reportes de transacciones, clientes y saldos
- Auditoría en MongoDB
- API pública para integración con otros grupos

## ⚙️ Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
#    Editar el archivo .env con tus datos de conexión
```

### Variables de entorno (`.env`)

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secreto_jwt

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=tu_password
MYSQL_DATABASE=erp_bancario

MONGO_URI=mongodb://localhost:27017/erp_bancario_logs
MONGO_DB_NAME=erp_bancario_logs

API_EXTERNA_URL=https://api-del-otro-banco.com/transferencias
API_EXTERNA_TOKEN=token_si_aplica
```

### Base de datos

Ejecutar el script SQL ubicado en `Base de datos y colecciones.txt` para crear las tablas en MySQL y las colecciones en MongoDB.

## ▶️ Ejecución

```bash
# Modo desarrollo (con nodemon, reinicio automático)
npm run dev

# Modo producción
npm start
```

El servidor iniciará en `http://localhost:3000`.

## 📚 Documentación de la API

La documentación completa de todos los endpoints está en [`documentacion.md`](./documentacion.md).

### Resumen de rutas

| Recurso | Métodos |
|---|---|
| `/api/auth/login` | `POST` |
| `/api/usuarios` | `GET`, `POST`, `PUT /:id`, `PUT /:id/password`, `DELETE /:id` |
| `/api/roles` | `GET`, `POST`, `PUT /:id`, `DELETE /:id`, `POST /:id/permisos` |
| `/api/permisos` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/bancos` | `GET`, `POST` |
| `/api/clientes` | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id` |
| `/api/cuentas` | `GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`, `GET /:id/movimientos`, `GET /:id/estado-cuenta` |
| `/api/transacciones` | `GET`, `POST /deposito`, `POST /retiro`, `POST /transferencia-interna`, `POST /transferencia-externa`, `POST /transferencia-entrante` |
| `/api/reportes` | `GET /transacciones`, `GET /clientes`, `GET /saldos` |
| `/api/public/cuentas-disponibles` | `GET` (público) |

## 🔗 API para integración con otros grupos

Endpoints públicos para que otros grupos envíen transferencias:

```http
# Ver cuentas disponibles para recibir transferencias
GET /api/public/cuentas-disponibles

# Realizar una transferencia entrante
POST /api/transacciones/transferencia-entrante
Content-Type: application/json

{
  "id_cuenta_destino": 1,
  "monto": 500,
  "id_banco_origen": 2,
  "cuenta_origen_externa": "123456",
  "titular_origen": "Juan Perez",
  "codigo_referencia_externa": "REF-UNICO-001"
}
```

## 📁 Estructura del proyecto

```
├── frontend/              # Frontend de prueba (HTML+CSS+JS)
├── src/
│   ├── app.js             # Punto de entrada
│   ├── config/            # Conexión a MySQL y MongoDB
│   ├── controllers/       # Controladores (lógica de endpoints)
│   ├── middlewares/       # Autenticación y autorización
│   ├── models/            # Modelos (acceso a datos)
│   ├── routes/            # Definición de rutas
│   └── services/          # Servicios (auditoría, reportes)
├── documentacion.md       # Documentación detallada de la API
├── Base de datos y colecciones.txt
├── tablas mysql y mongodb.txt
├── Dockerfile
└── package.json
```

## 👥 Roles del sistema

| Rol | Acceso |
|---|---|
| `ADMINISTRADOR` | Acceso total al sistema |
| `OPERADOR` | Gestión operativa |
| `CAJERO` | Registro de operaciones básicas |

## 🧪 Frontend de prueba

Se incluye un frontend básico en la carpeta `frontend/` para probar la API. Abrir `frontend/index.html` en el navegador.

## 📄 Licencia

Proyecto académico.
