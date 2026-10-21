import { useEffect, useState } from "react"; 
import { Link, useParams } from "react-router-dom"; 
import api from "../api"; 

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN"); 
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"); 

export default function CarDetail() {
  const { id } = useParams(); 
  const [car, setCar] = useState(null); 
  const [active, setActive] = useState(0); 
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    api.get(`/cars/${id}`) // car lao
      .then(({ data }) => setCar(data)) 
      .catch((err) => setError(err.response?.data?.message || "Car load nahi hui")) 
      .finally(() => setLoading(false)); 
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>; 
  if (error || !car) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-3">{error || "Car nahi mili"}</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
      </div>
    );
  }

  
  let insTone = "text-gray-800"; 
  let insNote = ""; 
  if (car.insuranceExpiry) {
    const days = Math.ceil((new Date(car.insuranceExpiry) - Date.now()) / 86400000); // din me farq
    if (days < 0) { insTone = "text-red-600"; insNote = " (expire ho chuka)"; } // nikal chuka
    else if (days <= 30) { insTone = "text-amber-600"; insNote = ` (${days} din bache)`; } // jaldi khatam
  }

  const details = [
    ["Year", car.year],
    ["Category", car.category],
    ["Fuel", car.fuelType],
    ["Transmission", car.transmission],
    ["KM Driven", Number(car.kmDriven || 0).toLocaleString("en-IN")],
    ["Color", car.color || "-"],
    ["Registration No.", car.registrationNumber || "-"],
    ["Owner", car.ownerCount ? `${car.ownerCount}${car.ownerCount === 1 ? "st" : car.ownerCount === 2 ? "nd" : car.ownerCount === 3 ? "rd" : "th"} owner` : "-"], 
    ["Listed On", fmtDate(car.listedDate || car.createdAt)], 
  ]; 

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-5">
          <Link to="/dashboard" className="text-blue-600 hover:underline">← Dashboard</Link>
          <Link to={`/cars/${car._id}/edit`} className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Edit</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            {car.images?.length > 0 ? (
              <>
                <img src={car.images[active]} alt={car.model} className="w-full h-64 object-cover rounded-lg border" /> {/* badi photo */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {car.images.map((u, i) => (
                    <img key={u} src={u} alt="thumb" onClick={() => setActive(i)}
                      className={`w-16 h-12 object-cover rounded-md cursor-pointer border-2 ${i === active ? "border-blue-600" : "border-transparent"}`} /> // chuni hui pe neela border
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 rounded-lg bg-gray-100 flex items-center justify-center text-5xl">🚗</div> // photo nahi
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start gap-3">
              <h1 className="text-2xl font-bold">{car.brand} {car.model}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap ${car.status === "Sold" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{car.status}</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mt-2">{money(car.price)}</p>
            <p className="text-xs text-gray-500">Listed price</p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5 text-sm">
              {details.map(([k, v]) => (
                <div key={k}><dt className="text-gray-500">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
              <div className="col-span-2">
                <dt className="text-gray-500">Insurance Expiry</dt>
                <dd className={`font-medium ${insTone}`}>{fmtDate(car.insuranceExpiry)}{insNote}</dd>
              </div>
            </dl>
          </div>
        </div>

        {car.description && (
          <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{car.description}</p> {/* new line bhi dikhegi */}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
          <h2 className="font-semibold mb-3">Papers</h2>
          {car.documents?.length > 0 ? (
            <ul className="divide-y">
              {car.documents.map((d) => (
                <li key={d._id} className="flex justify-between items-center py-2">
                  <span className="font-medium">📄 {d.name}</span>
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">Dekho / Download</a> {/* nayi tab me */}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Koi paper upload nahi hua. Edit se add kar sakte ho.</p>
          )}
        </div>

      
        {car.status === "Sold" && (
          <div className="bg-white rounded-xl shadow-sm p-5 mt-6 border-l-4 border-red-400">
            <h2 className="font-semibold mb-3">Sold Details</h2>
            <div className="flex flex-wrap gap-5 items-center">
              {car.buyerPhoto ? (
                <a href={car.buyerPhoto} target="_blank" rel="noreferrer">
                  <img src={car.buyerPhoto} alt="customer" className="w-24 h-24 rounded-lg object-cover border" /> {/* click pe badi */}
                </a>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center text-3xl">👤</div> // photo nahi
              )}
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><dt className="text-gray-500">Customer</dt><dd className="font-medium">{car.buyerName || "-"}</dd></div>
                <div><dt className="text-gray-500">Mobile</dt>
                  <dd className="font-medium">{car.buyerPhone ? <a href={`tel:${car.buyerPhone}`} className="text-blue-600 hover:underline">{car.buyerPhone}</a> : "-"}</dd></div> {/* click pe call */}
                <div><dt className="text-gray-500">Sold Price</dt><dd className="font-medium">{money(car.soldPrice)}</dd></div>
                <div><dt className="text-gray-500">Sold On</dt><dd className="font-medium">{fmtDate(car.soldDate)}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}