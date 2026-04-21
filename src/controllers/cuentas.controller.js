const pool = require("../config/mysql");

async function listarCuentas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id_cuenta, c.numero_cuenta, c.saldo, c.moneda, c.estado,
              cl.nombres, cl.apellidos, tc.nombre AS tipo_cuenta
       FROM cuentas c
       INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
       INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
       ORDER BY c.id_cuenta DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearCuenta(req, res) {
  try {
    const { numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda } = req.body;

    const [result] = await pool.query(
      `INSERT INTO cuentas
      (numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda)
      VALUES (?, ?, ?, ?, ?)`,
      [numero_cuenta, id_cliente, id_tipo_cuenta, saldo || 0, moneda || "GTQ"]
    );

    res.status(201).json({
      message: "Cuenta creada correctamente",
      id_cuenta: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerMovimientosCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;

    if (!id_cuenta) {
      return res.status(400).json({
        message: "El id_cuenta es obligatorio"
      });
    }

    const [[cuenta]] = await pool.query(
      `SELECT
          c.id_cuenta,
          c.numero_cuenta,
          c.saldo,
          c.moneda,
          c.estado,
          cl.id_cliente,
          cl.nombres,
          cl.apellidos,
          tc.nombre AS tipo_cuenta
       FROM cuentas c
       INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
       INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
       WHERE c.id_cuenta = ?`,
      [id_cuenta]
    );

    if (!cuenta) {
      return res.status(404).json({
        message: "La cuenta no existe"
      });
    }

    const [movimientos] = await pool.query(
      `SELECT
          mc.id_movimiento,
          mc.id_transaccion,
          mc.tipo_movimiento,
          mc.monto,
          mc.saldo_anterior,
          mc.saldo_nuevo,
          mc.fecha_movimiento,
          t.descripcion,
          t.estado AS estado_transaccion,
          tt.nombre AS tipo_transaccion
       FROM movimientos_cuenta mc
       INNER JOIN transacciones t
         ON mc.id_transaccion = t.id_transaccion
       INNER JOIN tipos_transaccion tt
         ON t.id_tipo_transaccion = tt.id_tipo_transaccion
       WHERE mc.id_cuenta = ?
       ORDER BY mc.fecha_movimiento DESC, mc.id_movimiento DESC`,
      [id_cuenta]
    );

    res.json({
      cuenta,
      total_movimientos: movimientos.length,
      movimientos
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

async function obtenerEstadoCuenta(req, res) {
  try {
    const { id_cuenta } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    if (!id_cuenta) {
      return res.status(400).json({
        message: "El id_cuenta es obligatorio"
      });
    }

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        message: "fecha_inicio y fecha_fin son obligatorios"
      });
    }

    const [[cuenta]] = await pool.query(
      `SELECT
          c.id_cuenta,
          c.numero_cuenta,
          c.saldo,
          c.moneda,
          c.estado,
          c.fecha_apertura,
          cl.id_cliente,
          cl.nombres,
          cl.apellidos,
          cl.dpi,
          tc.nombre AS tipo_cuenta
       FROM cuentas c
       INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
       INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
       WHERE c.id_cuenta = ?`,
      [id_cuenta]
    );

    if (!cuenta) {
      return res.status(404).json({
        message: "La cuenta no existe"
      });
    }

    const [movimientos] = await pool.query(
      `SELECT
          mc.id_movimiento,
          mc.id_transaccion,
          mc.tipo_movimiento,
          mc.monto,
          mc.saldo_anterior,
          mc.saldo_nuevo,
          mc.fecha_movimiento,
          t.descripcion,
          t.estado AS estado_transaccion,
          tt.nombre AS tipo_transaccion
       FROM movimientos_cuenta mc
       INNER JOIN transacciones t
         ON mc.id_transaccion = t.id_transaccion
       INNER JOIN tipos_transaccion tt
         ON t.id_tipo_transaccion = tt.id_tipo_transaccion
       WHERE mc.id_cuenta = ?
         AND DATE(mc.fecha_movimiento) BETWEEN ? AND ?
       ORDER BY mc.fecha_movimiento ASC, mc.id_movimiento ASC`,
      [id_cuenta, fecha_inicio, fecha_fin]
    );

    let totalCreditos = 0;
    let totalDebitos = 0;

    for (const mov of movimientos) {
      if (mov.tipo_movimiento === "CREDITO") {
        totalCreditos += Number(mov.monto);
      } else if (mov.tipo_movimiento === "DEBITO") {
        totalDebitos += Number(mov.monto);
      }
    }

    const saldoInicial =
      movimientos.length > 0 ? Number(movimientos[0].saldo_anterior) : Number(cuenta.saldo);

    const saldoFinal =
      movimientos.length > 0
        ? Number(movimientos[movimientos.length - 1].saldo_nuevo)
        : Number(cuenta.saldo);

    res.json({
      cuenta: {
        id_cuenta: cuenta.id_cuenta,
        numero_cuenta: cuenta.numero_cuenta,
        tipo_cuenta: cuenta.tipo_cuenta,
        moneda: cuenta.moneda,
        estado: cuenta.estado,
        fecha_apertura: cuenta.fecha_apertura,
        saldo_actual: cuenta.saldo
      },
      cliente: {
        id_cliente: cuenta.id_cliente,
        nombres: cuenta.nombres,
        apellidos: cuenta.apellidos,
        dpi: cuenta.dpi
      },
      periodo: {
        fecha_inicio,
        fecha_fin
      },
      resumen: {
        saldo_inicial: saldoInicial,
        total_creditos: totalCreditos,
        total_debitos: totalDebitos,
        saldo_final: saldoFinal,
        total_movimientos: movimientos.length
      },
      movimientos
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

module.exports = {
  listarCuentas,
  crearCuenta,
  obtenerMovimientosCuenta,
  obtenerEstadoCuenta
};