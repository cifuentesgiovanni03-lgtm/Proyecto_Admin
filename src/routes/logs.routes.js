const express = require("express");
const router = express.Router();
const {
  listarLogs,
  listarAuditoria,
  listarReportesGenerados
} = require("../controllers/logs.controller");
const { verificarToken } = require("../middlewares/auth.middleware");
const { verificarPermiso } = require("../middlewares/permiso.middleware");

router.get("/logs", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), listarLogs);
router.get("/auditoria", verificarToken, verificarPermiso("GESTIONAR_USUARIOS"), listarAuditoria);
router.get("/reportes-generados", verificarToken, verificarPermiso("VER_REPORTES"), listarReportesGenerados);

module.exports = router;
