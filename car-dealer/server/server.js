require("dotenv").config(); // .env file load karo (sabse pehle)
const express = require("express"); // express import
const cors = require("cors"); // frontend ko backend se baat karne dene ke liye
const connectDB = require("./config/db"); // DB connect function

const app = express(); // app banaya

app.use(cors()); // CORS on
app.use(express.json()); 

app.use("/api/auth", require("./routes/authRoutes")); 

app.get("/", (req, res) => res.send("Car Dealer API chal rahi hai")); // test route
app.use("/api/cars", require("./routes/carRoutes")); // car routes yaha jude
const PORT = process.env.PORT || 5000; // port .env se, nahi to 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server port ${PORT} pe chal raha hai`)); // DB connect hone ke baad hi server start
});