const express = require("express"); // express import
const protect = require("../middleware/auth"); // login check
const { addCar, getCars, getStats, getCar, updateCar, updateStatus, deleteCar } = require("../controller/carcontroller");

const router = express.Router(); // router

router.use(protect); // is file ke saare routes login mange
const { upload, handle } = require("../middleware/uplods"); // multer wrapper
const { addImages, addDocument, deleteDocument } = require("../controller/uplodecontroller"); // upload controllers
router.get("/stats", getStats); // /stats pehle, /:id se upar
router.route("/").get(getCars).post(addCar); // list aur add
router.route("/:id").get(getCar).put(updateCar).delete(deleteCar); // ek car: dekho, edit, delete
router.patch("/:id/status", updateStatus); // sold/available

module.exports = router; // export