import { useState } from "react";
import { Link } from "react-router-dom";

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function CarCard({ car, onToggle, onDelete }) {
  const imgs = car.images || [];
  const docs = car.documents || [];
  const sold = car.status === "Sold";
  const spent =
    (car.purchasePrice || 0) +
    (car.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const profit = sold ? (car.soldPrice || 0) - spent : null;
  const [idx, setIdx] = useState(0);
  const [startX, setStartX] = useState(null);

  const go = (step) =>
    setIdx((i) => (i + step + imgs.length) % imgs.length);

  const onTouchEnd = (e) => {
    if (startX === null || imgs.length < 2) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
    setStartX(null);
  };

  return (
    <div className="bg-white/80 backdrop-blur border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300/80 transition">
      <div
        className="relative group h-48 bg-slate-100"
        onTouchStart={(e) => setStartX(e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
      >
        {imgs.length > 0 ? (
          <Link to={`/cars/${car._id}`}>
            <img
              src={imgs[idx]}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-48 object-cover"
            />
          </Link>
        ) : (
          <div className="h-48 flex items-center justify-center text-5xl">
            🚗
          </div>
        )}

        <span
          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${
            sold ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {car.status}
        </span>

        {imgs.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white text-lg leading-none md:opacity-0 md:group-hover:opacity-100 transition hover:bg-black/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white text-lg leading-none md:opacity-0 md:group-hover:opacity-100 transition hover:bg-black/70"
            >
              ›
            </button>
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition ${
                    i === idx ? "bg-white scale-110" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-medium">
              {idx + 1}/{imgs.length}
            </span>
          </>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <Link
            to={`/cars/${car._id}`}
            className="font-semibold text-lg text-indigo-600 hover:text-indigo-700 transition"
          >
            {car.brand} {car.model}
          </Link>
          <p className="text-xs text-slate-500 mt-0.5">
            {car.year} · {car.category} · {car.fuelType} ·{" "}
            {Number(car.kmDriven || 0).toLocaleString("en-IN")} km
            {car.registrationNumber ? ` · ${car.registrationNumber}` : ""}
          </p>
        </div>

        <div>
          {sold ? (
            <p className="text-xl font-bold text-slate-900">
              {money(car.soldPrice)}{" "}
              <span className="text-xs font-normal text-slate-400 line-through">
                {money(car.price)}
              </span>
            </p>
          ) : (
            <p className="text-xl font-bold text-slate-900">
              {money(car.price)}
            </p>
          )}
          <p className="text-xs text-slate-500 mt-0.5">
            Listed: {fmtDate(car.listedDate || car.createdAt)}
            {sold ? ` · Sold: ${fmtDate(car.soldDate)}` : ""}
          </p>
        </div>

        {spent > 0 && (
          <div className="text-xs bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex justify-between items-center">
            <span className="text-slate-600">
              Cost (purchase + expenses): <b className="text-slate-800">{money(spent)}</b>
            </span>
            {sold && (
              <b
                className={
                  profit < 0 ? "text-red-600" : "text-emerald-600"
                }
              >
                {profit < 0 ? "Loss" : "Profit"}: {money(Math.abs(profit))}
              </b>
            )}
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Documents</p>
          {docs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {docs.map((d) => (
                <a
                  key={d._id}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                >
                  📄 {d.name}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No documents uploaded</p>
          )}
        </div>

        {sold && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
            {car.buyerPhoto ? (
              <a href={car.buyerPhoto} target="_blank" rel="noreferrer">
                <img
                  src={car.buyerPhoto}
                  alt="customer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              </a>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-base">
                👤
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-slate-800">{car.buyerName}</p>
              <a
                href={`tel:${car.buyerPhone}`}
                className="text-xs text-indigo-600 hover:text-indigo-700 transition"
              >
                {car.buyerPhone}
              </a>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          <Link
            to={`/cars/${car._id}/edit`}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
          >
            Edit
          </Link>
          <button
            onClick={() => onToggle(car)}
            className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
          >
            {sold ? "Mark Available" : "Mark Sold"}
          </button>
          <button
            onClick={() => onDelete(car)}
            className="px-3.5 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}