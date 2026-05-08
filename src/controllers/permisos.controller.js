const permisoModel = require("../models/permiso.model");

async function listarPermisos(req, res) {
  try {
    const rows = await permisoModel.findAll();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function obtenerPermiso(req, res) {
  try {
    const permiso = await permisoModel.findById(req.params.id_permiso);
    if (!permiso) {
      return res.status(404).json({ message: "Permiso no encontrado" });
    }
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearPermiso(req, res) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "nombre es obligatorio" });
    }

    const id_permiso = await permisoModel.create({ nombre, descripcion });
    res.status(201).json({ message: "Permiso creado correctamente", id_permiso });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El permiso ya existe" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function actualizarPermiso(req, res) {
  try {
    const { id_permiso } = req.params;

    const existe = await permisoModel.findById(id_permiso);
    if (!existe) {
      return res.status(404).json({ message: "Permiso no encontrado" });
    }

    const { nombre, descripcion } = req.body;
    await permisoModel.update(id_permiso, {
      nombre: nombre || existe.nombre,
      descripcion: descripcion ?? existe.descripcion
    });

    res.json({ message: "Permiso actualizado correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El permiso ya existe" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function eliminarPermiso(req, res) {
  try {
    const eliminado = await permisoModel.deleteById(req.params.id_permiso);
    if (!eliminado) {
      return res.status(404).json({ message: "Permiso no encontrado" });
    }
    res.json({ message: "Permiso eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarPermisos,
  obtenerPermiso,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso
};
