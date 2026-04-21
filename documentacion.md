# 🏦 Backend ERP Bancario - Documentación para Frontend

## 🎯 Objetivo

Este documento está pensado para que **desarrolladores frontend** entiendan cómo consumir la API del sistema ERP Bancario.

Aquí encontrarás:

* endpoints disponibles
* estructura de requests
* estructura de respuestas
* flujo de uso

---

## 🌐 Base URL

```http
http://localhost:3000/api
```

---

## 🔐 Autenticación

### Login

```http
POST /auth/login
```

### Body

```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

### Respuesta

```json
{
  "message": "Login exitoso",
  "token": "JWT_TOKEN"
}
```

📌 El token se debe enviar en todas las demás requests:

```http
Authorization: Bearer TOKEN
```


---

## 🏦 Bancos

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
  "codigo_banco": "BDEMO"
}
```


---

## 👤 Clientes

### Listar

```http
GET /clientes
```

### Crear

```http
POST /clientes
```

```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "dpi": "1234567890101"
}
```


---

## 💳 Cuentas

### Listar cuentas

```http
GET /cuentas
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
  "saldo": 1000
}
```

---

### Movimientos

```http
GET /cuentas/:id/movimientos
```

---

### Estado de cuenta

```http
GET /cuentas/:id/estado-cuenta?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
```


---

## 💰 Transacciones

### Depósito

```http
POST /transacciones/deposito
```

```json
{
  "id_cuenta_destino": 1,
  "monto": 100
}
```

---

### Retiro

```http
POST /transacciones/retiro
```

```json
{
  "id_cuenta_origen": 1,
  "monto": 50
}
```

---

### Transferencia interna

```http
POST /transacciones/transferencia-interna
```

```json
{
  "id_cuenta_origen": 1,
  "id_cuenta_destino": 2,
  "monto": 30
}
```

---

### Transferencia externa (saliente)

```http
POST /transacciones/transferencia-externa
```

```json
{
  "id_cuenta_origen": 1,
  "monto": 100,
  "id_banco_destino": 1,
  "cuenta_destino_externa": "998877"
}
```

---

### Transferencia externa (entrante)

```http
POST /transacciones/transferencia-entrante
```

```json
{
  "id_cuenta_destino": 1,
  "monto": 200,
  "id_banco_origen": 1,
  "cuenta_origen_externa": "123456",
  "codigo_referencia_externa": "REF123"
}
```


---

## 📊 Reportes

### Transacciones

```http
GET /reportes/transacciones?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
```

### Clientes

```http
GET /reportes/clientes
```

### Saldos

```http
GET /reportes/saldos
```


---

## 🔄 Flujo recomendado para frontend

1. Login → guardar token
2. Listar bancos
3. Crear cliente
4. Crear cuenta
5. Hacer depósito
6. Probar transferencias
7. Consultar movimientos
8. Consultar estado de cuenta

---

## ⚠️ Notas importantes

* Todos los endpoints requieren token excepto login
* Los IDs deben ser números
* Las fechas deben ir en formato `YYYY-MM-DD`
* Las transferencias externas pueden fallar si no hay API externa configurada

---

## 🧠 Conclusión

El frontend debe enfocarse en:

* consumir endpoints REST
* manejar token JWT
* mostrar resultados de operaciones
* manejar errores de API

Con esto ya pueden construir:

* dashboard
* formularios
* tablas de movimientos
* reportes

---

🚀 Con esta guía cualquier compañero puede empezar el frontend sin ver el backend
