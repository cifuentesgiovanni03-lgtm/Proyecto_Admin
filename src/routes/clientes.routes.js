const express = require("express");
const router = express.Router();
const {
  listarClientes,
  crearCliente
} = require("../controllers/clientes.controller");

router.get("/", listarClientes);
router.post("/", crearCliente);

module.exports = router;