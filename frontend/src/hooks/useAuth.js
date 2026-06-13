
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const navigate = useNavigate();

 
  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      setToken(t);
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return { user, token, logout, isLoggedIn: !!token };
}