const { getMongoDb } = require("../config/mongodb");

async function guardarReporteGenerado(data) {
  const db = getMongoDb();

  await db.collection("reportes_generados").insertOne({
    ...data,
    fecha_generacion: new Date()
  });
}

module.exports = {
  guardarReporteGenerado
};