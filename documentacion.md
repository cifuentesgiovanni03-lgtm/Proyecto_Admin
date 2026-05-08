# Backend ERP Bancario - Documentacion para Frontend

## Objetivo

Este documento esta pensado para que **desarrolladores frontend** entiendan como consumir la API del sistema ERP Bancario y para que **otros grupos** puedan integrarse para transferencias externas.

---

## Base URL

```http
http://localhost:3000/api
```

---

## Autenticacion

### Login

```http
POST /auth/login
```

Body:
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

Respuesta:
```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN"
}
```

El token se envia en todas las demas requests:

```http
Authorization: Bearer TOKEN
```

---

## Usuarios (CRUD completo)

Requiere rol `ADMINISTRADOR`.

### Listar usuarios
```http
GET /usuarios
```

### Obtener usuario por ID
```http
GET /usuarios/:id
```

### Crear usuario
```http
POST /usuarios
```
```json
{
  "username": "operador1",
  "password": "Pass1234",
  "nombre_completo": "Operador Uno",
  "correo": "operador1@email.com",
  "id_rol": 2
}
```

### Actualizar usuario
```http
PUT /usuarios/:id
```
```json
{
  "nombre_completo": "Nuevo Nombre",
  "correo": "nuevo@email.com",
  "id_rol": 2,
  "estado": "ACTIVO"
}
```

### Cambiar contrasena
```http
PUT /usuarios/:id/password
```
```json
{
  "password": "NuevaPass123"
}
```

### Eliminar usuario
```http
DELETE /usuarios/:id
```

---

## Roles

Requiere rol `ADMINISTRADOR`.

### Listar roles (con sus permisos asignados)
```http
GET /roles
```

### Crear rol
```http
POST /roles
```
```json
{
  "nombre": "CAJERO",
  "descripcion": "Registro de operaciones"
}
```

### Actualizar rol
```http
PUT /roles/:id
```
```json
{
  "nombre": "CAJERO_SENIOR",
  "descripcion": "Cajero con mas permisos"
}
```

### Eliminar rol
```http
DELETE /roles/:id
```

### Asignar permisos a un rol
```http
POST /roles/:id/permisos
```
```json
{
  "permisos": [1, 2, 3]
}
```

---

## Permisos

Requiere rol `ADMINISTRADOR`.

### Listar permisos
```http
GET /permisos
```

### Crear permiso
```http
POST /permisos
```
```json
{
  "nombre": "ELIMINAR_CUENTA",
  "descripcion": "Permite eliminar cuentas"
}
```

### Actualizar permiso
```http
PUT /permisos/:id
```
```json
{
  "nombre": "ELIMINAR_CUENTA",
  "descripcion": "Nueva descripcion"
}
```

### Eliminar permiso
```http
DELETE /permisos/:id
```

---

## Bancos

### Listar bancos
```http
GET /bancos
```

### Crear banco
```http
POST /bancos
```
```json
{
  "nombre": "Banco Demo",
  "codigo_banco": "BDEMO",
  "pais": "Guatemala"
}
```

---

## Clientes (CRUD completo)

### Listar
```http
GET /clientes
```

### Obtener por ID
```http
GET /clientes/:id
```

### Crear
```http
POST /clientes
```
```json
{
  "nombres": "Juan",
  "apellidos": "Perez",
  "dpi": "1234567890101",
  "nit": "1234567-8",
  "telefono": "55550101",
  "correo": "juan@email.com",
  "direccion": "Ciudad"
}
```

### Actualizar
```http
PUT /clientes/:id
```
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Perez Lopez",
  "dpi": "1234567890101",
  "telefono": "55550202",
  "correo": "juancarlos@email.com"
}
```

### Eliminar
```http
DELETE /clientes/:id
```

---

## Cuentas (CRUD completo)

### Listar cuentas (con datos del cliente y tipo)
```http
GET /cuentas
```

### Obtener cuenta por ID
```http
GET /cuentas/:id
```

### Crear cuenta
```http
POST /cuentas
```
```json
{
  "numero_cuenta": "10001",
  "id_cliente": 1,
  "id_tipo_cuenta": 1,
  "saldo": 1000,
  "moneda": "GTQ"
}
```

Tipos de cuenta: `1 = AHORRO`, `2 = CORRIENTE`.

### Actualizar cuenta
```http
PUT /cuentas/:id
```
```json
{
  "id_tipo_cuenta": 2,
  "moneda": "USD",
  "estado": "ACTIVA"
}
```

### Eliminar cuenta
```http
DELETE /cuentas/:id
```

### Movimientos de cuenta
```http
GET /cuentas/:id/movimientos
```

### Estado de cuenta
```http
GET /cuentas/:id/estado-cuenta?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
```

---

## Transacciones

### Deposito
```http
POST /transacciones/deposito
```
```json
{
  "id_cuenta_destino": 1,
  "monto": 100,
  "descripcion": "Deposito en efectivo"
}
```

### Retiro
```http
POST /transacciones/retiro
```
```json
{
  "id_cuenta_origen": 1,
  "monto": 50,
  "descripcion": "Retiro cajero"
}
```

### Transferencia interna (mismo banco)
```http
POST /transacciones/transferencia-interna
```
```json
{
  "id_cuenta_origen": 1,
  "id_cuenta_destino": 2,
  "monto": 30,
  "descripcion": "Transferencia entre cuentas"
}
```

### Transferencia externa (saliente hacia otro banco)
```http
POST /transacciones/transferencia-externa
```
```json
{
  "id_cuenta_origen": 1,
  "monto": 100,
  "api_externa_nombre": "BANCO_GRUPO2",
  "id_banco_destino": 2,
  "cuenta_destino_externa": "998877",
  "titular_destino": "Maria Lopez",
  "descripcion": "Pago a grupo 2"
}
```

---

## API para otros grupos (Transferencia entrante)

Este es el **endpoint que debes compartir** con los otros grupos para que puedan transferirte dinero a cuentas de tu sistema.

### Consultar cuentas disponibles (publico, sin token)

El otro grupo puede ver que cuentas estan activas y disponibles para recibir transferencias:

```http
GET /api/public/cuentas-disponibles
```

Sin headers de autenticacion. Respuesta:
```json
{
  "banco": "ERP Bancario",
  "total_cuentas": 2,
  "cuentas": [
    {
      "id_cuenta": 1,
      "numero_cuenta": "10001",
      "moneda": "GTQ",
      "titular": "Juan Perez",
      "tipo_cuenta": "AHORRO"
    },
    {
      "id_cuenta": 2,
      "numero_cuenta": "10002",
      "moneda": "GTQ",
      "titular": "Maria Lopez",
      "tipo_cuenta": "CORRIENTE"
    }
  ]
}
```

### Realizar transferencia entrante (publico, sin token)

```http
POST /api/transacciones/transferencia-entrante
```

Headers:
```http
Content-Type: application/json
```

Body:
```json
{
  "id_cuenta_destino": 1,
  "monto": 500,
  "id_banco_origen": 2,
  "cuenta_origen_externa": "123456",
  "titular_origen": "Juan Perez",
  "codigo_referencia_externa": "REF-UNICO-001",
  "descripcion": "Transferencia del grupo 2"
}
```

### Campos obligatorios
| Campo | Descripcion |
|---|---|
| `id_cuenta_destino` | ID de la cuenta en **tu sistema** a la que quieren depositar |
| `monto` | Monto a transferir |
| `id_banco_origen` | ID del banco que creaste en tu modulo de Bancos para ese grupo |
| `cuenta_origen_externa` | Numero de cuenta de origen en el sistema del otro grupo |
| `codigo_referencia_externa` | Codigo unico de referencia (el sistema rechaza duplicados automaticamente) |

### Respuesta exitosa
```json
{
  "message": "Transferencia externa entrante registrada correctamente",
  "id_transaccion": 15,
  "id_transferencia_entrante": 3,
  "banco_origen": "Grupo 2 - Banco",
  "saldo_nuevo": 2500.00
}
```

### Notas importantes para la integracion
- El endpoint `POST /transferencia-entrante` es **publico** (no requiere token)
- El endpoint `GET /api/public/cuentas-disponibles` tambien es **publico**
- El `codigo_referencia_externa` debe ser **unico** por transferencia (se puede usar un UUID)
- El otro grupo tambien debe exponer un endpoint similar para que **tu** puedas transferirles usando `POST /transacciones/transferencia-externa`

---

## Reportes

### Reporte de transacciones por fecha
```http
GET /reportes/transacciones?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
```

### Reporte de clientes (con total de cuentas)
```http
GET /reportes/clientes
```

### Resumen de saldos
```http
GET /reportes/saldos
```

---

## Roles de acceso

| Rol | Acceso |
|---|---|
| `ADMINISTRADOR` | Acceso total al sistema |
| `OPERADOR` | Gestion operativa (crear, editar) |
| `CAJERO` | Registro de operaciones basicas |

Tambien se pueden crear **roles personalizados** con permisos especificos via `POST /roles` y `POST /roles/:id/permisos`.

---

## Notas importantes

- Todos los endpoints requieren token **excepto** `POST /auth/login`, `POST /transacciones/transferencia-entrante` y `GET /api/public/cuentas-disponibles`
- Los IDs deben ser numeros
- Las fechas deben ir en formato `YYYY-MM-DD`
- Las transferencias externas pueden fallar si la API del otro banco no esta disponible
- El `codigo_referencia_externa` es **unique** y no se puede reutilizar
- Roles disponibles por defecto: `1 = ADMINISTRADOR`, `2 = OPERADOR`, `3 = CAJERO`
- Tipos de cuenta: `1 = AHORRO`, `2 = CORRIENTE`
