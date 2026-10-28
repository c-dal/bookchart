const { validateToken } = require("../utils/jwt");

function unauthorized(res, message) {
  return res.status(401).json({ error: { code: "UNAUTHORIZED", message } });
}

function authenticate(req, res, next){
    const tokenHeader = req.headers.token;

    if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
        return unauthorized(res, "Token missing");
    }

    const token = tokenHeader.split(" ")[1];

    try{
        const decoded = validateToken(token);
        req.user = decoded
        return next()
    } catch (error) {
        return unauthorized(res, "Invalid or expired token");
    }
}

module.exports =  authenticate ;