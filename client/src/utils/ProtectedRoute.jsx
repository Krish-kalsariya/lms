import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    api.get("/users/me")
      .then(() => {
        setAuth(true);
        setLoading(false);
      })
      .catch(() => {
        setAuth(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Checking login...</p>;

  if (!auth) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
