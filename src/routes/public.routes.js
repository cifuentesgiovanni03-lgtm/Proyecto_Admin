const express = require("express");
const router = express.Router();
const pool = require("../config/mysql");

router.get("/cuentas-disponibles", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id_cuenta, c.numero_cuenta, c.moneda,
              cl.nombres, cl.apellidos, tc.nombre AS tipo_cuenta
       FROM cuentas c
       INNER JOIN clientes cl ON c.id_cliente = cl.id_cliente
       INNER JOIN tipos_cuenta tc ON c.id_tipo_cuenta = tc.id_tipo_cuenta
       WHERE c.estado = 'ACTIVA'
       ORDER BY c.id_cuenta ASC`
    );

    res.json({
      banco: "ERP Bancario",
      total_cuentas: rows.length,
      cuentas: rows.map(r => ({
        id_cuenta: r.id_cuenta,
        numero_cuenta: r.numero_cuenta,
        moneda: r.moneda,
        titular: r.nombres + " " + r.apellidos,
        tipo_cuenta: r.tipo_cuenta
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
