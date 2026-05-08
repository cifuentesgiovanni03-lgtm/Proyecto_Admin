const usuarioModel = require("../models/usuario.model");
const { registrarAuditoria } = require("../services/auditoria.service");

async function listarUsuarios(req, res) {
  try {
    const rows = await usuarioModel.findAll();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerUsuario(req, res) {
  try {
    const { id_usuario } = req.params;

    const usuario = await usuarioModel.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearUsuario(req, res) {
  try {
    const { username, password, nombre_completo, correo, id_rol } = req.body;

    if (!username || !password || !nombre_completo || !correo || !id_rol) {
      return res.status(400).json({
        message: "username, password, nombre_completo, correo e id_rol son obligatorios"
      });
    }

    const id_usuario = await usuarioModel.create({
      username, password, nombre_completo, correo, id_rol
    });

    await registrarAuditoria({
      accion: "CREAR_USUARIO",
      entidad: "usuarios",
      entidad_id: id_usuario,
      usuario_id: req.usuario.id_usuario,
      detalle: { username, nombre_completo, correo, id_rol }
    });

    res.status(201).json({
      message: "Usuario creado correctamente",
      id_usuario
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El username o correo ya existe" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const { id_usuario } = req.params;

    const existe = await usuarioModel.findById(id_usuario);
    if (!existe) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { nombre_completo, correo, id_rol, estado } = req.body;
    await usuarioModel.update(id_usuario, {
      nombre_completo: nombre_completo || existe.nombre_completo,
      correo: correo || existe.correo,
      id_rol: id_rol || existe.id_rol,
      estado: estado || existe.estado
    });

    await registrarAuditoria({
      accion: "ACTUALIZAR_USUARIO",
      entidad: "usuarios",
      entidad_id: Number(id_usuario),
      usuario_id: req.usuario.id_usuario,
      detalle: { nombre_completo, correo, id_rol, estado }
    });

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function cambiarPassword(req, res) {
  try {
    const { id_usuario } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "password es obligatorio" });
    }

    const existe = await usuarioModel.findById(id_usuario);
    if (!existe) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await usuarioModel.updatePassword(id_usuario, password);

    await registrarAuditoria({
      accion: "CAMBIAR_PASSWORD",
      entidad: "usuarios",
      entidad_id: Number(id_usuario),
      usuario_id: req.usuario.id_usuario,
      detalle: {}
    });

    res.json({ message: "Contrasena actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function eliminarUsuario(req, res) {
  try {
    const { id_usuario } = req.params;

    const eliminado = await usuarioModel.deleteById(id_usuario);
    if (!eliminado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await registrarAuditoria({
      accion: "ELIMINAR_USUARIO",
      entidad: "usuarios",
      entidad_id: Number(id_usuario),
      usuario_id: req.usuario.id_usuario,
      detalle: {}
    });

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
};
