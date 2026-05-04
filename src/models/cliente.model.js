const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
    "SELECT * FROM clientes ORDER BY id_cliente DESC"
  );
  return rows;
}

async function create(data) {
  const {
    nombres,
    apellidos,
    dpi,
    nit,
    fecha_nacimiento,
    telefono,
    correo,
    direccion
  } = data;

  const [result] = await pool.query(
    `INSERT INTO clientes
     (nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombres, apellidos, dpi, nit, fecha_nacimiento, telefono, correo, direccion]
  );
  return result.insertId;
}

module.exports = {
  findAll,
  create
};
