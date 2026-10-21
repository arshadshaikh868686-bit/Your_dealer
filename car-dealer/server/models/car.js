const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "CNG", "Electric"], default: "Petrol" },
    transmission: { type: String, enum: ["Manual", "Automatic"], default: "Manual" },
    kmDriven: { type: Number, default: 0 },
    color: { type: String, trim: true },
    category: { type: String, enum: ["Sedan", "SUV", "Sports", "Hatchback"], required: true },
    registrationNumber: { type: String, trim: true, uppercase: true },
    ownerCount: { type: Number, min: 1, default: 1 },
    insuranceExpiry: { type: Date },
    description: { type: String, trim: true },
    listedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Available", "Sold"], default: "Available" },
    soldPrice: { type: Number },
    soldDate: { type: Date },
    buyerName: { type: String, trim: true },
    buyerPhone: { type: String, trim: true },
    buyerPhoto: { type: String },
    images: [{ type: String }],
    documents: [{ name: String, url: String }],
    purchasePrice: { type: Number, min: 0 },
    expenses: [{ title: { type: String, trim: true }, amount: { type: Number, min: 0 } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);
