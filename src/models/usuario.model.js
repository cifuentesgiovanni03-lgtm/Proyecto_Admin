const pool = require("../config/mysql");
const bcrypt = require("bcryptjs");

async function findAll() {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.username, u.nombre_completo, u.correo, u.estado, u.fecha_creacion,
            r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     ORDER BY u.id_usuario DESC`
  );
  return rows;
}

async function findById(id_usuario) {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.username, u.nombre_completo, u.correo, u.estado, u.fecha_creacion,
            r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.id_usuario = ?`,
    [id_usuario]
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query(
    `SELECT u.id_usuario, u.username, u.password_hash, u.nombre_completo, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON u.id_rol = r.id_rol
     WHERE u.username = ? AND u.estado = 'ACTIVO'`,
    [username]
  );
  return rows[0] || null;
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function create({ username, password, nombre_completo, correo, id_rol }) {
  const password_hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO usuarios (username, password_hash, nombre_completo, correo, id_rol)
     VALUES (?, ?, ?, ?, ?)`,
    [username, password_hash, nombre_completo, correo, id_rol]
  );
  return result.insertId;
}

async function update(id_usuario, { nombre_completo, correo, id_rol, estado }) {
  await pool.query(
    `UPDATE usuarios
     SET nombre_completo = ?, correo = ?, id_rol = ?, estado = ?
     WHERE id_usuario = ?`,
    [nombre_completo, correo, id_rol, estado, id_usuario]
  );
}

async function updatePassword(id_usuario, password) {
  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    "UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?",
    [password_hash, id_usuario]
  );
}

async function deleteById(id_usuario) {
  const [result] = await pool.query(
    "DELETE FROM usuarios WHERE id_usuario = ?",
    [id_usuario]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  verifyPassword,
  create,
  update,
  updatePassword,
  deleteById
};
