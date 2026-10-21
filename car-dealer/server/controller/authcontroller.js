const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Dealer = require("../models/deler");
const { FREE_LIMIT, isProActive } = require("../config/plan");

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { dealershipName, ownerName, email, password } = req.body;

    if (!dealershipName || !ownerName || !email || !password) {
      return res.status(400).json({ message: "Saari fields bharo" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password kam se kam 6 character ka ho" });
    }

    const exists = await Dealer.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Ye email pehle se registered hai" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const dealer = await Dealer.create({ dealershipName, ownerName, email, password: hashed });

    res.status(201).json({
      token: makeToken(dealer._id),
      dealer: { id: dealer._id, dealershipName: dealer.dealershipName, ownerName: dealer.ownerName, email: dealer.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password dono daalo" });
    }

    const dealer = await Dealer.findOne({ email: email.toLowerCase() });
    if (!dealer) {
      return res.status(400).json({ message: "Email ya password galat hai" });
    }

    const ok = await bcrypt.compare(password, dealer.password);
    if (!ok) {
      return res.status(400).json({ message: "Email ya password galat hai" });
    }

    res.json({
      token: makeToken(dealer._id),
      dealer: { id: dealer._id, dealershipName: dealer.dealershipName, ownerName: dealer.ownerName, email: dealer.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealerId).select("-password");
    if (!dealer) return res.status(404).json({ message: "Dealer nahi mila" });
    const proActive = isProActive(dealer);
    res.json({
      ...dealer.toObject(),
      freeLimit: FREE_LIMIT,
      proActive,
      canAddCars: proActive || dealer.totalCarsAdded < FREE_LIMIT,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
