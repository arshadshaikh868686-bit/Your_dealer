const express = require("express");
const protect = require("../middleware/auth");
const { upload, handle } = require("../middleware/uplods");
const { addCar, getCars, getStats, getCar, updateCar, updateStatus, deleteCar } = require("../controller/carcontroller");
const { addImages, addDocument, deleteDocument } = require("../controller/uplodecontroller");

const router = express.Router();
router.use(protect);

router.get("/stats", getStats);
router.route("/").get(getCars).post(addCar);
router.post("/:id/images", handle(upload.array("images", 5)), addImages);
router.post("/:id/documents", handle(upload.single("file")), addDocument);
router.delete("/:id/documents/:docId", deleteDocument);
router.patch("/:id/status", handle(upload.single("buyerPhoto")), updateStatus);
router.route("/:id").get(getCar).put(updateCar).delete(deleteCar);

module.exports = router;
