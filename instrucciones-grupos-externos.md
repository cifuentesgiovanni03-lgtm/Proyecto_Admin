# Instrucciones para grupos externos

## 1. Endpoint público — Consultar cuentas disponibles

```
GET https://proyectoadmin-production.up.railway.app/api/public/cuentas-disponibles
```

No requiere token ni autenticación.

**Respuesta ejemplo:**
```json
{
  "banco": "ERP Bancario",
  "total_cuentas": 3,
  "cuentas": [
    {
      "id_cuenta": 1,
      "numero_cuenta": "10001",
      "moneda": "Q",
      "titular": "Giovanni Cifuentes",
      "tipo_cuenta": "AHORRO"
    }
  ]
}
```

Usá `id_cuenta` como destino al enviar transferencias entrantes.

---

## 2. Enviar transferencia entrante (sin autenticación)

```
POST https://proyectoadmin-production.up.railway.app/api/transacciones/transferencia-entrante
Content-Type: application/json
```

**Body:**
```json
{
  "id_cuenta_destino": 1,
  "monto": 500,
  "id_banco_origen": 2,
  "cuenta_origen_externa": "AH260505118225",
  "titular_origen": "Luis Contreras",
  "codigo_referencia_externa": "REF-UNICO-010"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id_cuenta_destino` | number | sí | ID de la cuenta destino (del endpoint de arriba) |
| `monto` | number | sí | Monto a transferir (> 0) |
| `id_banco_origen` | number | sí | ID del banco de origen (obtenido de su integración) |
| `cuenta_origen_externa` | string | sí | Número de cuenta de origen en su sistema |
| `titular_origen` | string | no | Nombre del titular de origen |
| `codigo_referencia_externa` | string | sí | Código único de referencia (idempotencia — no se aceptan duplicados) |

**Respuesta éxito (201):**
```json
{
  "message": "Transferencia externa entrante registrada correctamente",
  "id_transaccion": 27,
  "id_transferencia_entrante": 5,
  "banco_origen": "ERP Bancario",
  "saldo_nuevo": 2500.00
}
```

**Respuesta error (400/500):**
```json
{
  "message": "La referencia externa ya fue procesada anteriormente"
}
```

---

## 3. Reglas importantes

- `codigo_referencia_externa` debe ser **único por transferencia**. Si se reenvía el mismo código, se rechaza con error de duplicado. Usá un UUID, timestamp+secuencia, o similar.
- `monto` debe ser mayor a 0.
- La cuenta destino (`id_cuenta_destino`) debe existir y estar activa.
- No se necesita token, API key ni firma HMAC — el control de duplicados está en `codigo_referencia_externa`.
