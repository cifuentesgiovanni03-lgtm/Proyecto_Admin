const axios = require("axios");
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

async function crearRetiro(req, res) {
  const conn = await pool.getConnection();

  try {
    const { id_cuenta_origen, monto, descripcion } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id_cuenta_origen || !monto) {
      return res.status(400).json({
        message: "id_cuenta_origen y monto son obligatorios"
      });
    }

    await conn.beginTransaction();

    const [[cuenta]] = await conn.query(
      `SELECT * FROM cuentas
       WHERE id_cuenta = ? AND estado = 'ACTIVA'
       FOR UPDATE`,
      [id_cuenta_origen]
    );

    if (!cuenta) {
      throw new Error("La cuenta origen no existe o no está activa");
    }

    const saldoAnterior = Number(cuenta.saldo);
    const montoRetiro = Number(monto);

    if (saldoAnterior < montoRetiro) {
      throw new Error("Saldo insuficiente");
    }

    const [trx] = await conn.query(
      `INSERT INTO transacciones
      (id_tipo_transaccion, id_cuenta_origen, monto, descripcion, estado, id_usuario)
      VALUES (?, ?, ?, ?, 'COMPLETADA', ?)`,
      [2, id_cuenta_origen, montoRetiro, descripcion || "Retiro", id_usuario]
    );

    const saldoNuevo = saldoAnterior - montoRetiro;

    await conn.query(
      `UPDATE cuentas
       SET saldo = ?
       WHERE id_cuenta = ?`,
      [saldoNuevo, id_cuenta_origen]
    );

    await conn.query(
      `INSERT INTO movimientos_cuenta
      (id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo)
      VALUES (?, ?, 'DEBITO', ?, ?, ?)`,
      [id_cuenta_origen, trx.insertId, montoRetiro, saldoAnterior, saldoNuevo]
    );

    await conn.commit();

    await registrarAuditoria({
      accion: "RETIRO",
      entidad: "transacciones",
      entidad_id: trx.insertId,
      usuario_id: id_usuario,
      detalle: { id_cuenta_origen, monto: montoRetiro }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Retiro realizado correctamente",
      transaccion_id: trx.insertId,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Retiro realizado correctamente",
      id_transaccion: trx.insertId,
      saldo_nuevo: saldoNuevo
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
}

async function crearTransferenciaInterna(req, res) {
  const conn = await pool.getConnection();

  try {
    const { id_cuenta_origen, id_cuenta_destino, monto, descripcion } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!id_cuenta_origen || !id_cuenta_destino || !monto) {
      return res.status(400).json({
        message: "id_cuenta_origen, id_cuenta_destino y monto son obligatorios"
      });
    }

    if (id_cuenta_origen === id_cuenta_destino) {
      return res.status(400).json({
        message: "La cuenta origen y destino no pueden ser la misma"
      });
    }

    await conn.beginTransaction();

    const [[cuentaOrigen]] = await conn.query(
      `SELECT * FROM cuentas
       WHERE id_cuenta = ? AND estado = 'ACTIVA'
       FOR UPDATE`,
      [id_cuenta_origen]
    );

    const [[cuentaDestino]] = await conn.query(
      `SELECT * FROM cuentas
       WHERE id_cuenta = ? AND estado = 'ACTIVA'
       FOR UPDATE`,
      [id_cuenta_destino]
    );

    if (!cuentaOrigen) {
      throw new Error("La cuenta origen no existe o no está activa");
    }

    if (!cuentaDestino) {
      throw new Error("La cuenta destino no existe o no está activa");
    }

    const montoTransferencia = Number(monto);
    const saldoOrigenAnterior = Number(cuentaOrigen.saldo);
    const saldoDestinoAnterior = Number(cuentaDestino.saldo);

    if (saldoOrigenAnterior < montoTransferencia) {
      throw new Error("Saldo insuficiente en la cuenta origen");
    }

    const [trx] = await conn.query(
      `INSERT INTO transacciones
      (id_tipo_transaccion, id_cuenta_origen, id_cuenta_destino, monto, descripcion, estado, id_usuario)
      VALUES (?, ?, ?, ?, ?, 'COMPLETADA', ?)`,
      [3, id_cuenta_origen, id_cuenta_destino, montoTransferencia, descripcion || "Transferencia interna", id_usuario]
    );

    const saldoOrigenNuevo = saldoOrigenAnterior - montoTransferencia;
    const saldoDestinoNuevo = saldoDestinoAnterior + montoTransferencia;

    await conn.query(
      `UPDATE cuentas SET saldo = ? WHERE id_cuenta = ?`,
      [saldoOrigenNuevo, id_cuenta_origen]
    );

    await conn.query(
      `UPDATE cuentas SET saldo = ? WHERE id_cuenta = ?`,
      [saldoDestinoNuevo, id_cuenta_destino]
    );

    await conn.query(
      `INSERT INTO movimientos_cuenta
      (id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo)
      VALUES (?, ?, 'DEBITO', ?, ?, ?)`,
      [id_cuenta_origen, trx.insertId, montoTransferencia, saldoOrigenAnterior, saldoOrigenNuevo]
    );

    await conn.query(
      `INSERT INTO movimientos_cuenta
      (id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo)
      VALUES (?, ?, 'CREDITO', ?, ?, ?)`,
      [id_cuenta_destino, trx.insertId, montoTransferencia, saldoDestinoAnterior, saldoDestinoNuevo]
    );

    await conn.commit();

    await registrarAuditoria({
      accion: "TRANSFERENCIA_INTERNA",
      entidad: "transacciones",
      entidad_id: trx.insertId,
      usuario_id: id_usuario,
      detalle: {
        id_cuenta_origen,
        id_cuenta_destino,
        monto: montoTransferencia
      }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Transferencia interna realizada correctamente",
      transaccion_id: trx.insertId,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Transferencia interna realizada correctamente",
      id_transaccion: trx.insertId,
      saldo_origen_nuevo: saldoOrigenNuevo,
      saldo_destino_nuevo: saldoDestinoNuevo
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
}

async function crearTransferenciaExterna(req, res) {
  const conn = await pool.getConnection();

  try {
    const {
      id_cuenta_origen,
      monto,
      descripcion,
      api_externa_nombre,
      cuenta_destino_externa,
      titular_destino,
      banco_destino
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    if (!id_cuenta_origen || !monto || !api_externa_nombre || !cuenta_destino_externa) {
      return res.status(400).json({
        message: "Faltan datos obligatorios para la transferencia externa"
      });
    }

    await conn.beginTransaction();

    const [[cuentaOrigen]] = await conn.query(
      `SELECT * FROM cuentas
       WHERE id_cuenta = ? AND estado = 'ACTIVA'
       FOR UPDATE`,
      [id_cuenta_origen]
    );

    if (!cuentaOrigen) {
      throw new Error("La cuenta origen no existe o no está activa");
    }

    const montoTransferencia = Number(monto);
    const saldoAnterior = Number(cuentaOrigen.saldo);

    if (saldoAnterior < montoTransferencia) {
      throw new Error("Saldo insuficiente en la cuenta origen");
    }

    const [trx] = await conn.query(
      `INSERT INTO transacciones
      (id_tipo_transaccion, id_cuenta_origen, monto, descripcion, estado, id_usuario)
      VALUES (?, ?, ?, ?, 'PROCESANDO', ?)`,
      [4, id_cuenta_origen, montoTransferencia, descripcion || "Transferencia externa", id_usuario]
    );

    const saldoNuevo = saldoAnterior - montoTransferencia;

    await conn.query(
      `UPDATE cuentas
       SET saldo = ?
       WHERE id_cuenta = ?`,
      [saldoNuevo, id_cuenta_origen]
    );

    await conn.query(
      `INSERT INTO movimientos_cuenta
      (id_cuenta, id_transaccion, tipo_movimiento, monto, saldo_anterior, saldo_nuevo)
      VALUES (?, ?, 'DEBITO', ?, ?, ?)`,
      [id_cuenta_origen, trx.insertId, montoTransferencia, saldoAnterior, saldoNuevo]
    );

    const referenciaInterna = `TRXEXT-${trx.insertId}-${Date.now()}`;

    const [extResult] = await conn.query(
      `INSERT INTO transferencias_externas
      (id_transaccion, api_externa_nombre, cuenta_destino_externa, titular_destino, banco_destino,
       codigo_referencia_interna, estado_envio)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
      [
        trx.insertId,
        api_externa_nombre,
        cuenta_destino_externa,
        titular_destino || null,
        banco_destino || null,
        referenciaInterna
      ]
    );

    let respuestaExterna;
    let estadoEnvio = "FALLIDA";
    let estadoTransaccion = "RECHAZADA";
    let codigoReferenciaExterna = null;
    let httpStatusCode = null;
    let mensajeRespuesta = null;

    try {
      respuestaExterna = await axios.post(process.env.API_EXTERNA_URL, {
        referencia_interna: referenciaInterna,
        cuenta_destino: cuenta_destino_externa,
        titular_destino,
        banco_destino,
        monto: montoTransferencia,
        moneda: cuentaOrigen.moneda,
        descripcion
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_EXTERNA_TOKEN || ""}`
        },
        timeout: 15000
      });

      httpStatusCode = respuestaExterna.status;
      codigoReferenciaExterna = respuestaExterna.data?.referencia_externa || null;
      mensajeRespuesta = respuestaExterna.data?.mensaje || "Transferencia enviada";
      estadoEnvio = "CONFIRMADA";
      estadoTransaccion = "COMPLETADA";
    } catch (apiError) {
      httpStatusCode = apiError.response?.status || null;
      mensajeRespuesta = apiError.response?.data?.message || apiError.message;
      estadoEnvio = "FALLIDA";
      estadoTransaccion = "RECHAZADA";

      await conn.query(
        `UPDATE cuentas SET saldo = ? WHERE id_cuenta = ?`,
        [saldoAnterior, id_cuenta_origen]
      );

      await conn.query(
        `DELETE FROM movimientos_cuenta WHERE id_transaccion = ?`,
        [trx.insertId]
      );
    }

    await conn.query(
      `UPDATE transacciones
       SET estado = ?
       WHERE id_transaccion = ?`,
      [estadoTransaccion, trx.insertId]
    );

    await conn.query(
      `UPDATE transferencias_externas
       SET codigo_referencia_externa = ?,
           estado_envio = ?,
           http_status_code = ?,
           mensaje_respuesta = ?,
           fecha_envio = NOW(),
           fecha_confirmacion = CASE WHEN ? = 'CONFIRMADA' THEN NOW() ELSE NULL END
       WHERE id_transferencia_externa = ?`,
      [
        codigoReferenciaExterna,
        estadoEnvio,
        httpStatusCode,
        mensajeRespuesta,
        estadoEnvio,
        extResult.insertId
      ]
    );

    await conn.commit();

    await registrarAuditoria({
      accion: "TRANSFERENCIA_EXTERNA",
      entidad: "transferencias_externas",
      entidad_id: extResult.insertId,
      usuario_id: id_usuario,
      detalle: {
        id_transaccion: trx.insertId,
        cuenta_destino_externa,
        monto: montoTransferencia,
        estado_envio: estadoEnvio
      }
    });

    await registrarLog({
      nivel: estadoEnvio === "CONFIRMADA" ? "INFO" : "ERROR",
      modulo: "TRANSACCIONES",
      mensaje: "Transferencia externa procesada",
      transaccion_id: trx.insertId,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Transferencia externa procesada",
      id_transaccion: trx.insertId,
      referencia_interna: referenciaInterna,
      referencia_externa: codigoReferenciaExterna,
      estado: estadoEnvio,
      mensaje_respuesta: mensajeRespuesta
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
  crearDeposito,
  crearRetiro,
  crearTransferenciaInterna,
  crearTransferenciaExterna
};