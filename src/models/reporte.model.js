const pool = require("../config/mysql");

async function getTransaccionesByDateRange(fecha_inicio, fecha_fin) {
  const [rows] = await pool.query(
    `SELECT
        t.id_transaccion, t.monto, t.moneda, t.descripcion, t.estado, t.fecha_transaccion,
        tt.nombre AS tipo_transaccion
     FROM transacciones t
     INNER JOIN tipos_transaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
     WHERE DATE(t.fecha_transaccion) BETWEEN ? AND ?
     ORDER BY t.fecha_transaccion DESC`,
    [fecha_inicio, fecha_fin]
  );
  return rows;
}

async function getClientesConCuentas() {
  const [rows] = await pool.query(
    `SELECT
        c.id_cliente, c.nombres, c.apellidos, c.dpi, c.correo, c.telefono,
        COUNT(ct.id_cuenta) AS total_cuentas
     FROM clientes c
     LEFT JOIN cuentas ct ON c.id_cliente = ct.id_cliente
     GROUP BY c.id_cliente
     ORDER BY c.id_cliente DESC`
  );
  return rows;
}

async function getResumenSaldos() {
  const [rows] = await pool.query(
    `SELECT
        c.id_cuenta, c.numero_cuenta, c.saldo, c.moneda, c.estado,
        cl.nombres, cl.apellidos
     FROM cuentas c
     INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
     ORDER BY c.saldo DESC`
  );
  return rows;
}

module.exports = {
  getTransaccionesByDateRange,
  getClientesConCuentas,
  getResumenSaldos
};
