const multer = require("multer");

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Sirf JPG, PNG, WEBP ya PDF allowed hai"));
  },
});

const handle = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

module.exports = { upload, handle };
