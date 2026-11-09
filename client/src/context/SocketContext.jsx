import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
const SocketContext = createContext(null);
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [online, setOnline] = useState([]);
  useEffect(() => {
    if (!user) { setSocket(null); setOnline([]); return; }
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { auth: { token: localStorage.getItem("cloudchat_token") } });
    s.on("presence:update", setOnline);
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [user]);
  return <SocketContext.Provider value={{ socket, online }}>{children}</SocketContext.Provider>;
}
export const useSocket = () => useContext(SocketContext);
