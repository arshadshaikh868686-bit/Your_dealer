import { useEffect, useState } from "react";
import api from "../api";

const MAX_SIZE = 5 * 1024 * 1024;
const inp = "w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500";
const label = "text-sm text-gray-600 mb-1 block";

export default function SoldModal({ car, onClose, onDone }) {
  const [soldPrice, setSoldPrice] = useState(car.price);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!photo) return setPreview("");
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const pickPhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return setPhoto(null);
    if (!f.type.startsWith("image/")) return setError("Photo sirf image ho");
    if (f.size > MAX_SIZE) return setError("Photo 5 MB se chhoti ho");
    setError("");
    setPhoto(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!buyerName.trim()) return setError("Customer ka naam daalo");
    if (!/^[6-9]\d{9}\$/.test(buyerPhone)) return setError("10 digit ka sahi mobile number daalo");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("status", "Sold");
      fd.append("soldPrice", soldPrice);
      fd.append("buyerName", buyerName.trim());
      fd.append("buyerPhone", buyerPhone);
      if (photo) fd.append("buyerPhoto", photo);
      await api.patch(`/cars/${car._id}/status`, fd);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Sold mark nahi hua");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-xl p-6 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Sold: {car.brand} {car.model}</h2>
        {error && <p className="bg-red-50 text-red-700 border border-red-200 rounded-md p-2.5 text-sm">{error}</p>}

        <div>
          <span className={label}>Sold Price (₹)</span>
          <input className={inp} type="number" value={soldPrice} onChange={(e) => setSoldPrice(e.target.value)} required />
        </div>
        <div>
          <span className={label}>Customer ka naam *</span>
          <input className={inp} value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Rahul Patil" required />
        </div>
        <div>
          <span className={label}>Customer ka mobile *</span>
          <input className={inp} inputMode="numeric" maxLength={10} value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" required />
        </div>
        <div>
          <span className={label}>Customer ki photo (optional)</span>
          <input type="file" accept="image/*" onChange={pickPhoto} className="text-sm" />
          {preview && <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-md border mt-2" />}
        </div>

        <p className="text-xs text-gray-500">Customer ki detail aur photo lene se pehle unki sahmati zarur lo.</p>

        <div className="flex gap-2 justify-end mt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60">
            {loading ? "Save ho raha hai..." : "Sold mark karo"}
          </button>
        </div>
      </form>
    </div>
  );
}
