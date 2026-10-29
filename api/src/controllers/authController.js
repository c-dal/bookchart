const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const sendError = require("../utils/sendError");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  try {
    const notNormalizedemail = req.body.email;
    const pw = req.body.password;
    const username = req.body.username;

    if (!notNormalizedemail || !pw || !username) {
      return sendError(
        res,
        401,
        "INVALID_INPUT",
        "The email, username and password are required",
      );
    }

    const email = notNormalizedemail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      return sendError(res, 400, "INVALID_INPUT", "Email is not valid");
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return sendError(
        res,
        409,
        "EMAIL_ALREADY_USED",
        "This email is already in use",
      );
    }

    const existingUserName = await User.findOne({ username: username });
    if (existingUserName) {
      return sendError(
        res,
        409,
        "USERNAME_ALREADY_USED",
        "This username is already in use",
      );
    }

    if (pw.length < 8) {
      return sendError(
        res,
        400,
        "INVALID_INPUT",
        "Password must be at least 8 characters",
      );
    }

    const pwhash = await bcrypt.hash(pw, 10);

    const user = await User.create({
      username: username,
      email: email,
      passwordHash: pwhash,
    });

    const token = generateToken(user);

    return res.status(201).json({
      user: { id: user._id.toString(), email: user.email },
      token,
    });
  } catch {
    return sendError(res, 500, "INTERNAL_ERROR", "Registration failed");
  }
}

async function login(req, res) {
  try {
    const notNormalizedemail = req.body.email;
    const pwhash = req.body.password;

    if (!notNormalizedemail || !pwhash) {
      return sendError(
        res,
        400,
        "INVALID_INPUT",
        "Email and password are required",
      );
    }

    const email = notNormalizedemail.trim().toLowerCase();

    const user = await User.findOne({ email: email });

    if (!user) {
      return sendError(
        res,
        401,
        "UNAUTHORIZED",
        "Invalid user email or password",
      );
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
}

module.exports = { register, login };
