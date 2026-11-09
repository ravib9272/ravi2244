import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import ChatRoom from "../components/ChatRoom";
import { MessageCircle } from "lucide-react";

export default function Chat() {
  const [rooms,setRooms]=useState([]); const [selected,setSelected]=useState(null); const [error,setError]=useState(""); const [params]=useSearchParams();
  useEffect(()=>{api.get("/api/rooms").then(r=>{setRooms(r.data.rooms);const wanted=r.data.rooms.find(x=>x._id===params.get("room"));setSelected(wanted||r.data.rooms[0]||null);}).catch(e=>setError(e.response?.data?.message||"Could not load rooms"));},[params]);
  return <div className="animate-in"><div className="mb-5"><h1 className="text-2xl font-extrabold">Group chat</h1><p className="text-sm text-slate-500 mt-1">Connect with your team in real time.</p></div>{error&&<p className="text-sm text-red-600 mb-3">{error}</p>}<div className="grid lg:grid-cols-[230px_1fr] gap-4"><aside className="surface bg-white border border-slate-200 rounded-2xl p-3 h-fit"><div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-2">Your conversations</div>{rooms.map(r=><button key={r._id} onClick={()=>setSelected(r)} className={`w-full text-left px-3 py-3 rounded-xl text-sm flex gap-2 items-center ${selected?._id===r._id?"bg-blue-50 text-brand dark:bg-blue-950":"hover:bg-slate-50 dark:hover:bg-slate-800"}`}><MessageCircle size={16}/><span className="truncate">{r.name}</span></button>)}{!rooms.length&&<p className="text-xs text-slate-400 p-2">Create a room from Overview first.</p>}</aside>{selected?<ChatRoom room={selected} title={selected.name}/>:<div className="surface bg-white border border-slate-200 rounded-2xl min-h-[400px] flex items-center justify-center text-center p-8"><div><MessageCircle size={32} className="mx-auto text-brand"/><h2 className="font-bold mt-3">No chat selected</h2><p className="text-sm text-slate-500 mt-1">Create a group from your dashboard to start messaging.</p></div></div>}</div></div>;
}
