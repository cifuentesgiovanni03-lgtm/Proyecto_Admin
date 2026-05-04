const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
    `SELECT id_banco, nombre, codigo_banco, pais, estado, fecha_registro
     FROM bancos
     ORDER BY nombre ASC`
  );
  return rows;
}

async function create({ nombre, codigo_banco, pais }) {
  const [result] = await pool.query(
    `INSERT INTO bancos (nombre, codigo_banco, pais)
     VALUES (?, ?, ?)`,
    [nombre, codigo_banco, pais || "Guatemala"]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id_banco, nombre
     FROM bancos
     WHERE id_banco = ? AND estado = 'ACTIVO'`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  findAll,
  create,
  findById
};
