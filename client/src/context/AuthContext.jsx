import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.getItem("cloudchat_token")) api.get("/api/auth/me").then(r => setUser(r.data.user)).catch(() => localStorage.removeItem("cloudchat_token")).finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  const authenticate = (data) => { localStorage.setItem("cloudchat_token", data.token); setUser(data.user); };
  const logout = () => { localStorage.removeItem("cloudchat_token"); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
