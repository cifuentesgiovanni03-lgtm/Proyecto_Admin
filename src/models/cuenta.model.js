const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
    `SELECT c.id_cuenta, c.numero_cuenta, c.saldo, c.moneda, c.estado,
            cl.nombres, cl.apellidos, tc.nombre AS tipo_cuenta
     FROM cuentas c
     INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
     INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
     ORDER BY c.id_cuenta DESC`
  );
  return rows;
}

async function findByIdSimple(id_cuenta) {
  const [rows] = await pool.query(
    "SELECT * FROM cuentas WHERE id_cuenta = ?",
    [id_cuenta]
  );
  return rows[0] || null;
}

async function create(data) {
  const { numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda } = data;

  const [result] = await pool.query(
    `INSERT INTO cuentas
     (numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda)
     VALUES (?, ?, ?, ?, ?)`,
    [numero_cuenta, id_cliente, id_tipo_cuenta, saldo || 0, moneda || "GTQ"]
  );
  return result.insertId;
}

async function updateDatos(id_cuenta, data) {
  const { numero_cuenta, id_tipo_cuenta, moneda, estado } = data;

  await pool.query(
    `UPDATE cuentas
     SET numero_cuenta = ?, id_tipo_cuenta = ?, moneda = ?, estado = ?
     WHERE id_cuenta = ?`,
    [numero_cuenta, id_tipo_cuenta, moneda, estado, id_cuenta]
  );
}

async function deleteById(id_cuenta) {
  const [result] = await pool.query(
    "DELETE FROM cuentas WHERE id_cuenta = ?",
    [id_cuenta]
  );
  return result.affectedRows > 0;
}

async function findById(id_cuenta) {
  const [rows] = await pool.query(
    `SELECT
        c.id_cuenta, c.numero_cuenta, c.saldo, c.moneda, c.estado, c.fecha_apertura,
        cl.id_cliente, cl.nombres, cl.apellidos, cl.dpi,
        tc.nombre AS tipo_cuenta
     FROM cuentas c
     INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
     INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
     WHERE c.id_cuenta = ?`,
    [id_cuenta]
  );
  return rows[0] || null;
}

async function findByIdForUpdate(conn, id_cuenta) {
  const [rows] = await conn.query(
    `SELECT * FROM cuentas
     WHERE id_cuenta = ? AND estado = 'ACTIVA'
     FOR UPDATE`,
    [id_cuenta]
  );
  return rows[0] || null;
}

async function updateSaldo(conn, id_cuenta, nuevoSaldo) {
  await conn.query(
    "UPDATE cuentas SET saldo = ? WHERE id_cuenta = ?",
    [nuevoSaldo, id_cuenta]
  );
}

async function getMovimientos(id_cuenta) {
  const [movimientos] = await pool.query(
    `SELECT
        mc.id_movimiento, mc.id_transaccion, mc.tipo_movimiento, mc.monto,
        mc.saldo_anterior, mc.saldo_nuevo, mc.fecha_movimiento,
        t.descripcion, t.estado AS estado_transaccion, tt.nombre AS tipo_transaccion
     FROM movimientos_cuenta mc
     INNER JOIN transacciones t ON mc.id_transaccion = t.id_transaccion
     INNER JOIN tipos_transaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
     WHERE mc.id_cuenta = ?
     ORDER BY mc.fecha_movimiento DESC, mc.id_movimiento DESC`,
    [id_cuenta]
  );
  return movimientos;
}

async function getMovimientosByDateRange(id_cuenta, fecha_inicio, fecha_fin) {
  const [movimientos] = await pool.query(
    `SELECT
        mc.id_movimiento, mc.id_transaccion, mc.tipo_movimiento, mc.monto,
        mc.saldo_anterior, mc.saldo_nuevo, mc.fecha_movimiento,
        t.descripcion, t.estado AS estado_transaccion, tt.nombre AS tipo_transaccion
     FROM movimientos_cuenta mc
     INNER JOIN transacciones t ON mc.id_transaccion = t.id_transaccion
     INNER JOIN tipos_transaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
     WHERE mc.id_cuenta = ?
       AND DATE(mc.fecha_movimiento) BETWEEN ? AND ?
     ORDER BY mc.fecha_movimiento ASC, mc.id_movimiento ASC`,
    [id_cuenta, fecha_inicio, fecha_fin]
  );
  return movimientos;
}

async function insertMovimiento(conn, data) {
  const { id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo } = data;

  await conn.query(
    `INSERT INTO movimientos_cuenta
     (id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo]
  );
}

async function deleteMovimientosByTransaccionId(conn, id_transaccion) {
  await conn.query(
    "DELETE FROM movimientos_cuenta WHERE id_transaccion = ?",
    [id_transaccion]
  );
}

module.exports = {
  findAll,
  findByIdSimple,
  create,
  updateDatos,
  deleteById,
  findById,
  findByIdForUpdate,
  updateSaldo,
  getMovimientos,
  getMovimientosByDateRange,
  insertMovimiento,
  deleteMovimientosByTransaccionId
};
