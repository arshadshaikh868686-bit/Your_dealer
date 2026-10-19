const mongoose = require("mongoose"); // mongoose import

const dealerSchema = new mongoose.Schema(
  {
    dealershipName: { type: String, required: true, trim: true }, // showroom ka naam, extra space hata do
    ownerName: { type: String, required: true, trim: true }, // malik ka naam
    email: {
      type: String,
      required: true,
      unique: true, // ek email se ek hi account
      lowercase: true, // email hamesha chhote letters me save hoga
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 }, // hashed password yaha save hoga
  },
  { timestamps: true } // createdAt aur updatedAt apne aap ban jayenge
);

module.exports = mongoose.model("Dealer", dealerSchema); // model export