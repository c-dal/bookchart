const express = require("express");
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require("./config/db");
const authenticate = require("./middleware/auth");
const { register, login } = require("./routes/authFunctions");
const { searchRouter } = require("./routes/search");
const { getUserBooks, changeBookStatus, removeBook } = require("./routes/libraryFunctions");
const { bookRouter } = require("./routes/book");

const app = express();

const cors = require('cors');

const PORT = process.env.PORT;

const allowedOrigins = [
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

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

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/library", authenticate, getUserBooks);
app.delete("/api/library/:bookId/remove", authenticate, removeBook )
app.patch("/api/library/:bookId/status", authenticate, changeBookStatus);
app.use("/api/search", searchRouter);
app.use("/api/book", bookRouter);

//test to see if the middleware auth works
app.get("/api/library", authenticate, (req, res) => {
  res.json({ userId: req.user.userId });
});

startServer();
