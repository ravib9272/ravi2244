import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import People from "./pages/People";
import Admin from "./pages/Admin";
import Layout from "./components/Layout";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-brand font-semibold">Loading CloudChat…</div>;
  return user ? children : <Navigate to="/login" replace/>;
}
function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === "admin" ? children : <Navigate to="/app" replace/>;
}
function AppRoutes() {
  return <SocketProvider><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/login" element={<Auth/>}/>
    <Route path="/register" element={<Auth mode="register"/>}/>
    <Route path="/app" element={<Protected><Layout/></Protected>}>
      <Route index element={<Dashboard/>}/>
      <Route path="chat" element={<Chat/>}/>
      <Route path="people" element={<People/>}/>
      <Route path="admin" element={<AdminRoute><Admin/></AdminRoute>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></SocketProvider>;
}
export default function App() { return <AuthProvider><AppRoutes/></AuthProvider>; }
