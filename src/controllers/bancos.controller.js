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

async function crearBanco(req, res) {
  try {
    const { nombre, codigo_banco, pais } = req.body;

    if (!nombre || !codigo_banco) {
      return res.status(400).json({
        message: "nombre y codigo_banco son obligatorios"
      });
    }

    const id_banco = await bancoModel.create({ nombre, codigo_banco, pais });

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

module.exports = {
  listarBancos,
  crearBanco
};
