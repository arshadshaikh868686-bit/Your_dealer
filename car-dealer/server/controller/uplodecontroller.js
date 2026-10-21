const mongoose = require("mongoose");
const cloudinary = require("../config/cloudnary");
const Car = require("../models/car");

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const findMyCar = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ message: "Galat car id" });
    return null;
  }
  const car = await Car.findOne({ _id: req.params.id, dealer: req.dealerId });
  if (!car) res.status(404).json({ message: "Car nahi mili" });
  return car;
};

exports.addImages = async (req, res) => {
  try {
    const car = await findMyCar(req, res);
    if (!car) return;
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Koi image nahi mili" });

    const onlyImages = req.files.every((f) => f.mimetype.startsWith("image/"));
    if (!onlyImages) return res.status(400).json({ message: "Yaha sirf images daalo" });

    const results = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer, "cardealer/images")));
    car.images.push(...results.map((r) => r.secure_url));
    await car.save();
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Upload fail", error: err.message });
  }
};

exports.addDocument = async (req, res) => {
  try {
    const car = await findMyCar(req, res);
    if (!car) return;
    if (!req.file) return res.status(400).json({ message: "File nahi mili" });
    const name = (req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Paper ka naam daalo (jaise RC)" });

    const result = await uploadToCloudinary(req.file.buffer, "cardealer/documents");
    car.documents.push({ name, url: result.secure_url });
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    res.status(500).json({ message: "Upload fail", error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const car = await findMyCar(req, res);
    if (!car) return;
    if (!mongoose.isValidObjectId(req.params.docId)) return res.status(400).json({ message: "Galat doc id" });
    const doc = car.documents.id(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Paper nahi mila" });
    car.documents.pull(req.params.docId);
    await car.save();
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.uploadToCloudinary = uploadToCloudinary;
