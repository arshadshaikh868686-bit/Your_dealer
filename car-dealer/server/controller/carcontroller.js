const Car = require("../models/car"); // Car model
const mongoose = require("mongoose"); // ObjectId aur validation ke liye

// jin fields ko edit karne ki ijazat hai (dealer, status direct nahi)
const EDITABLE = ["brand", "model", "year", "price", "fuelType", "transmission", "kmDriven", "color", "category"];

// ---------- ADD CAR ----------
exports.addCar = async (req, res) => {
  try {
    const data = { dealer: req.dealerId }; // car hamesha logged-in dealer ki
    EDITABLE.forEach((f) => {
      if (req.body[f] !== undefined) data[f] = req.body[f]; // sirf allowed fields copy karo
    });
    const car = await Car.create(data); // DB me save
    res.status(201).json(car); // nayi car wapas bhejo
  } catch (err) {
    res.status(400).json({ message: "Car add nahi hui", error: err.message }); // validation error aadi
  }
};

// ---------- GET ALL CARS (filters ke saath) ----------
exports.getCars = async (req, res) => {
  try {
    const { status, category, search } = req.query; // URL ke ?status=Sold&category=SUV jaise params
    const filter = { dealer: req.dealerId }; // sirf apni gaadiyan
    if (status) filter.status = status; // status filter
    if (category) filter.category = category; // category filter
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // special chars escape, case-insensitive
      filter.$or = [{ brand: rx }, { model: rx }]; // brand ya model me match
    }
    const cars = await Car.find(filter).sort({ createdAt: -1 }); // naya pehle
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- STATS ----------
exports.getStats = async (req, res) => {
  try {
    const rows = await Car.aggregate([
      { $match: { dealer: new mongoose.Types.ObjectId(req.dealerId) } }, // sirf is dealer ki cars
      {
        $group: {
          _id: null, // sab ko ek group me
          total: { $sum: 1 }, // kul gaadiyan
          sold: { $sum: { $cond: [{ $eq: ["$status", "Sold"] }, 1, 0] } }, // bik chuki
          available: { $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] } }, // bachi hui
          totalSales: { $sum: { $ifNull: ["$soldPrice", 0] } }, // total bikri ki rakam
        },
      },
    ]);
    res.json(rows[0] ? { total: rows[0].total, sold: rows[0].sold, available: rows[0].available, totalSales: rows[0].totalSales } : { total: 0, sold: 0, available: 0, totalSales: 0 }); // koi car nahi to sab 0
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- GET ONE CAR ----------
exports.getCar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Galat car id" }); // id format check
    const car = await Car.findOne({ _id: req.params.id, dealer: req.dealerId }); // sirf apni car
    if (!car) return res.status(404).json({ message: "Car nahi mili" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------- EDIT CAR ----------
exports.updateCar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Galat car id" });
    const updates = {};
    EDITABLE.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f]; // sirf allowed fields
    });
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, dealer: req.dealerId }, // apni car hi edit ho
      updates,
      { new: true, runValidators: true } // updated car wapas do, enum/required check chalao
    );
    if (!car) return res.status(404).json({ message: "Car nahi mili" });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: "Update nahi hua", error: err.message });
  }
};

// ---------- SOLD / AVAILABLE TOGGLE ----------
exports.updateStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Galat car id" });
    const { status, soldPrice } = req.body; // status: "Sold" ya "Available"
    if (!["Available", "Sold"].includes(status)) return res.status(400).json({ message: "Status Available ya Sold ho" });

    const car = await Car.findOne({ _id: req.params.id, dealer: req.dealerId });
    if (!car) return res.status(404).json({ message: "Car nahi mili" });

    car.status = status; // status badla
    if (status === "Sold") {
      car.soldPrice = soldPrice !== undefined ? soldPrice : car.price; // rate nahi diya to listed price
      car.soldDate = new Date(); // aaj ki date
    } else {
      car.soldPrice = undefined; // wapas available to sold data hata do
      car.soldDate = undefined;
    }
    await car.save(); // save
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: "Status update nahi hua", error: err.message });
  }
};

// ---------- DELETE CAR ----------
exports.deleteCar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Galat car id" });
    const car = await Car.findOneAndDelete({ _id: req.params.id, dealer: req.dealerId }); // apni car hi delete ho
    if (!car) return res.status(404).json({ message: "Car nahi mili" });
    res.json({ message: "Car delete ho gayi" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};