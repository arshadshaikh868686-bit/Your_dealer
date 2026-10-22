const mongoose = require("mongoose"); // mongoose import

const paymentSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", required: true }, // kis dealer ka order
    orderId: { type: String, required: true, unique: true }, // razorpay ka order id
    paymentId: { type: String }, // payment hone ke baad ka id
    amount: { type: Number, required: true }, // paise me (19900 = ₹199)
    status: { type: String, enum: ["created", "paid"], default: "created" }, // order bana ya paisa aaya
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Payment", paymentSchema); // export