const mongoose = require("mongoose");
const Car = require("../models/car");
const Dealer = require("../models/deler");
const { FREE_LIMIT, isProActive } = require("../config/plan");
const { uploadToCloudinary } = require("./uplodecontroller");

const EDITABLE = [
  "brand",
  "model",
  "year",
  "price",
  "fuelType",
  "transmission",
  "kmDriven",
  "color",
  "category",
  "registrationNumber",
  "ownerCount",
  "insuranceExpiry",
  "description",
  "purchasePrice",
];

const cleanExpenses = (list) =>
  Array.isArray(list)
    ? list
        .map((e) => ({
          title: String(e.title || "").trim(),
          amount: Number(e.amount),
        }))
        .filter((e) => e.title && Number.isFinite(e.amount) && e.amount >= 0)
    : [];

exports.addCar = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealerId);
    if (!dealer) return res.status(404).json({ message: "Dealer not found" });

    let allowed;
    if (isProActive(dealer)) {
      await Dealer.updateOne(
        { _id: dealer._id },
        { $inc: { totalCarsAdded: 1 } }
      );
      allowed = true;
    } else {
      const updated = await Dealer.findOneAndUpdate(
        { _id: dealer._id, totalCarsAdded: { $not: { $gte: FREE_LIMIT } } },
        { $inc: { totalCarsAdded: 1 } }
      );
      allowed = !!updated;
    }

    if (!allowed) {
      return res.status(403).json({
        message: `Free limit (${FREE_LIMIT} cars) reached. Upgrade to Pro for ₹199/month.`,
        code: "LIMIT_REACHED",
      });
    }

    const data = { dealer: req.dealerId };
    EDITABLE.forEach((f) => {
      if (req.body[f] !== undefined && req.body[f] !== "") data[f] = req.body[f];
    });
    if (req.body.expenses !== undefined)
      data.expenses = cleanExpenses(req.body.expenses);

    try {
      const car = await Car.create(data);
      return res.status(201).json(car);
    } catch (err) {
      await Dealer.updateOne(
        { _id: dealer._id },
        { $inc: { totalCarsAdded: -1 } }
      );
      return res
        .status(400)
        .json({ message: "Failed to add car", error: err.message });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCars = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = { dealer: req.dealerId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      const rx = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      filter.$or = [{ brand: rx }, { model: rx }];
    }
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const rows = await Car.aggregate([
      { $match: { dealer: new mongoose.Types.ObjectId(req.dealerId) } },
      { $addFields: { expTotal: { $sum: "$expenses.amount" } } },
      {
        $addFields: {
          cost: {
            $add: [{ $ifNull: ["$purchasePrice", 0] }, "$expTotal"],
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sold: {
            $sum: { $cond: [{ $eq: ["$status", "Sold"] }, 1, 0] },
          },
          available: {
            $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] },
          },
          totalSales: { $sum: { $ifNull: ["$soldPrice", 0] } },
          totalExpenses: { $sum: "$expTotal" },
          soldCost: {
            $sum: {
              $cond: [{ $eq: ["$status", "Sold"] }, "$cost", 0],
            },
          },
        },
      },
    ]);
    const r = rows[0];
    res.json(
      r
        ? {
            total: r.total,
            sold: r.sold,
            available: r.available,
            totalSales: r.totalSales,
            totalExpenses: r.totalExpenses,
            profit: r.totalSales - r.soldCost,
          }
        : {
            total: 0,
            sold: 0,
            available: 0,
            totalSales: 0,
            totalExpenses: 0,
            profit: 0,
          }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getCar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid car id" });
    const car = await Car.findOne({
      _id: req.params.id,
      dealer: req.dealerId,
    });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid car id" });
    const updates = {};
    EDITABLE.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.body.expenses !== undefined)
      updates.expenses = cleanExpenses(req.body.expenses);
    const car = await Car.findOneAndUpdate(
      { _id: req.params.id, dealer: req.dealerId },
      updates,
      { new: true, runValidators: true }
    );
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid car id" });
    const { status, soldPrice, buyerName, buyerPhone } = req.body;
    if (!["Available", "Sold"].includes(status))
      return res
        .status(400)
        .json({ message: "Status must be Available or Sold" });

    const car = await Car.findOne({
      _id: req.params.id,
      dealer: req.dealerId,
    });
    if (!car) return res.status(404).json({ message: "Car not found" });

    if (status === "Sold") {
      const name = (buyerName || "").trim();
      const phone = (buyerPhone || "").trim();
      if (!name)
        return res.status(400).json({ message: "Buyer name is required" });
      if (!/^[6-9]\d{9}$/.test(phone))
        return res
          .status(400)
          .json({ message: "Enter a valid 10-digit mobile number" });
      if (req.file && !req.file.mimetype.startsWith("image/"))
        return res
          .status(400)
          .json({ message: "Buyer photo must be an image" });

      const price =
        soldPrice !== undefined && soldPrice !== ""
          ? Number(soldPrice)
          : car.price;
      if (Number.isNaN(price))
        return res
          .status(400)
          .json({ message: "Sold price must be a valid number" });

      if (req.file) {
        const result = await uploadToCloudinary(
          req.file.buffer,
          "cardealer/buyers"
        );
        car.buyerPhoto = result.secure_url;
      }
      car.status = "Sold";
      car.soldPrice = price;
      car.soldDate = new Date();
      car.buyerName = name;
      car.buyerPhone = phone;
    } else {
      car.status = "Available";
      car.soldPrice = undefined;
      car.soldDate = undefined;
      car.buyerName = undefined;
      car.buyerPhone = undefined;
      car.buyerPhoto = undefined;
    }
    await car.save();
    res.json(car);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update status", error: err.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid car id" });
    const car = await Car.findOneAndDelete({
      _id: req.params.id,
      dealer: req.dealerId,
    });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};