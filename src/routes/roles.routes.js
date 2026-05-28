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
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/", verificarToken, verificarPermiso("GESTIONAR_ROLES"), listarRoles);
router.get("/:id_rol", verificarToken, verificarPermiso("GESTIONAR_ROLES"), obtenerRol);
router.post("/", verificarToken, verificarPermiso("GESTIONAR_ROLES"), crearRol);
router.put("/:id_rol", verificarToken, verificarPermiso("GESTIONAR_ROLES"), actualizarRol);
router.delete("/:id_rol", verificarToken, verificarPermiso("GESTIONAR_ROLES"), eliminarRol);
router.post("/:id_rol/permisos", verificarToken, verificarPermiso("ASIGNAR_PERMISOS"), asignarPermisos);

module.exports = router;
