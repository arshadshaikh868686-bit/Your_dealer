const multer = require("multer"); // file upload handle karne ke liye

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"]; // sirf ye types allowed

const upload = multer({
  storage: multer.memoryStorage(), // file disk pe nahi, RAM (buffer) me rakho
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB per file
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true); // type sahi hai to aage badho
    else cb(new Error("Sirf JPG, PNG, WEBP ya PDF allowed hai")); // warna error
  },
});

// multer ke errors ko saaf JSON message me badalne wala wrapper
const handle = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message }); // size/type error yaha pakda
    next(); // sab theek to controller pe jao
  });

module.exports = { upload, handle }; // export