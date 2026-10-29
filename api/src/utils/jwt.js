const jwt = require("jsonwebtoken");

//generate token jwt
function generateToken(user) {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  return token;
}

//validate token jwt
function validateToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET_KEY);
}

module.exports = { generateToken, validateToken };
