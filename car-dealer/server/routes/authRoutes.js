const express = require("express"); // express import
const { register, login, me } = require("../controller/authcontroller"); // controller functions
const protect = require("../middleware/auth"); // login check middleware

const router = express.Router(); // router banaya

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.get("/me", protect, me); // GET /api/auth/me (sirf logged-in ke liye)

module.exports = router; // export