const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
    "SELECT * FROM clientes ORDER BY id_cliente DESC"
  );
  return rows;
}

async function findById(id_cliente) {
  const [rows] = await pool.query(
    "SELECT * FROM clientes WHERE id_cliente = ?",
    [id_cliente]
  );
  return rows[0] || null;
}

async function create(data) {
  const {
    nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion
  } = data;

  const [result] = await pool.query(
    `INSERT INTO clientes
     (nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion]
  );
  return result.insertId;
}

async function update(id_cliente, data) {
  const {
    nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion
  } = data;

  await pool.query(
    `UPDATE clientes SET
       nombres = ?, apellidos = ?, dpi = ?, nit = ?,
       fecha_nacimiento = ?, telefono = ?, correo = ?, direccion = ?
     WHERE id_cliente = ?`,
    [nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion, id_cliente]
  );
}

async function deleteById(id_cliente) {
  const [result] = await pool.query(
    "DELETE FROM clientes WHERE id_cliente = ?",
    [id_cliente]
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
