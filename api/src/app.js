const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { authRouter } = require("./routes/auth");
const { libraryRouter } = require("./routes/library");
const { searchRouter } = require("./routes/search");
const { bookRouter } = require("./routes/book");

const app = express();

const cors = require("cors");

const allowedOrigins = [process.env.CORS_ORIGIN].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/library", libraryRouter);
app.use("/api/search", searchRouter);
app.use("/api/book", bookRouter);

module.exports = app;
