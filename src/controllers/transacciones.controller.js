const pool = require("../config/mysql");
const { registrarAuditoria, registrarLog } = require("../services/auditoria.service");

async function listarTransacciones(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM transacciones ORDER BY id_transaccion DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearDeposito(req, res) {
  const conn = await pool.getConnection();

  try {
    const { id_cuenta_destino, monto, descripcion, id_usuario } = req.body;

    await conn.beginTransaction();

    const [[cuenta]] = await conn.query(
      "SELECT * FROM cuentas WHERE id_cuenta = ? FOR UPDATE",
      [id_cuenta_destino]
    );

    if (!cuenta) {
      throw new Error("La cuenta destino no existe");
    }

    const [trx] = await conn.query(
      `INSERT INTO transacciones
      (id_tipo_transaccion, id_cuenta_destino, monto, descripcion, estado, id_usuario)
      VALUES (?, ?, ?, ?, 'COMPLETADA', ?)`,
      [1, id_cuenta_destino, monto, descripcion || "Depósito", id_usuario]
    );

    const saldoAnterior = Number(cuenta.saldo);
    const saldoNuevo = saldoAnterior + Number(monto);

    await conn.query(
      "UPDATE cuentas SET saldo = ? WHERE id_cuenta = ?",
      [saldoNuevo, id_cuenta_destino]
    );

    await conn.query(
      `INSERT INTO movimientos_cuenta
      (id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo)
      VALUES (?, ?, 'CREDITO', ?, ?, ?)`,
      [id_cuenta_destino, trx.insertId, monto, saldoAnterior, saldoNuevo]
    );

    await conn.commit();

    await registrarAuditoria({
      accion: "DEPOSITO",
      entidad: "transacciones",
      entidad_id: trx.insertId,
      detalle: { id_cuenta_destino, monto }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Depósito registrado",
      transaccion_id: trx.insertId
    });

    res.status(201).json({
      message: "Depósito realizado correctamente",
      id_transaccion: trx.insertId
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
}

module.exports = {
  listarTransacciones,
  crearDeposito
};