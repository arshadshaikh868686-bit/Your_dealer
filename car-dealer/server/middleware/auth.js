const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token nahi mila, login karo" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.dealerId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token galat ya expire ho gaya" });
  }
};

module.exports = protect;
