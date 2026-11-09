import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import api from "../lib/api";
import { useSocket } from "../context/SocketContext";
export default function People() {
  const [people,setPeople]=useState([]); const {online}=useSocket(); const navigate=useNavigate();
  useEffect(()=>{api.get("/api/users").then(r=>setPeople(r.data.users));},[]);
  return <div className="animate-in"><h1 className="text-2xl font-extrabold">People</h1><p className="text-sm text-slate-500 mt-1">Everyone in your CloudChat workspace.</p><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">{people.map(p=><div key={p._id} className="surface bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-blue-100 text-brand font-bold flex items-center justify-center text-lg">{p.name?.[0]?.toUpperCase()}</div><div className="min-w-0 flex-1"><div className="font-semibold truncate">{p.name}</div><div className="text-xs text-slate-400 truncate">{p.email}</div><div className={`text-xs mt-1 ${online.includes(p._id)?"text-green-600":"text-slate-400"}`}>{online.includes(p._id)?"● Online":"○ Offline"}</div></div></div>)}{!people.length&&<p className="text-sm text-slate-400">No other users have registered yet.</p>}</div></div>;
}
