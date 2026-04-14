const express = require("express");
const router = express.Router();
const {
  listarCuentas,
  crearCuenta
} = require("../controllers/cuentas.controller");

router.get("/", listarCuentas);
router.post("/", crearCuenta);

module.exports = router;