const { validateToken } = require("../utils/jwt");

function authenticate(req, res, next){
    const tokenHeader = req.headers.token;

    if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing" });
  }

  const token = tokenHeader.split(" ")[1];

  try{
    const decoded = validateToken(token);
    req.user = decoded
    next()
    return res.status(401).json({ error: "Invalid token" });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports =  authenticate ;