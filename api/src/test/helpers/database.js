const mongoose = require("mongoose");
const { MongoMemoryServer } = require(
  "mongodb-memory-server"
);

let mongoServer;

async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri(), {
    serverSelectionTimeoutMS: 3000,
    runtimeAdapters: { os: require("os") },
  });
}

async function clearTestDatabase() {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

async function closeTestDatabase() {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
}

module.exports = {
  connectTestDatabase,
  clearTestDatabase,
  closeTestDatabase
};