const express = require("express");
const router = express.Router();
const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarPassword,
  eliminarUsuario
} = require("../controllers/usuarios.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, verificarRol("ADMINISTRADOR"), listarUsuarios);
router.get("/:id_usuario", verificarToken, verificarRol("ADMINISTRADOR"), obtenerUsuario);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR"), crearUsuario);
router.put("/:id_usuario", verificarToken, verificarRol("ADMINISTRADOR"), actualizarUsuario);
router.put("/:id_usuario/password", verificarToken, verificarRol("ADMINISTRADOR"), cambiarPassword);
router.delete("/:id_usuario", verificarToken, verificarRol("ADMINISTRADOR"), eliminarUsuario);

module.exports = router;
