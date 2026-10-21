import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./Components/protectedroutes";
import Landing from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Register from "./Pages/register";
import CarForm from "./Pages/carform";
import Dashboard from "./Pages/dashboard";
import CarDetail from "./Pages/CarDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/cars/new" element={<ProtectedRoute><CarForm /></ProtectedRoute>} />
      <Route path="/cars/:id" element={<ProtectedRoute><CarDetail /></ProtectedRoute>} />
      <Route path="/cars/:id/edit" element={<ProtectedRoute><CarForm /></ProtectedRoute>} />
    </Routes>
  );
}
