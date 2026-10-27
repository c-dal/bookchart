const express = require("express");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
dotenv.config();

const User = require("./models/User");
const { generateToken } = require("./utils/jwt");
const connectDB = require("./config/db");
const authenticate = require("./middleware/auth");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

//register
app.post("/api/auth/register", async (req, res) => {
  try{
    const notNormalizedemail = req.body.email 
    const pw = req.body.password
    const username = req.body.username

    if (!notNormalizedemail || !pw || !username) {
      return sendError(res, 400, "INVALID_INPUT", "Email and password are required");
    }

    const email = notNormalizedemail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return sendError(res, 400, "INVALID_INPUT", "Email is not valid");
    }

    //check if the user already exists and if it does send an error
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return sendError(res, 409, "EMAIL_ALREADY_USED", "This email is already in use");
    }

    const existingUserName = await User.findOne({ username: username });
    if (existingUserName) {
      return sendError(res, 409, "USERNAME_ALREADY_USED", "This username is already in use");
    }

    if (pw.length < 8) {
      return sendError(res, 400, "INVALID_INPUT", "Password must be at least 8 characters");
    }
        
    const pwhash = await bcrypt.hash(pw, 10);

    const user = await User.create({
        username: username,
        email: email,
        passwordHash: pwhash
    });

    const token = generateToken(user);

    return res.status(201).json({
      user: { id: user._id.toString(), email: user.email },
      token,
    });
  } catch (error) {
    return sendError(res, 500, "INTERNAL_ERROR", "Registration failed");
  }
});

//login
app.post("/api/auth/login", async (req, res) => {
  try{
    const notNormalizedemail = req.body.email
    const pwhash = req.body.password

    if (!notNormalizedemail || !pwhash) {
      return sendError(res, 400, "INVALID_INPUT", "Email and password are required");
    }

    const email = notNormalizedemail.trim().toLowerCase();

    const user = await User.findOne({ email: email });

    if (!user) {
      return sendError(res, 401, "UNAUTHORIZED", "Invalid email or password");
    }

    const isValid = await bcrypt.compare(pwhash, user.passwordHash);

    if (!isValid) {
       return sendError(res, 401, "UNAUTHORIZED", "Invalid email or password");
    }

    const token = generateToken(user);

    return res.status(200).json({
      user: { id: user._id.toString(), email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "INTERNAL_ERROR", "Login failed");
  }
});

//test to see if the middleware auth works
app.get("/api/library", authenticate, (req, res) => {
  res.json({ userId: req.user.userId });
});

startServer();
