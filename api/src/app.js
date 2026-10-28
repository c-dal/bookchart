const express = require("express");
const dotenv = require('dotenv');
dotenv.config();

const authenticate = require("./middleware/auth");
const { register, login } = require("./routes/authFunctions");
const { searchRouter } = require("./routes/search");
const { getUserBooks, changeBookStatus, removeBook } = require("./routes/libraryFunctions");
const { bookRouter } = require("./routes/book");
const sendError = require("./utils/sendError");

const app = express();

const cors = require('cors');

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

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.use("/api/search", searchRouter);
app.use("/api/book", bookRouter);

//test to see if the middleware auth works
app.get("/api/library", authenticate, (req, res) => {
  res.json({ userId: req.user.userId });
});

app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/library", authenticate, getUserBooks);
app.delete("/api/library/:bookId/remove", authenticate, removeBook )
app.patch("/api/library/:bookId/status", authenticate, changeBookStatus);
app.use("/api/search", authenticate, searchRouter);
app.use("/api/book", authenticate, bookRouter);

module.exports = app;