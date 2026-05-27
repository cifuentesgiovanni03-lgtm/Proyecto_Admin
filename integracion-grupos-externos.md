# Integracion con Grupos Externos (ACH / otros bancos)

## Arquitectura

Cada banco en el modulo **Bancos** puede tener su propia configuracion de API externa. Cuando realizas una transferencia externa saliente, el backend ejecuta automaticamente este flujo:

1. **Login** (si el banco tiene `api_auth_url`) → obtiene token JWT
2. **Validar cuenta destino** (si el banco tiene `api_account_search_url`) → verifica que la cuenta exista
3. **Enviar transferencia** al endpoint `api_url` con el `api_json_template`

Si un banco no tiene configuracion de API, se usa la variable de entorno `API_EXTERNA_URL` (compatibilidad hacia atras).

---

## Configurar un banco para integracion ACH

### SQL

```sql
ALTER TABLE bancos
  ADD COLUMN api_url VARCHAR(500) NULL AFTER pais,
  ADD COLUMN api_token VARCHAR(500) NULL AFTER api_url,
  ADD COLUMN api_json_template TEXT NULL AFTER api_token,
  ADD COLUMN api_auth_url VARCHAR(500) NULL AFTER api_json_template,
  ADD COLUMN api_auth_email VARCHAR(200) NULL AFTER api_auth_url,
  ADD COLUMN api_auth_password VARCHAR(500) NULL AFTER api_auth_email,
  ADD COLUMN api_account_search_url VARCHAR(500) NULL AFTER api_auth_password;
```

### Ejemplo: Grupo ACH con login JWT y validacion de cuenta

| Campo | Valor | Descripcion |
|---|---|---|
| `nombre` | Grupo ACH Externo | Nombre del grupo |
| `codigo_banco` | GRUPO_ACH | Codigo unico |
| `api_url` | `http://157.137.186.211:5254/api/external/ach/transferencias` | Endpoint para enviar transferencia |
| `api_token` | (dejar vacio) | Se obtendra via login |
| `api_auth_url` | `http://157.137.186.211:5254/api/external/auth/login` | Endpoint de login |
| `api_auth_email` | `bancoexterno@grupoadmin.com` | Email para autenticacion |
| `api_auth_password` | `Guate123*` | Contraseña para autenticacion |
| `api_account_search_url` | `http://157.137.186.211:5254/api/external/ach/cuentas/search/{{numero_cuenta}}` | URL para validar cuenta destino |
| `api_json_template` | `{"codigo_confirmacion":"{{referencia_interna}}","banco_externo":"{{banco_externo}}","cuenta_externa":"{{cuenta_destino_externa}}","numeroCuentaDestino":"{{cuenta_destino_externa}}","monto":{{monto}},"moneda":"{{moneda}}","referencia":"{{descripcion}}","tipo":"entrante"}` | Template del body |

---

## Placeholders disponibles en `api_json_template`

| Placeholder | Se reemplaza por |
|---|---|
| `{{monto}}` | Monto de la transferencia (numero) |
| `{{cuenta_destino_externa}}` | Numero de cuenta destino externa |
| `{{titular_destino}}` | Nombre del titular destino |
| `{{referencia_interna}}` | Codigo de referencia interno (unico, generado automaticamente) |
| `{{moneda}}` | Moneda de la cuenta origen |
| `{{descripcion}}` | Descripcion de la transferencia |
| `{{banco_externo}}` | Nombre del banco externo (campo `api_externa_nombre`) |

---

## Como consumir desde el frontend

### 1. Crear el banco con la configuracion ACH

En la seccion **Bancos**, llenar todos los campos:
- Nombre, Codigo, Pais
- **API URL**: URL del endpoint de transferencias del otro grupo
- **API Token**: token fijo (si no requiere login dinamico)
- **Auth URL**: URL de login (si requiere JWT dinamico)
- **Auth email / password**: credenciales para login
- **Account search URL template**: URL con `{{numero_cuenta}}` para validar
- **JSON template**: body de la transferencia con placeholders

### 2. Validar cuenta antes de transferir

En el formulario de **Transferencia Externa**:
1. Selecciona el banco destino y escribe el numero de cuenta
2. Haz clic en **Validar Cuenta** — el frontend consulta la API del grupo externo para confirmar que la cuenta existe
3. Si la validacion es exitosa, procede a enviar la transferencia

### 3. Enviar transferencia

El backend automaticamente:
1. Hara login si el banco tiene `api_auth_url`
2. Validara la cuenta si el banco tiene `api_account_search_url`
3. Enviara la transferencia con el template configurado

---

## API endpoints del backend (bancos)

### GET /api/bancos
Lista todos los bancos (sin contraseñas).

### GET /api/bancos/:id_banco
Obtiene detalle completo del banco (incluye campos de configuracion).

### POST /api/bancos
Crea un banco. Body:
```json
{
  "nombre": "Grupo ACH Externo",
  "codigo_banco": "GRUPO_ACH",
  "pais": "Guatemala",
  "api_url": "http://157.137.186.211:5254/api/external/ach/transferencias",
  "api_token": null,
  "api_json_template": "{\"codigo_confirmacion\":\"{{referencia_interna}}\",...}",
  "api_auth_url": "http://157.137.186.211:5254/api/external/auth/login",
  "api_auth_email": "bancoexterno@grupoadmin.com",
  "api_auth_password": "Guate123*",
  "api_account_search_url": "http://157.137.186.211:5254/api/external/ach/cuentas/search/{{numero_cuenta}}"
}
```

### PUT /api/bancos/:id_banco
Actualiza un banco.

### DELETE /api/bancos/:id_banco
Elimina un banco.

---

## Flujo completo (backend - transaccion.model.js)

```
crearTransferenciaExterna()
  │
  ├─ 1. Validar cuenta origen (saldo suficiente)
  ├─ 2. Crear transaccion en estado PROCESANDO
  ├─ 3. Debitar saldo de cuenta origen
  ├─ 4. Registrar movimiento DEBITO
  ├─ 5. Generar referencia interna unica
  ├─ 6. Insertar registro en transferencias_externas
  │
  ├─ 7. SI banco tiene api_auth_url:
  │      └─ POST login con email/password → obtiene token JWT
  │
  ├─ 8. SI banco tiene api_account_search_url:
  │      └─ GET {{numero_cuenta}} con Bearer token → valida cuenta
  │
  ├─ 9. SI banco tiene api_json_template:
  │      └─ Reemplazar placeholders → body final
  │     SINO:
  │      └─ Usar body por defecto
  │
  ├─ 10. POST a api_url con body y token
  │
  ├─ 11. SI exito: estado = COMPLETADA / CONFIRMADA
  │      SI falla: revertir saldo y eliminar movimiento
  │
  └─ 12. Actualizar registro en transferencias_externas
```
