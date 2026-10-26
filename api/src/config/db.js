const mongoose = require("mongoose");

async function connectDB() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://mongo:27017/monapp"
  );

  console.log("MongoDB connecté !");
}

module.exports = connectDB;
