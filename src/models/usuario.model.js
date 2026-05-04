const pool = require("../config/mysql");
const bcrypt = require("bcryptjs");

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

module.exports = {
  findByUsername,
  verifyPassword
};
