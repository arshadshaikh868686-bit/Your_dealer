const express = require("express");
const protect = require("../middleware/auth");
// const Dealer = require('../models/deler');

const { createOrder, verifyPayment } = require("../controller/paymentcontroller");

const router = express.Router();
router.use(protect);

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

module.exports = router;