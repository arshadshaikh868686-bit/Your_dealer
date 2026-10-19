const bcrypt = require("bcryptjs"); // password hash karne ke liye
const jwt = require("jsonwebtoken"); // token banane ke liye
const Dealer = require("../models/deler"); // Dealer model

// token banane ka chhota helper, 7 din valid
const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ---------- REGISTER ----------
exports.register = async (req, res) => {
  try {
    const { dealershipName, ownerName, email, password } = req.body; // frontend se aaya data

    if (!dealershipName || !ownerName || !email || !password) {
      return res.status(400).json({ message: "Saari fields bharo" }); // koi field khaali
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password kam se kam 6 character ka ho" }); // chhota password
    }

    const exists = await Dealer.findOne({ email: email.toLowerCase() }); // email pehle se hai kya
    if (exists) {
      return res.status(400).json({ message: "Ye email pehle se registered hai" }); // duplicate
    }

    const hashed = await bcrypt.hash(password, 10); // password ko hash kiya (10 = salt rounds)
    const dealer = await Dealer.create({ dealershipName, ownerName, email, password: hashed }); // DB me save

    res.status(201).json({
      token: makeToken(dealer._id), // login token
      dealer: { id: dealer._id, dealershipName: dealer.dealershipName, ownerName: dealer.ownerName, email: dealer.email }, // password kabhi wapas mat bhejo
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message }); // koi unexpected error
  }
};

// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // email aur password liya

    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password dono daalo" }); // khaali check
    }

    const dealer = await Dealer.findOne({ email: email.toLowerCase() }); // dealer dhoondo
    if (!dealer) {
      return res.status(400).json({ message: "Email ya password galat hai" }); // wahi message jaan bujhkar, hacker ko hint na mile
    }

    const ok = await bcrypt.compare(password, dealer.password); // hash se compare
    if (!ok) {
      return res.status(400).json({ message: "Email ya password galat hai" }); // password galat
    }

    res.json({
      token: makeToken(dealer._id), // naya token
      dealer: { id: dealer._id, dealershipName: dealer.dealershipName, ownerName: dealer.ownerName, email: dealer.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- ME (token se dealer ki info) ----------
exports.me = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealerId).select("-password"); // password hata ke data lao
    if (!dealer) return res.status(404).json({ message: "Dealer nahi mila" }); // account delete ho gaya ho to
    res.json(dealer); // dealer ka data bhejo
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};