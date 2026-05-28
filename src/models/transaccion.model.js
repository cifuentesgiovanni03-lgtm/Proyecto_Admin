const pool = require("../config/mysql");
const bancoModel = require("./banco.model");
const cuentaModel = require("./cuenta.model");

async function findAll() {
  const [rows] = await pool.query(
    `SELECT
       t.*,
       tt.nombre AS tipo_transaccion,
       co.numero_cuenta AS numero_cuenta_origen,
       cd.numero_cuenta AS numero_cuenta_destino,
       te.cuenta_destino_externa,
       te.codigo_referencia_interna,
       te.codigo_referencia_externa,
       tee.cuenta_origen_externa,
       tee.codigo_referencia_externa AS ref_entrante,
       (SELECT m.saldo_nuevo FROM movimientos_cuenta m WHERE m.id_transaccion = t.id_transaccion ORDER BY m.id_movimiento DESC LIMIT 1) AS saldo_final
     FROM transacciones t
     INNER JOIN tipos_transaccion tt ON t.id_tipo_transaccion = tt.id_tipo_transaccion
     LEFT JOIN cuentas co ON t.id_cuenta_origen = co.id_cuenta
     LEFT JOIN cuentas cd ON t.id_cuenta_destino = cd.id_cuenta
     LEFT JOIN transferencias_externas te ON t.id_transaccion = te.id_transaccion
     LEFT JOIN transferencias_externas_entrantes tee ON t.id_transaccion = tee.id_transaccion
     ORDER BY t.fecha_transaccion DESC`
  );
  return rows;
}

async function create(conn, data) {
  const {
    id_tipo_transaccion,
    id_cuenta_origen,
    id_cuenta_destino,
    monto,
    descripcion,
    estado,
    id_usuario
  } = data;

  const [result] = await conn.query(
    `INSERT INTO transacciones
     (id_tipo_transaccion, id_cuenta_origen, id_cuenta_destino, monto, descripcion, estado, id_usuario)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id_tipo_transaccion, id_cuenta_origen || null, id_cuenta_destino || null, monto, descripcion, estado, id_usuario]
  );
  return result.insertId;
}

async function updateEstado(conn, id_transaccion, estado) {
  await conn.query(
    `UPDATE transacciones SET estado = ? WHERE id_transaccion = ?`,
    [estado, id_transaccion]
  );
}

async function crearDeposito(conn, { id_cuenta_destino, monto, descripcion, id_usuario }) {
  const cuenta = await cuentaModel.findByIdForUpdate(conn, id_cuenta_destino);
  if (!cuenta) {
    throw new Error("La cuenta destino no existe");
  }

  const saldoAnterior = Number(cuenta.saldo);
  const saldoNuevo = saldoAnterior + Number(monto);

  const id_transaccion = await create(conn, {
    id_tipo_transaccion: 1,
    id_cuenta_destino,
    monto,
    descripcion: descripcion || "Depósito",
    estado: "COMPLETADA",
    id_usuario
  });

  await cuentaModel.updateSaldo(conn, id_cuenta_destino, saldoNuevo);
  await cuentaModel.insertMovimiento(conn, {
    id_cuenta: id_cuenta_destino,
    id_transaccion,
    tipo_movimiento: "CREDITO",
    monto,
    saldo_anterior: saldoAnterior,
    saldo_nuevo: saldoNuevo
  });

  return { id_transaccion };
}

async function crearRetiro(conn, { id_cuenta_origen, monto, descripcion, id_usuario }) {
  const cuenta = await cuentaModel.findByIdForUpdate(conn, id_cuenta_origen);
  if (!cuenta) {
    throw new Error("La cuenta origen no existe o no está activa");
  }

  const saldoAnterior = Number(cuenta.saldo);
  const montoRetiro = Number(monto);

  if (saldoAnterior < montoRetiro) {
    throw new Error("Saldo insuficiente");
  }

  const id_transaccion = await create(conn, {
    id_tipo_transaccion: 2,
    id_cuenta_origen,
    monto: montoRetiro,
    descripcion: descripcion || "Retiro",
    estado: "COMPLETADA",
    id_usuario
  });

  const saldoNuevo = saldoAnterior - montoRetiro;

  await cuentaModel.updateSaldo(conn, id_cuenta_origen, saldoNuevo);
  await cuentaModel.insertMovimiento(conn, {
    id_cuenta: id_cuenta_origen,
    id_transaccion,
    tipo_movimiento: "DEBITO",
    monto: montoRetiro,
    saldo_anterior: saldoAnterior,
    saldo_nuevo: saldoNuevo
  });

  return { id_transaccion, saldo_nuevo: saldoNuevo };
}

async function crearTransferenciaInterna(conn, { id_cuenta_origen, id_cuenta_destino, monto, descripcion, id_usuario }) {
  if (id_cuenta_origen === id_cuenta_destino) {
    throw new Error("La cuenta origen y destino no pueden ser la misma");
  }

  const cuentaOrigen = await cuentaModel.findByIdForUpdate(conn, id_cuenta_origen);
  const cuentaDestino = await cuentaModel.findByIdForUpdate(conn, id_cuenta_destino);

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

  const id_transaccion = await create(conn, {
    id_tipo_transaccion: 3,
    id_cuenta_origen,
    id_cuenta_destino,
    monto: montoTransferencia,
    descripcion: descripcion || "Transferencia interna",
    estado: "COMPLETADA",
    id_usuario
  });

  const saldoOrigenNuevo = saldoOrigenAnterior - montoTransferencia;
  const saldoDestinoNuevo = saldoDestinoAnterior + montoTransferencia;

  await cuentaModel.updateSaldo(conn, id_cuenta_origen, saldoOrigenNuevo);
  await cuentaModel.updateSaldo(conn, id_cuenta_destino, saldoDestinoNuevo);

  await cuentaModel.insertMovimiento(conn, {
    id_cuenta: id_cuenta_origen,
    id_transaccion,
    tipo_movimiento: "DEBITO",
    monto: montoTransferencia,
    saldo_anterior: saldoOrigenAnterior,
    saldo_nuevo: saldoOrigenNuevo
  });

  await cuentaModel.insertMovimiento(conn, {
    id_cuenta: id_cuenta_destino,
    id_transaccion,
    tipo_movimiento: "CREDITO",
    monto: montoTransferencia,
    saldo_anterior: saldoDestinoAnterior,
    saldo_nuevo: saldoDestinoNuevo
  });

  return { id_transaccion, saldo_origen_nuevo: saldoOrigenNuevo, saldo_destino_nuevo: saldoDestinoNuevo };
}

async function crearTransferenciaEntrante(conn, {
  id_cuenta_destino,
  monto,
  descripcion,
  id_banco_origen,
  cuenta_origen_externa,
  titular_origen,
  codigo_referencia_externa,
  id_usuario
}) {
  const cuentaDestino = await cuentaModel.findByIdForUpdate(conn, id_cuenta_destino);
  if (!cuentaDestino) {
    throw new Error("La cuenta destino no existe o no está activa");
  }

  const bancoOrigen = await bancoModel.findById(id_banco_origen);
  if (!bancoOrigen) {
    throw new Error("El banco origen no existe o no está activo");
  }

  const [rows] = await conn.query(
    `SELECT id_transferencia_entrante
     FROM transferencias_externas_entrantes
     WHERE codigo_referencia_externa = ?`,
    [codigo_referencia_externa]
  );
  if (rows.length > 0) {
    const err = new Error("La referencia externa ya fue procesada anteriormente");
    err.code = "DUPLICADO_REFERENCIA";
    throw err;
  }

  const [tipoRows] = await conn.query(
    `SELECT id_tipo_transaccion
     FROM tipos_transaccion
     WHERE nombre = 'TRANSFERENCIA_EXTERNA_ENTRANTE'`
  );
  if (tipoRows.length === 0) {
    throw new Error("No existe el tipo de transacción TRANSFERENCIA_EXTERNA_ENTRANTE");
  }

  const montoTransferencia = Number(monto);
  const saldoAnterior = Number(cuentaDestino.saldo);
  const saldoNuevo = saldoAnterior + montoTransferencia;

  const id_transaccion = await create(conn, {
    id_tipo_transaccion: tipoRows[0].id_tipo_transaccion,
    id_cuenta_destino,
    monto: montoTransferencia,
    descripcion: descripcion || "Transferencia externa entrante",
    estado: "COMPLETADA",
    id_usuario
  });

  await cuentaModel.updateSaldo(conn, id_cuenta_destino, saldoNuevo);
  await cuentaModel.insertMovimiento(conn, {
    id_cuenta: id_cuenta_destino,
    id_transaccion,
    tipo_movimiento: "CREDITO",
    monto: montoTransferencia,
    saldo_anterior: saldoAnterior,
    saldo_nuevo: saldoNuevo
  });

  const [entrada] = await conn.query(
    `INSERT INTO transferencias_externas_entrantes
     (id_transaccion, banco_origen, id_banco_origen, cuenta_origen_externa, titular_origen,
      codigo_referencia_externa, estado_recepcion, mensaje_respuesta)
     VALUES (?, ?, ?, ?, ?, ?, 'APLICADA', ?)`,
    [
      id_transaccion,
      bancoOrigen.nombre,
      bancoOrigen.id_banco,
      cuenta_origen_externa,
      titular_origen || null,
      codigo_referencia_externa,
      "Transferencia aplicada correctamente"
    ]
  );

  return {
    id_transaccion,
    id_transferencia_entrante: entrada.insertId,
    banco_origen: bancoOrigen.nombre,
    saldo_nuevo: saldoNuevo
  };
}

async function crearTransferenciaExterna(conn, {
  id_cuenta_origen,
  monto,
  descripcion,
  api_externa_nombre,
  id_banco_destino,
  cuenta_destino_externa,
  titular_destino,
  id_cuenta_destino,
  id_usuario
}, axios) {
  const cuentaOrigen = await cuentaModel.findByIdForUpdate(conn, id_cuenta_origen);
  if (!cuentaOrigen) {
    throw new Error("La cuenta origen no existe o no está activa");
  }

  const bancoDestino = await bancoModel.findById(id_banco_destino);
  if (!bancoDestino) {
    throw new Error("El banco destino no existe o no está activo");
  }

  const montoTransferencia = Number(monto);
  const saldoAnterior = Number(cuentaOrigen.saldo);

  if (saldoAnterior < montoTransferencia) {
    throw new Error("Saldo insuficiente en la cuenta origen");
  }

  const id_transaccion = await create(conn, {
    id_tipo_transaccion: 4,
    id_cuenta_origen,
    monto: montoTransferencia,
    descripcion: descripcion || "Transferencia externa",
    estado: "PROCESANDO",
    id_usuario
  });

  const saldoNuevo = saldoAnterior - montoTransferencia;

  await cuentaModel.updateSaldo(conn, id_cuenta_origen, saldoNuevo);
  await cuentaModel.insertMovimiento(conn, {
    id_cuenta: id_cuenta_origen,
    id_transaccion,
    tipo_movimiento: "DEBITO",
    monto: montoTransferencia,
    saldo_anterior: saldoAnterior,
    saldo_nuevo: saldoNuevo
  });

  const referenciaInterna = `TRXEXT-${id_transaccion}-${Date.now()}`;

  const [extResult] = await conn.query(
    `INSERT INTO transferencias_externas
     (id_transaccion, api_externa_nombre, cuenta_destino_externa, titular_destino, banco_destino,
      id_banco_destino, codigo_referencia_interna, estado_envio)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')`,
    [
      id_transaccion,
      api_externa_nombre,
      cuenta_destino_externa,
      titular_destino || null,
      bancoDestino.nombre,
      bancoDestino.id_banco,
      referenciaInterna
    ]
  );

  let respuestaExterna;
  let estadoEnvio = "FALLIDA";
  let estadoTransaccion = "RECHAZADA";
  let codigoReferenciaExterna = null;
  let httpStatusCode = null;
  let mensajeRespuesta = null;

  const authHeaderName = bancoDestino.api_auth_header_name || "Authorization";
  const authHeaderPrefix = bancoDestino.api_auth_header_prefix !== null && bancoDestino.api_auth_header_prefix !== undefined
    ? bancoDestino.api_auth_header_prefix : (authHeaderName === "Authorization" ? "Bearer " : "");

  function makeAuthHeader(token) {
    return token ? authHeaderPrefix + token : "";
  }

  try {
    // 1. Obtener token JWT si el banco tiene api_auth_url
    let token = bancoDestino.api_token || process.env.API_EXTERNA_TOKEN || "";
    if (bancoDestino.api_auth_url) {
      const authBody = {
        email: bancoDestino.api_auth_email,
        password: bancoDestino.api_auth_password
      };
      const authResp = await axios.post(bancoDestino.api_auth_url, authBody, {
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        timeout: 15000
      });
      const data = authResp.data?.data || authResp.data;
      token = data.token || data.access_token || data.accessToken || authResp.data.token || authResp.data.access_token || authResp.data.accessToken || "";
    }

    // 2. Validar cuenta destino si el banco tiene api_account_search_url
    if (bancoDestino.api_account_search_url) {
      const searchUrl = bancoDestino.api_account_search_url.replace(/\{\{numero_cuenta\}\}/g, cuenta_destino_externa);
      await axios.get(searchUrl, {
        headers: { [authHeaderName]: makeAuthHeader(token), "Accept": "application/json" },
        timeout: 15000
      });
    }

    // 3. Determinar URL de envio
    const apiUrl = bancoDestino.api_url || process.env.API_EXTERNA_URL;

    // 4. Construir body segun template o default
    let requestBody;
    if (bancoDestino.api_json_template) {
      requestBody = JSON.parse(
        bancoDestino.api_json_template
          .replace(/\{\{monto\}\}/g, montoTransferencia)
          .replace(/\{\{cuenta_destino_externa\}\}/g, cuenta_destino_externa)
          .replace(/\{\{titular_destino\}\}/g, titular_destino || "")
          .replace(/\{\{referencia_interna\}\}/g, referenciaInterna)
          .replace(/\{\{moneda\}\}/g, bancoDestino.moneda_externa || cuentaOrigen.moneda)
          .replace(/\{\{descripcion\}\}/g, descripcion || "")
          .replace(/\{\{banco_externo\}\}/g, api_externa_nombre || bancoDestino.nombre)
          .replace(/\{\{id_cuenta_destino\}\}/g, id_cuenta_destino !== undefined ? id_cuenta_destino : cuenta_destino_externa)
      );
    } else {
      requestBody = {
        referencia_interna: referenciaInterna,
        cuenta_destino: cuenta_destino_externa,
        titular_destino,
        banco_destino: bancoDestino.nombre,
        monto: montoTransferencia,
        moneda: bancoDestino.moneda_externa || cuentaOrigen.moneda,
        descripcion
      };
    }

    // 5. Enviar transferencia
    respuestaExterna = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        [authHeaderName]: makeAuthHeader(token)
      },
      timeout: 15000
    });

    httpStatusCode = respuestaExterna.status;
    const respData = respuestaExterna.data?.data || respuestaExterna.data;
    codigoReferenciaExterna = respData.codigo_confirmacion ||
                              respData.referencia_externa ||
                              respData.detalle?.referencia ||
                              respuestaExterna.data?.codigo_confirmacion ||
                              respuestaExterna.data?.referencia_externa ||
                              respuestaExterna.data?.detalle?.referencia || null;
    mensajeRespuesta = respData.mensaje ||
                       respData.message ||
                       respuestaExterna.data?.mensaje ||
                       respuestaExterna.data?.message ||
                       "Transferencia enviada";
    estadoEnvio = "CONFIRMADA";
    estadoTransaccion = "COMPLETADA";
  } catch (apiError) {
    httpStatusCode = apiError.response?.status || null;
    mensajeRespuesta = apiError.response?.data?.message ||
                       apiError.response?.data?.mensaje ||
                       apiError.response?.data?.error ||
                       apiError.message;
    estadoEnvio = "FALLIDA";
    estadoTransaccion = "RECHAZADA";

    await cuentaModel.updateSaldo(conn, id_cuenta_origen, saldoAnterior);
    await cuentaModel.deleteMovimientosByTransaccionId(conn, id_transaccion);
  }

  await updateEstado(conn, id_transaccion, estadoTransaccion);

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

  return {
    id_transaccion,
    referencia_interna: referenciaInterna,
    referencia_externa: codigoReferenciaExterna,
    banco_destino: bancoDestino.nombre,
    estado: estadoEnvio,
    mensaje_respuesta: mensajeRespuesta
  };
}

module.exports = {
  findAll,
  create,
  updateEstado,
  crearDeposito,
  crearRetiro,
  crearTransferenciaInterna,
  crearTransferenciaEntrante,
  crearTransferenciaExterna
};
