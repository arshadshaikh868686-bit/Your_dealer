const mongoose = require("mongoose"); // mongoose import kiya, MongoDB se baat karne ke liye

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // .env wale URL se DB connect karo
    console.log("MongoDB connected"); // connect ho gaya to messag
  } catch (err) {
    console.error("DB error:", err.message); // error aaya to print karo
    process.exit(1); // DB ke bina app chalane ka matlab nahi, isliye band kar do
  }
};

module.exports = connectDB; // dusri file me use karne ke liye export