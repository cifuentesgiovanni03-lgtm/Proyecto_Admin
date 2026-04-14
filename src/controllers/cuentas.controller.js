const pool = require("../config/mysql");

async function listarCuentas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id_cuenta, c.numero_cuenta, c.saldo, c.moneda, c.estado,
              cl.nombres, cl.apellidos, tc.nombre AS tipo_cuenta
       FROM cuentas c
       INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
       INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
       ORDER BY c.id_cuenta DESC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function crearCuenta(req, res) {
  try {
    const { numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda } = req.body;

    const [result] = await pool.query(
      `INSERT INTO cuentas
      (numero_cuenta, id_cliente, id_tipo_cuenta, saldo, moneda)
      VALUES (?, ?, ?, ?, ?)`,
      [numero_cuenta, id_cliente, id_tipo_cuenta, saldo || 0, moneda || "GTQ"]
    );

    res.status(201).json({
      message: "Cuenta creada correctamente",
      id_cuenta: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  listarCuentas,
  crearCuenta
};