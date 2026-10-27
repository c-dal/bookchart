const express = require("express");
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");

const User = require("./models/User");
const { generateToken } = require("./utils/jwt");
const connectDB = require("./config/db");
const authenticate = require("./middleware/auth");

const app = express();

dotenv.config();

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

//register
app.post("/api/auth/register", async (req, res) => {
  try{
    const notNormalizedemail = req.body.email 
    const pw = req.body.password
    const username = req.body.username

    if (!notNormalizedemail || !pw || !username) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const email = notNormalizedemail.trim().toLowerCase();

    //check if the user already exists and if it does send an error
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({
        message: "This email is already in use"
      });
    }

    const existingUserName = await User.findOne({ username: username });
    if (existingUserName) {
      return res.status(409).json({
        message: "This username is already in use"
      });
    }
        
    const pwhash = await bcrypt.hash(pw, 10);

    const user = await User.create({
        username: username,
        email: email,
        passwordHash: pwhash
    });

    res.status(201).json({
        id: user._id,
        email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

//login
app.post("/api/auth/login", async (req, res) => {
  try{
    const notNormalizedemail = req.body.email
    const pwhash = req.body.password

    if (!notNormalizedemail || !pwhash) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const email = notNormalizedemail.trim().toLowerCase();

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const isValid = await bcrypt.compare(pwhash, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    res.status(201).json({
        id: user._id,
        email: user.email,
        token: token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

//test to see if the middleware auth works
app.get("/api/library", authenticate, (req, res) => {
  res.json({ userId: req.user.userId });
});

startServer();
