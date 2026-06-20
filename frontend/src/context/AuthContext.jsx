import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      if (!token) { setLoading(false); return; }
      try {
        const res = await getMe(token);
        setUser(res.user);
      } catch {
        // Token expired or invalid — clear it
        localStorage.removeItem("token");
        setToken("");
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem("token", tokenValue);
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
