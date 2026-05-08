const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
    "SELECT * FROM roles ORDER BY id_rol ASC"
  );
  return rows;
}

async function findById(id_rol) {
  const [rows] = await pool.query(
    "SELECT * FROM roles WHERE id_rol = ?",
    [id_rol]
  );
  return rows[0] || null;
}

async function create({ nombre, descripcion }) {
  const [result] = await pool.query(
    "INSERT INTO roles (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion]
  );
  return result.insertId;
}

async function update(id_rol, { nombre, descripcion }) {
  await pool.query(
    "UPDATE roles SET nombre = ?, descripcion = ? WHERE id_rol = ?",
    [nombre, descripcion, id_rol]
  );
}

async function deleteById(id_rol) {
  await pool.query("DELETE FROM rol_permiso WHERE id_rol = ?", [id_rol]);
  await pool.query("UPDATE usuarios SET id_rol = NULL WHERE id_rol = ?", [id_rol]);
  const [result] = await pool.query(
    "DELETE FROM roles WHERE id_rol = ?",
    [id_rol]
  );
  return result.affectedRows > 0;
}

async function getPermisos(id_rol) {
  const [rows] = await pool.query(
    `SELECT p.id_permiso, p.nombre, p.descripcion
     FROM permisos p
     INNER JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
     WHERE rp.id_rol = ?
     ORDER BY p.id_permiso ASC`,
    [id_rol]
  );
  return rows;
}

async function setPermisos(id_rol, permisosIds) {
  await pool.query("DELETE FROM rol_permiso WHERE id_rol = ?", [id_rol]);

  if (permisosIds && permisosIds.length > 0) {
    const values = permisosIds.map(id => [id_rol, id]);
    const placeholders = values.map(() => "(?, ?)").join(", ");
    const flat = values.flat();

    await pool.query(
      `INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ${placeholders}`,
      flat
    );
  }
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteById,
  getPermisos,
  setPermisos
};
