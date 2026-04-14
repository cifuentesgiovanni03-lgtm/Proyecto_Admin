const express = require("express");
const router = express.Router();
const {
  listarTransacciones,
  crearDeposito
} = require("../controllers/transacciones.controller");

router.get("/", listarTransacciones);
router.post("/deposito", crearDeposito);

module.exports = router;