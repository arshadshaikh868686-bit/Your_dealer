import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";

export default function ProtectedRoute({ children }) {
  const { dealer } = useAuth();
  if (!dealer) return <Navigate to="/login" replace />;
  return children;
}
