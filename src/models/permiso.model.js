const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
    "SELECT * FROM permisos ORDER BY id_permiso ASC"
  );
  return rows;
}

async function findById(id_permiso) {
  const [rows] = await pool.query(
    "SELECT * FROM permisos WHERE id_permiso = ?",
    [id_permiso]
  );
  return rows[0] || null;
}

async function create({ nombre, descripcion }) {
  const [result] = await pool.query(
    "INSERT INTO permisos (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion]
  );
  return result.insertId;
}

async function update(id_permiso, { nombre, descripcion }) {
  await pool.query(
    "UPDATE permisos SET nombre = ?, descripcion = ? WHERE id_permiso = ?",
    [nombre, descripcion, id_permiso]
  );
}

async function deleteById(id_permiso) {
  await pool.query("DELETE FROM rol_permiso WHERE id_permiso = ?", [id_permiso]);
  const [result] = await pool.query(
    "DELETE FROM permisos WHERE id_permiso = ?",
    [id_permiso]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteById
};
