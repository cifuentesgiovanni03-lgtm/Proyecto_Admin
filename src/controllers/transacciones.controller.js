const axios = require("axios");
const pool = require("../config/mysql");
const transaccionModel = require("../models/transaccion.model");
const { registrarAuditoria, registrarLog } = require("../services/auditoria.service");

async function listarTransacciones(req, res) {
  try {
    const rows = await transaccionModel.findAll();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearDeposito(req, res) {
  const conn = await pool.getConnection();

  try {
    const { id_cuenta_destino, monto, descripcion } = req.body;
    const id_usuario = req.usuario.id_usuario;

    await conn.beginTransaction();

    const { id_transaccion } = await transaccionModel.crearDeposito(conn, {
      id_cuenta_destino, monto, descripcion, id_usuario
    });

    await conn.commit();

    await registrarAuditoria({
      accion: "DEPOSITO",
      entidad: "transacciones",
      entidad_id: id_transaccion,
      detalle: { id_cuenta_destino, monto }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Depósito registrado",
      transaccion_id: id_transaccion
    });

    res.status(201).json({
      message: "Depósito realizado correctamente",
      id_transaccion
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

    const { id_transaccion, saldo_nuevo } = await transaccionModel.crearRetiro(conn, {
      id_cuenta_origen, monto, descripcion, id_usuario
    });

    await conn.commit();

    await registrarAuditoria({
      accion: "RETIRO",
      entidad: "transacciones",
      entidad_id: id_transaccion,
      usuario_id: id_usuario,
      detalle: { id_cuenta_origen, monto }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Retiro realizado correctamente",
      transaccion_id: id_transaccion,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Retiro realizado correctamente",
      id_transaccion,
      saldo_nuevo
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

    await conn.beginTransaction();

    const { id_transaccion, saldo_origen_nuevo, saldo_destino_nuevo } =
      await transaccionModel.crearTransferenciaInterna(conn, {
        id_cuenta_origen, id_cuenta_destino, monto, descripcion, id_usuario
      });

    await conn.commit();

    await registrarAuditoria({
      accion: "TRANSFERENCIA_INTERNA",
      entidad: "transacciones",
      entidad_id: id_transaccion,
      usuario_id: id_usuario,
      detalle: { id_cuenta_origen, id_cuenta_destino, monto }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Transferencia interna realizada correctamente",
      transaccion_id: id_transaccion,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Transferencia interna realizada correctamente",
      id_transaccion,
      saldo_origen_nuevo,
      saldo_destino_nuevo
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
}

async function crearTransferenciaEntrante(req, res) {
  const conn = await pool.getConnection();

  try {
    const {
      id_cuenta_destino, monto, descripcion,
      id_banco_origen, cuenta_origen_externa, titular_origen,
      codigo_referencia_externa
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    if (
      !id_cuenta_destino || !monto ||
      !id_banco_origen || !cuenta_origen_externa || !codigo_referencia_externa
    ) {
      return res.status(400).json({
        message: "Faltan datos obligatorios para la transferencia entrante"
      });
    }

    if (Number(monto) <= 0) {
      return res.status(400).json({
        message: "El monto debe ser mayor a 0"
      });
    }

    await conn.beginTransaction();

    const resultado = await transaccionModel.crearTransferenciaEntrante(conn, {
      id_cuenta_destino, monto, descripcion,
      id_banco_origen, cuenta_origen_externa, titular_origen,
      codigo_referencia_externa, id_usuario
    });

    await conn.commit();

    await registrarAuditoria({
      accion: "TRANSFERENCIA_EXTERNA_ENTRANTE",
      entidad: "transferencias_externas_entrantes",
      entidad_id: resultado.id_transferencia_entrante,
      usuario_id: id_usuario,
      detalle: {
        id_transaccion: resultado.id_transaccion,
        id_cuenta_destino,
        id_banco_origen,
        banco_origen: resultado.banco_origen,
        cuenta_origen_externa,
        monto,
        codigo_referencia_externa
      }
    });

    await registrarLog({
      nivel: "INFO",
      modulo: "TRANSACCIONES",
      mensaje: "Transferencia externa entrante aplicada correctamente",
      transaccion_id: resultado.id_transaccion,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Transferencia externa entrante registrada correctamente",
      id_transaccion: resultado.id_transaccion,
      id_transferencia_entrante: resultado.id_transferencia_entrante,
      banco_origen: resultado.banco_origen,
      saldo_nuevo: resultado.saldo_nuevo
    });
  } catch (error) {
    await conn.rollback();
    if (error.code === "DUPLICADO_REFERENCIA") {
      return res.status(409).json({
        message: error.message
      });
    }
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
}

async function crearTransferenciaExterna(req, res) {
  const conn = await pool.getConnection();

  try {
    const {
      id_cuenta_origen, monto, descripcion,
      api_externa_nombre, id_banco_destino, cuenta_destino_externa, titular_destino
    } = req.body;

    const id_usuario = req.usuario.id_usuario;

    if (
      !id_cuenta_origen || !monto || !api_externa_nombre ||
      !id_banco_destino || !cuenta_destino_externa
    ) {
      return res.status(400).json({
        message: "Faltan datos obligatorios para la transferencia externa"
      });
    }

    if (Number(monto) <= 0) {
      return res.status(400).json({
        message: "El monto debe ser mayor a 0"
      });
    }

    await conn.beginTransaction();

    const resultado = await transaccionModel.crearTransferenciaExterna(
      conn,
      {
        id_cuenta_origen, monto, descripcion,
        api_externa_nombre, id_banco_destino, cuenta_destino_externa, titular_destino,
        id_usuario
      },
      axios
    );

    await conn.commit();

    await registrarAuditoria({
      accion: "TRANSFERENCIA_EXTERNA",
      entidad: "transferencias_externas",
      entidad_id: resultado.id_transaccion,
      usuario_id: id_usuario,
      detalle: {
        id_transaccion: resultado.id_transaccion,
        id_banco_destino,
        banco_destino: resultado.banco_destino,
        cuenta_destino_externa,
        monto,
        estado_envio: resultado.estado
      }
    });

    await registrarLog({
      nivel: resultado.estado === "CONFIRMADA" ? "INFO" : "ERROR",
      modulo: "TRANSACCIONES",
      mensaje: "Transferencia externa procesada",
      transaccion_id: resultado.id_transaccion,
      usuario_id: id_usuario
    });

    res.status(201).json({
      message: "Transferencia externa procesada",
      id_transaccion: resultado.id_transaccion,
      referencia_interna: resultado.referencia_interna,
      referencia_externa: resultado.referencia_externa,
      banco_destino: resultado.banco_destino,
      estado: resultado.estado,
      mensaje_respuesta: resultado.mensaje_respuesta
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
  crearTransferenciaExterna,
  crearTransferenciaEntrante
};
