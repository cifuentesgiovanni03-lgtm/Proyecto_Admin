const { getMongoDb } = require("../config/mongodb");

async function registrarAuditoria(data) {
  const db = getMongoDb();
  const collection = db.collection("auditoria");

  await collection.insertOne({
    ...data,
    fecha: new Date()
  });
}

async function registrarLog(data) {
  const db = getMongoDb();
  const collection = db.collection("logs_sistema");

  await collection.insertOne({
    ...data,
    fecha: new Date()
  });
}

module.exports = {
  registrarAuditoria,
  registrarLog
};