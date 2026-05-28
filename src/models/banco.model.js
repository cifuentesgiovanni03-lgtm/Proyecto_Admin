const pool = require("../config/mysql");

async function findAll() {
  const [rows] = await pool.query(
     `SELECT id_banco, nombre, codigo_banco, pais, estado, fecha_registro,
             api_url, api_token, api_json_template,
             api_auth_url, api_auth_email, api_account_search_url,
             api_auth_header_name, api_auth_header_prefix,
             moneda_externa
     FROM bancos
     ORDER BY nombre ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
     `SELECT id_banco, nombre, codigo_banco, pais, estado, fecha_registro,
             api_url, api_token, api_json_template,
             api_auth_url, api_auth_email, api_auth_password, api_account_search_url,
             api_auth_header_name, api_auth_header_prefix,
             moneda_externa
     FROM bancos
     WHERE id_banco = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ nombre, codigo_banco, pais, api_url, api_token, api_json_template, api_auth_url, api_auth_email, api_auth_password, api_account_search_url, api_auth_header_name, api_auth_header_prefix, moneda_externa }) {
  const [result] = await pool.query(
    `INSERT INTO bancos (nombre, codigo_banco, pais, api_url, api_token, api_json_template,
                         api_auth_url, api_auth_email, api_auth_password, api_account_search_url,
                         api_auth_header_name, api_auth_header_prefix,
                         moneda_externa)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, codigo_banco, pais || "Guatemala", api_url || null, api_token || null, api_json_template || null,
     api_auth_url || null, api_auth_email || null, api_auth_password || null, api_account_search_url || null,
     api_auth_header_name || null, api_auth_header_prefix || null,
     moneda_externa || null]
  );
  return result.insertId;
}

async function update(id, { nombre, codigo_banco, pais, api_url, api_token, api_json_template,
                            api_auth_url, api_auth_email, api_auth_password, api_account_search_url,
                            api_auth_header_name, api_auth_header_prefix,
                            moneda_externa, estado }) {
  await pool.query(
    `UPDATE bancos
     SET nombre = ?, codigo_banco = ?, pais = ?, api_url = ?, api_token = ?, api_json_template = ?,
         api_auth_url = ?, api_auth_email = ?, api_auth_password = ?, api_account_search_url = ?,
         api_auth_header_name = ?, api_auth_header_prefix = ?,
         moneda_externa = ?, estado = ?
     WHERE id_banco = ?`,
    [nombre, codigo_banco, pais, api_url || null, api_token || null, api_json_template || null,
     api_auth_url || null, api_auth_email || null, api_auth_password || null, api_account_search_url || null,
     api_auth_header_name || null, api_auth_header_prefix || null,
     moneda_externa || null, estado || "ACTIVO", id]
  );
}

async function deleteById(id) {
  const [result] = await pool.query(
    "DELETE FROM bancos WHERE id_banco = ?",
    [id]
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
