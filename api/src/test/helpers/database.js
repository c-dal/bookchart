const mongoose = require("mongoose");
const { MongoMemoryServer } = require(
  "mongodb-memory-server"
);

let mongoServer;

async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
}

async function clearTestDatabase() {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

async function closeTestDatabase() {
  await mongoose.disconnect();
  await mongoServer.stop();
}

module.exports = {
  connectTestDatabase,
  clearTestDatabase,
  closeTestDatabase
};