const { validateToken } = require("../utils/jwt");
const sendError = require("../utils/sendError");

function authenticate(req, res, next) {
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "UNAUTHORIZED", "Token missing");
  }

  const token = tokenHeader.split(" ")[1];

  try {
    const decoded = validateToken(token);
    req.user = decoded;
    return next();
  } catch {
    return sendError(res, 401, "UNAUTHORIZED", "Invalid or expired token");
  }
}

module.exports = authenticate;
