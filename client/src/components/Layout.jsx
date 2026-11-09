import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Cloud, MessageCircle, Users, Shield, LogOut, Moon, Sun, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));
  const toggle = () => { document.documentElement.classList.toggle("dark"); setDark(!dark); };
  const links = [{ to: "/app", label: "Overview", icon: Cloud }, { to: "/app/chat", label: "Group chat", icon: MessageCircle }, { to: "/app/people", label: "People", icon: Users }];
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
    <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/app" className="flex items-center gap-2 font-bold text-lg"><span className="bg-brand text-white rounded-xl p-2"><Cloud size={19}/></span>Cloud<span className="text-brand">Chat</span></Link>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle dark mode">{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative" title="Notifications"><Bell size={19}/><i className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"/></button>
          <div className="hidden sm:block text-right"><div className="text-sm font-semibold">{user?.name}</div><div className="text-xs text-slate-500">{user?.role}</div></div>
          <button onClick={() => { logout(); navigate("/"); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" title="Logout"><LogOut size={19}/></button>
        </div>
      </div>
    </header>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid md:grid-cols-[220px_1fr] gap-6">
      <aside className="surface bg-white border border-slate-200 rounded-2xl p-3 h-fit shadow-sm">
        <div className="text-[11px] uppercase tracking-widest font-bold text-slate-400 px-3 py-2">Workspace</div>
        <nav className="space-y-1">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? "bg-blue-50 text-brand dark:bg-blue-950" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}><Icon size={18}/>{label}</NavLink>)}
          {user?.role === "admin" && <NavLink to="/app/admin" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive ? "bg-blue-50 text-brand" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}><Shield size={18}/>Admin panel</NavLink>}
        </nav>
        <div className="mt-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50"><div className="text-xs font-semibold text-blue-800 dark:text-blue-200">Cloud connected</div><p className="text-xs text-blue-700/80 dark:text-blue-300 mt-1">Messages are stored securely in your database.</p></div>
      </aside>
      <main className="min-w-0"><Outlet/></main>
    </div>
  </div>;
}
