const express = require("express");
const router = express.Router();
const {
  listarBancos,
  obtenerBanco,
  crearBanco,
  actualizarBanco,
  eliminarBanco
} = require("../controllers/bancos.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, listarBancos);
router.get("/:id_banco", verificarToken, obtenerBanco);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), crearBanco);
router.put("/:id_banco", verificarToken, verificarRol("ADMINISTRADOR", "OPERADOR"), actualizarBanco);
router.delete("/:id_banco", verificarToken, verificarRol("ADMINISTRADOR"), eliminarBanco);

module.exports = router;
