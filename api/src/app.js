const express = require("express");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API démarrée sur le port ${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de connexion ou de démarrage :", error);
    process.exit(1);
  }
}

startServer();
