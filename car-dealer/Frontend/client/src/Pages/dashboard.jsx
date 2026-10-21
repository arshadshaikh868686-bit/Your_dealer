import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/authContext";
import api from "../api";
import SoldModal from "../Components/SoldModal";
import CarCard from "../Components/CarCard";

const CATEGORIES = ["Sedan", "SUV", "Sports", "Hatchback"];
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";
const field =
  "border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition";
const upgrade = () => alert("Pro plan (₹199/month) coming soon.");

export default function Dashboard() {
  const { dealer, logout } = useAuth();
  const [cars, setCars] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    sold: 0,
    available: 0,
    totalSales: 0,
  });
  const [plan, setPlan] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });
  const [loading, setLoading] = useState(true);
  const [soldCar, setSoldCar] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search.trim()) params.search = filters.search.trim();
      const [carsRes, statsRes, meRes] = await Promise.all([
        api.get("/cars", { params }),
        api.get("/cars/stats"),
        api.get("/auth/me"),
      ]);
      setCars(carsRes.data);
      setStats(statsRes.data);
      setPlan(meRes.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) logout();
      else setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const handleFilter = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const toggleStatus = async (car) => {
    if (car.status === "Available") return setSoldCar(car);
    if (
      !window.confirm(
        "Mark as Available again? Customer details will be removed."
      )
    )
      return;
    try {
      await api.patch(`/cars/${car._id}/status`, { status: "Available" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (car) => {
    if (!window.confirm(`Delete ${car.brand} ${car.model}?`)) return;
    try {
      await api.delete(`/cars/${car._id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const canAdd = plan ? plan.canAddCars : true;
  const used = plan ? plan.totalCarsAdded : 0;
  const limit = plan ? plan.freeLimit : 50;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      {soldCar && (
        <SoldModal
          car={soldCar}
          onClose={() => setSoldCar(null)}
          onDone={() => {
            setSoldCar(null);
            loadData();
          }}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {dealer.dealershipName}
            </h1>
            <p className="mt-1 text-slate-500 text-sm sm:text-base">
              Welcome, {dealer.ownerName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canAdd ? (
              <Link
                to="/cars/new"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-md shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                + Add Car
              </Link>
            ) : (
              <button
                onClick={upgrade}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-md shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                + Add Car
              </button>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {plan && (
          <div
            className={`rounded-2xl p-5 mb-8 border shadow-sm ${
              canAdd
                ? "bg-white/80 backdrop-blur border-slate-200/80"
                : "bg-red-50/90 border-red-200"
            }`}
          >
            {plan.proActive ? (
              <p className="text-sm text-slate-700">
                <b className="text-emerald-600">Pro active</b> · Valid until{" "}
                {fmtDate(plan.planExpiresAt)} · {used} cars added
              </p>
            ) : (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">
                    {used} / {limit} free cars used
                  </span>
                  <span className="text-slate-500">
                    {Math.max(0, limit - used)} left
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      canAdd ? "bg-indigo-500" : "bg-red-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            )}
            {!canAdd && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <p className="text-sm text-red-700">
                  {plan.plan === "pro"
                    ? "Pro has expired."
                    : `Free limit (${limit} cars) reached.`}{" "}
                  Upgrade to Pro for ₹199/month to add more cars.
                </p>
                <button
                  onClick={upgrade}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700 transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            ["Total Cars", stats.total],
            ["Available", stats.available],
            ["Sold", stats.sold],
            ["Total Sales", money(stats.totalSales)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur border border-slate-200/80 p-5 rounded-2xl shadow-sm flex flex-col gap-1.5 hover:shadow-md hover:border-slate-300/80 transition"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
              </span>
              <b className="text-2xl font-bold text-slate-900 tabular-nums">
                {value}
              </b>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap gap-3 mb-6">
          <input
            name="search"
            placeholder="Search by brand or model"
            value={filters.search}
            onChange={handleFilter}
            className={`${field} flex-1 min-w-[200px]`}
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilter}
            className={field}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilter}
            className={field}
          >
            <option value="">Sold + Available</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
          </select>
        </section>

        {error && (
          <p className="text-red-600 text-sm font-medium mb-4 px-1">{error}</p>
        )}

        {loading && cars.length === 0 ? (
          <p className="text-center text-slate-500 py-16 text-sm">Loading...</p>
        ) : cars.length === 0 ? (
          <p className="text-center text-slate-500 py-16 text-sm">
            No cars found
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onToggle={toggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}