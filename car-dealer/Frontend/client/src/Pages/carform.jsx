import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api";

const CATEGORIES = ["Sedan", "SUV", "Sports", "Hatchback"];
const FUELS = ["Petrol", "Diesel", "CNG", "Electric"];
const GEARS = ["Manual", "Automatic"];
const DOC_NAMES = ["RC", "Insurance", "PUC", "Other"];
const MAX_SIZE = 5 * 1024 * 1024;

const inp =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition";
const label = "text-sm font-medium text-slate-600 mb-1.5 block";

const EMPTY = {
  brand: "",
  model: "",
  year: "",
  price: "",
  purchasePrice: "",
  category: "Sedan",
  fuelType: "Petrol",
  transmission: "Manual",
  kmDriven: "",
  color: "",
  registrationNumber: "",
  ownerCount: 1,
  insuranceExpiry: "",
  description: "",
};

export default function CarForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [docRows, setDocRows] = useState([{ name: "RC", file: null }]);
  const [expenses, setExpenses] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [oldDocs, setOldDocs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/cars/${id}`)
      .then(({ data }) => {
        const filled = {};
        Object.keys(EMPTY).forEach((k) => (filled[k] = data[k] ?? EMPTY[k]));
        filled.insuranceExpiry = data.insuranceExpiry
          ? data.insuranceExpiry.slice(0, 10)
          : "";
        setForm(filled);
        setOldImages(data.images || []);
        setOldDocs(data.documents || []);
        setExpenses(
          (data.expenses || []).map((e) => ({
            title: e.title,
            amount: e.amount,
          }))
        );
      })
      .catch(() => setError("Failed to load car"))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const pickImages = (e) => {
    const picked = [...e.target.files];
    e.target.value = "";
    if (picked.some((f) => !f.type.startsWith("image/")))
      return setError("Please select only photos (JPG/PNG/WEBP)");
    if (picked.some((f) => f.size > MAX_SIZE))
      return setError("Each photo must be under 5 MB");
    setError("");
    setImages((prev) => [...prev, ...picked].slice(0, 5));
  };

  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  const updateDoc = (i, patch) =>
    setDocRows(docRows.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const addDocRow = () =>
    setDocRows([...docRows, { name: "Insurance", file: null }]);

  const removeDocRow = (i) =>
    setDocRows(docRows.filter((_, idx) => idx !== i));

  const addExpense = () =>
    setExpenses([...expenses, { title: "", amount: "" }]);

  const updateExpense = (i, patch) =>
    setExpenses(
      expenses.map((x, idx) => (idx === i ? { ...x, ...patch } : x))
    );

  const removeExpense = (i) =>
    setExpenses(expenses.filter((_, idx) => idx !== i));

  const totalExpense = expenses.reduce(
    (s, x) => s + (Number(x.amount) || 0),
    0
  );

  const deleteOldDoc = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const { data } = await api.delete(`/cars/${id}/documents/${docId}`);
      setOldDocs(data.documents);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const uploadFiles = async (carId) => {
    if (images.length) {
      const fd = new FormData();
      images.forEach((f) => fd.append("images", f));
      await api.post(`/cars/${carId}/images`, fd);
    }
    for (const d of docRows) {
      if (!d.file) continue;
      if (d.file.size > MAX_SIZE)
        throw new Error(`${d.name} file exceeds 5 MB`);
      const fd = new FormData();
      fd.append("name", d.name);
      fd.append("file", d.file);
      await api.post(`/cars/${carId}/documents`, fd);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let carId = id;
    try {
      const payload = {};
      Object.keys(EMPTY).forEach((k) => {
        if (form[k] !== "") payload[k] = form[k];
      });
      payload.expenses = expenses
        .filter((x) => x.title.trim() && x.amount !== "")
        .map((x) => ({ title: x.title.trim(), amount: Number(x.amount) }));
      if (isEdit) await api.put(`/cars/${id}`, payload);
      else {
        const { data } = await api.post("/cars", payload);
        carId = data._id;
      }
    } catch (err) {
      setLoading(false);
      const d = err.response?.data;
      if (!err.response)
        return setError(
          "Could not connect to backend. Check if the server is running (localhost:5000)."
        );
      return setError(
        d?.code === "LIMIT_REACHED"
          ? d.message
          : d?.error || d?.message || "Failed to save car"
      );
    }
    try {
      await uploadFiles(carId);
      navigate("/dashboard");
    } catch (err) {
      alert(
        "Car saved, but upload failed: " +
          (err.response?.data?.message || err.message) +
          "\nPlease re-upload from the edit page."
      );
      navigate(`/cars/${carId}/edit`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <p className="p-8 text-center text-slate-500 text-sm">Loading...</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {isEdit ? "Edit Car" : "Add New Car"}
          </h1>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            ← Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-5"
        >
          {error && (
            <p className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3.5 text-sm">
              {error}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className={label}>Brand *</span>
              <input
                className={inp}
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Honda"
                required
              />
            </div>
            <div>
              <span className={label}>Model *</span>
              <input
                className={inp}
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            <div>
              <span className={label}>Year *</span>
              <input
                className={inp}
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="2020"
                required
              />
            </div>
            <div>
              <span className={label}>Listed Price (₹) *</span>
              <input
                className={inp}
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="850000"
                required
              />
            </div>
            <div>
              <span className={label}>Category *</span>
              <select
                className={inp}
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>Fuel</span>
              <select
                className={inp}
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
              >
                {FUELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>Transmission</span>
              <select
                className={inp}
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
              >
                {GEARS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <span className={label}>KM Driven</span>
              <input
                className={inp}
                type="number"
                name="kmDriven"
                value={form.kmDriven}
                onChange={handleChange}
                placeholder="30000"
              />
            </div>
            <div>
              <span className={label}>Color</span>
              <input
                className={inp}
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="White"
              />
            </div>
            <div>
              <span className={label}>Registration No.</span>
              <input
                className={inp}
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                placeholder="MH26AB1234"
              />
            </div>
            <div>
              <span className={label}>Owner (1st, 2nd...)</span>
              <input
                className={inp}
                type="number"
                min="1"
                name="ownerCount"
                value={form.ownerCount}
                onChange={handleChange}
              />
            </div>
            <div>
              <span className={label}>Insurance Expiry</span>
              <input
                className={inp}
                type="date"
                name="insuranceExpiry"
                value={form.insuranceExpiry}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/80">
            <span className={label}>Purchase Price (₹) — what you paid</span>
            <input
              className={inp}
              type="number"
              name="purchasePrice"
              value={form.purchasePrice}
              onChange={handleChange}
              placeholder="700000"
            />
            <p className="text-sm text-slate-500 mt-4 mb-2">
              Expenses on this car (repair, paint, service, documents...)
            </p>
            {expenses.map((x, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  className={inp}
                  placeholder="Expense name (e.g. Paint)"
                  value={x.title}
                  onChange={(e) =>
                    updateExpense(i, { title: e.target.value })
                  }
                />
                <input
                  className={`${inp} max-w-[140px]`}
                  type="number"
                  min="0"
                  placeholder="₹"
                  value={x.amount}
                  onChange={(e) =>
                    updateExpense(i, { amount: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => removeExpense(i)}
                  className="text-red-500 hover:text-red-700 px-2 transition"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center mt-1">
              <button
                type="button"
                onClick={addExpense}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition"
              >
                + Add expense
              </button>
              <span className="text-sm font-semibold text-slate-700">
                Total expenses: ₹{totalExpense.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div>
            <span className={label}>Description</span>
            <textarea
              className={inp}
              rows="3"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Extra detail: condition, service history..."
            />
          </div>

          <div className="border border-dashed border-slate-300 rounded-xl p-5">
            <span className={label}>
              Car Photos (max 5, JPG/PNG/WEBP, each up to 5 MB)
            </span>
            {oldImages.length > 0 && (
              <>
                <p className="text-xs text-slate-500 mb-2">
                  Previously uploaded photos:
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                  {oldImages.map((u) => (
                    <img
                      key={u}
                      src={u}
                      alt="car"
                      className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              </>
            )}
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-3">
                {previews.map((u, i) => (
                  <div key={u} className="relative">
                    <img
                      src={u}
                      alt="new"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-5 text-center hover:bg-red-700 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-100 text-sm font-medium transition">
              📷 Choose photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={pickImages}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-500 ml-3">
              {images.length}/5 selected
            </span>
          </div>

          <div>
            <span className={label}>
              Documents (RC, Insurance, PUC) — PDF or image
            </span>
            {oldDocs.map((d) => (
              <div
                key={d._id}
                className="flex items-center gap-3 text-sm mb-2"
              >
                <span className="font-medium w-24 text-slate-700">
                  {d.name}
                </span>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 transition"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => deleteOldDoc(d._id)}
                  className="text-red-600 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            ))}
            {docRows.map((d, i) => (
              <div key={i} className="flex gap-2 items-center mb-2">
                <select
                  className="border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  value={d.name}
                  onChange={(e) => updateDoc(i, { name: e.target.value })}
                >
                  {DOC_NAMES.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    updateDoc(i, { file: e.target.files[0] || null })
                  }
                  className="text-sm flex-1 text-slate-600"
                />
                {docRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDocRow(i)}
                    className="text-red-600 text-sm hover:text-red-700 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDocRow}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition"
            >
              + Document
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 font-medium shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update"
              : "Add Car"}
          </button>
        </form>
      </div>
    </div>
  );
}