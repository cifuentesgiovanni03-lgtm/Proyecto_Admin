const { MongoClient } = require("mongodb");

let client;
let db;

async function connectMongo() {
  if (db) return db;

  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db(process.env.MONGO_DB_NAME);
  console.log("MongoDB conectado");
  return db;
}

function getMongoDb() {
  if (!db) {
    throw new Error("MongoDB no está inicializado");
  }
  return db;
}

module.exports = {
  connectMongo,
  getMongoDb
};