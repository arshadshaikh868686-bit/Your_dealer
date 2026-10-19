const mongoose = require("mongoose"); // mongoose import

const carSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", required: true }, // ye car kis dealer ki hai
    brand: { type: String, required: true, trim: true }, // jaise Honda
    model: { type: String, required: true, trim: true }, // jaise City
    year: { type: Number, required: true }, // manufacturing year
    price: { type: Number, required: true }, // bechne ka rate
    fuelType: { type: String, enum: ["Petrol", "Diesel", "CNG", "Electric"], default: "Petrol" }, // sirf ye 4 values allowed
    transmission: { type: String, enum: ["Manual", "Automatic"], default: "Manual" }, // gear type
    kmDriven: { type: Number, default: 0 }, // kitna chali hai
    color: { type: String, trim: true }, // rang
    category: { type: String, enum: ["Sedan", "SUV", "Sports", "Hatchback"], required: true }, // gaadi ki variety
    status: { type: String, enum: ["Available", "Sold"], default: "Available" }, // abhi bikni baaki hai ya bik gayi
    soldPrice: { type: Number }, // jis rate pe bika
    soldDate: { type: Date }, // kis din bika
    images: [{ type: String }], // image URLs (Cloudinary, step 2 me)
    documents: [{ name: String, url: String }], // papers: naam (RC/Insurance) + URL
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Car", carSchema); // model export