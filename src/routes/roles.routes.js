const express = require("express");
const router = express.Router();
const {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
  asignarPermisos
} = require("../controllers/roles.controller");
const {
  verificarToken,
  verificarRol
} = require("../middlewares/auth.middleware");

router.get("/", verificarToken, verificarRol("ADMINISTRADOR"), listarRoles);
router.get("/:id_rol", verificarToken, verificarRol("ADMINISTRADOR"), obtenerRol);
router.post("/", verificarToken, verificarRol("ADMINISTRADOR"), crearRol);
router.put("/:id_rol", verificarToken, verificarRol("ADMINISTRADOR"), actualizarRol);
router.delete("/:id_rol", verificarToken, verificarRol("ADMINISTRADOR"), eliminarRol);
router.post("/:id_rol/permisos", verificarToken, verificarRol("ADMINISTRADOR"), asignarPermisos);

module.exports = router;
