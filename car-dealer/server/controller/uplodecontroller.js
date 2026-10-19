const mongoose = require("mongoose"); // id validation ke liye
const cloudinary = require("../config/cloudnary"); // cloudinary config
const Car = require("../models/car"); // Car model

// buffer ko cloudinary pe bhejne ka helper, URL wapas deta hai
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" }, // auto = image aur pdf dono chalenge
      (err, result) => (err ? reject(err) : resolve(result)) // error ya result
    );
    stream.end(buffer); // buffer stream me daal diya
  });

// apni car dhoondne ka helper (id check + dealer check)
const findMyCar = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Galat car id" }); // id format galat
    return null;
  }
  const car = await Car.findOne({ _id: req.params.id, dealer: req.dealerId }); // sirf apni car
  if (!car) res.status(404).json({ message: "Car nahi mili" }); // nahi mili
  return car;
};

// ---------- IMAGES UPLOAD (max 5) ----------
exports.addImages = async (req, res) => {
  try {
    const car = await findMyCar(req, res); // car lao
    if (!car) return; // response already chala gaya
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Koi image nahi mili" }); // file khaali

    const onlyImages = req.files.every((f) => f.mimetype.startsWith("image/")); // sab image hain?
    if (!onlyImages) return res.status(400).json({ message: "Yaha sirf images daalo" }); // pdf mat do

    const results = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer, "cardealer/images"))); // sab ek saath upload
    car.images.push(...results.map((r) => r.secure_url)); // URLs car me jode
    await car.save(); // save
    res.json(car); // updated car
  } catch (err) {
    res.status(500).json({ message: "Upload fail", error: err.message });
  }
};

// ---------- DOCUMENT UPLOAD ----------
exports.addDocument = async (req, res) => {
  try {
    const car = await findMyCar(req, res);
    if (!car) return;
    if (!req.file) return res.status(400).json({ message: "File nahi mili" }); // file field missing
    const name = (req.body.name || "").trim(); // paper ka naam (RC, Insurance...)
    if (!name) return res.status(400).json({ message: "Paper ka naam daalo (jaise RC)" });

    const result = await uploadToCloudinary(req.file.buffer, "cardealer/documents"); // upload
    car.documents.push({ name, url: result.secure_url }); // naam + URL save
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    res.status(500).json({ message: "Upload fail", error: err.message });
  }
};

// ---------- DOCUMENT DELETE ----------
exports.deleteDocument = async (req, res) => {
  try {
    const car = await findMyCar(req, res);
    if (!car) return;
    if (!mongoose.isValidObjectId(req.params.docId)) return res.status(400).json({ message: "Galat doc id" });
    const doc = car.documents.id(req.params.docId); // paper dhoondo
    if (!doc) return res.status(404).json({ message: "Paper nahi mila" });
    car.documents.pull(req.params.docId); // list se hatao
    await car.save();
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};