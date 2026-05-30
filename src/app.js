require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const pool = require("./config/mysql");
const { connectMongo } = require("./config/mongodb");

const authRoutes = require("./routes/auth.routes");
const clientesRoutes = require("./routes/clientes.routes");
const cuentasRoutes = require("./routes/cuentas.routes");
const transaccionesRoutes = require("./routes/transacciones.routes");
const reportesRoutes = require("./routes/reportes.routes");
const bancosRoutes = require("./routes/bancos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const rolesRoutes = require("./routes/roles.routes");
const permisosRoutes = require("./routes/permisos.routes");
const publicRoutes = require("./routes/public.routes");
const logsRoutes = require("./routes/logs.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    mensaje: "API ERP Bancario activa"
  });
});

app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    const mongo = await connectMongo();
    const mongoPing = await mongo.command({ ping: 1 });

    res.json({
      status: "ok",
      mysql: rows[0],
      mongodb: mongoPing
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/cuentas", cuentasRoutes);
app.use("/api/transacciones", transaccionesRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/bancos", bancosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permisos", permisosRoutes);
app.use("/api/public", publicRoutes);
app.use("/api", logsRoutes);

const PORT = process.env.PORT || 3000;

async function seedPermisos() {
  try {
    const [existe] = await pool.query("SELECT COUNT(*) AS total FROM permisos");
    if (existe[0].total > 0) {
      console.log("Permisos ya existen, omitiendo seed");
      return;
    }

    console.log("Sembrando permisos...");
    await pool.query(`
      INSERT IGNORE INTO permisos (nombre, descripcion) VALUES
        ('VER_TRANSACCIONES', 'Ver listado de transacciones'),
        ('REALIZAR_DEPOSITO', 'Realizar depositos'),
        ('REALIZAR_RETIRO', 'Realizar retiros'),
        ('REALIZAR_TRANSFERENCIA_INTERNA', 'Realizar transferencias internas'),
        ('REALIZAR_TRANSFERENCIA_EXTERNA', 'Realizar transferencias externas'),
        ('VER_BANCOS', 'Ver listado de bancos'),
        ('GESTIONAR_BANCOS', 'Crear y editar bancos'),
        ('ELIMINAR_BANCOS', 'Eliminar bancos'),
        ('VER_CLIENTES', 'Ver listado de clientes'),
        ('GESTIONAR_CLIENTES', 'Crear y editar clientes'),
        ('ELIMINAR_CLIENTES', 'Eliminar clientes'),
        ('VER_CUENTAS', 'Ver listado de cuentas'),
        ('GESTIONAR_CUENTAS', 'Crear y editar cuentas'),
        ('ELIMINAR_CUENTAS', 'Eliminar cuentas'),
        ('VER_REPORTES', 'Ver reportes'),
        ('GESTIONAR_USUARIOS', 'Gestionar usuarios'),
        ('GESTIONAR_ROLES', 'Gestionar roles'),
        ('ASIGNAR_PERMISOS', 'Asignar permisos a roles'),
        ('GESTIONAR_PERMISOS', 'Gestionar permisos')
    `);

    await pool.query("INSERT IGNORE INTO rol_permiso (id_rol, id_permiso) SELECT 1, id_permiso FROM permisos");

    console.log("Permisos sembrados correctamente");
  } catch (error) {
    console.error("Error sembrando permisos:", error.message);
  }
}

async function startServer() {
  try {
    console.log("Probando MySQL...");
    await pool.query("SELECT 1");
    console.log("MySQL conectado");

    console.log("Probando MongoDB...");
    await connectMongo();
    console.log("MongoDB conectado");

    await seedPermisos();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar la API:");
    console.error(error);
    process.exit(1);
  }
}

startServer();