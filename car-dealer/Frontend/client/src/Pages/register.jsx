import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    dealershipName: "",
    ownerName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur border border-slate-200/80 w-full max-w-sm p-8 rounded-2xl shadow-sm flex flex-col gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Dealer Register
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Create your free dealership account
          </p>
        </div>

        {error && (
          <p className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
            {error}
          </p>
        )}

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1.5 block">
            Dealership name
          </label>
          <input
            className={input}
            name="dealershipName"
            placeholder="e.g. Sharma Motors"
            value={form.dealershipName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1.5 block">
            Owner name
          </label>
          <input
            className={input}
            name="ownerName"
            placeholder="Your full name"
            value={form.ownerName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1.5 block">
            Email
          </label>
          <input
            className={input}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1.5 block">
            Password
          </label>
          <input
            className={input}
            name="password"
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-medium shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-slate-500 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:text-indigo-700 transition"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}