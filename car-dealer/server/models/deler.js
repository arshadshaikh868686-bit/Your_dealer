const mongoose = require("mongoose");

const dealerSchema = new mongoose.Schema(
  {
    dealershipName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    planExpiresAt: { type: Date },
    totalCarsAdded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dealer", dealerSchema);
