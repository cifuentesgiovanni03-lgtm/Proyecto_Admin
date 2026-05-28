const bancoModel = require("../models/banco.model");
const { registrarAuditoria } = require("../services/auditoria.service");

async function listarBancos(req, res) {
  try {
    const rows = await bancoModel.findAll();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerBanco(req, res) {
  try {
    const banco = await bancoModel.findById(req.params.id_banco);
    if (!banco) {
      return res.status(404).json({ message: "Banco no encontrado" });
    }
    res.json(banco);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearBanco(req, res) {
  try {
    const { nombre, codigo_banco, pais, api_url, api_token, api_json_template,
            api_auth_url, api_auth_email, api_auth_password, api_account_search_url,
            moneda_externa } = req.body;

    if (!nombre || !codigo_banco) {
      return res.status(400).json({
        message: "nombre y codigo_banco son obligatorios"
      });
    }

    const id_banco = await bancoModel.create({
      nombre, codigo_banco, pais, api_url, api_token, api_json_template,
      api_auth_url, api_auth_email, api_auth_password, api_account_search_url, moneda_externa
    });

    await registrarAuditoria({
      accion: "CREAR_BANCO",
      entidad: "bancos",
      entidad_id: id_banco,
      usuario_id: req.usuario.id_usuario,
      detalle: { nombre, codigo_banco, pais: pais || "Guatemala" }
    });

    res.status(201).json({
      message: "Banco creado correctamente",
      id_banco
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function actualizarBanco(req, res) {
  try {
    const { id_banco } = req.params;

    const existe = await bancoModel.findById(id_banco);
    if (!existe) {
      return res.status(404).json({ message: "Banco no encontrado" });
    }

    const { nombre, codigo_banco, pais, api_url, api_token, api_json_template,
            api_auth_url, api_auth_email, api_auth_password, api_account_search_url,
            moneda_externa, estado } = req.body;

    await bancoModel.update(id_banco, {
      nombre: nombre || existe.nombre,
      codigo_banco: codigo_banco || existe.codigo_banco,
      pais: pais || existe.pais,
      api_url: api_url !== undefined ? api_url : existe.api_url,
      api_token: api_token !== undefined ? api_token : existe.api_token,
      api_json_template: api_json_template !== undefined ? api_json_template : existe.api_json_template,
      api_auth_url: api_auth_url !== undefined ? api_auth_url : existe.api_auth_url,
      api_auth_email: api_auth_email !== undefined ? api_auth_email : existe.api_auth_email,
      api_auth_password: api_auth_password !== undefined ? api_auth_password : existe.api_auth_password,
      api_account_search_url: api_account_search_url !== undefined ? api_account_search_url : existe.api_account_search_url,
      moneda_externa: moneda_externa !== undefined ? moneda_externa : existe.moneda_externa,
      estado: estado || existe.estado
    });

    await registrarAuditoria({
      accion: "ACTUALIZAR_BANCO",
      entidad: "bancos",
      entidad_id: Number(id_banco),
      usuario_id: req.usuario.id_usuario,
      detalle: { nombre, codigo_banco, api_url }
    });

    res.json({ message: "Banco actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function eliminarBanco(req, res) {
  try {
    const eliminado = await bancoModel.deleteById(req.params.id_banco);
    if (!eliminado) {
      return res.status(404).json({ message: "Banco no encontrado" });
    }

    await registrarAuditoria({
      accion: "ELIMINAR_BANCO",
      entidad: "bancos",
      entidad_id: Number(req.params.id_banco),
      usuario_id: req.usuario.id_usuario,
      detalle: {}
    });

    res.json({ message: "Banco eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarBancos,
  obtenerBanco,
  crearBanco,
  actualizarBanco,
  eliminarBanco
};
