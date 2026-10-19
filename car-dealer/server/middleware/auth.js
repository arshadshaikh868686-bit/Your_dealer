const jwt = require("jsonwebtoken"); // token verify karne ke liye

const protect = (req, res, next) => {
  const header = req.headers.authorization; // header: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token nahi mila, login karo" }); // token hi nahi hai
  }
  try {
    const token = header.split(" ")[1]; // "Bearer" hata ke sirf token nikala
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // token sahi hai ya nahi check
    req.dealerId = decoded.id; // dealer ki id request me chipka di, aage controllers use karenge
    next(); // aage badho
  } catch (err) {
    return res.status(401).json({ message: "Token galat ya expire ho gaya" }); // token kharab
  }
};

module.exports = protect; // export