import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Smile, Users } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ChatRoom({ room, title = "Community lounge" }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState("");
  const [error, setError] = useState("");
  const bottom = useRef(null);
  useEffect(() => {
    if (!room?._id || !socket) return;
    api.get(`/api/messages/${room._id}`).then(r => setMessages(r.data.messages)).catch(e => setError(e.response?.data?.message || "Could not load chat"));
    socket.emit("room:join", { roomId: room._id });
    const onMessage = m => { if (String(m.room) === String(room._id) || String(m.room?._id) === String(room._id)) setMessages(prev => [...prev, m]); };
    const onTyping = p => { if (p.roomId === room._id) setTyping(p.typing ? `${p.user} is typing…` : ""); };
    const onError = p => setError(p.message);
    socket.on("message:new", onMessage); socket.on("typing:update", onTyping); socket.on("room:error", onError);
    return () => { socket.off("message:new", onMessage); socket.off("typing:update", onTyping); socket.off("room:error", onError); };
  }, [room?._id, socket]);
  useEffect(() => {
  bottom.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
  const send = (e) => { e.preventDefault(); if (!value.trim() || !socket) return; socket.emit("message:send", { roomId: room._id, text: value.trim() }); setValue(""); socket.emit("typing:stop", { roomId: room._id }); };
  const upload = async (file) => {
    if (!file || file.size > 10 * 1024 * 1024) { setError("File must be smaller than 10 MB"); return; }
    try {
      const { data } = await api.post("/api/uploads/presign", { fileName: file.name, contentType: file.type || "application/octet-stream", size: file.size });
      await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      socket.emit("message:send", { roomId: room._id, attachment: { url: data.fileUrl, name: file.name, mimeType: file.type, size: file.size } });
    } catch (e) { setError(e.response?.data?.message || "File upload failed. Configure S3 to enable cloud uploads."); }
  };
  return <section className="surface bg-white border border-slate-200 rounded-2xl shadow-soft overflow-hidden flex flex-col min-h-[560px]">
    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"><div><h2 className="font-bold">{title}</h2><p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Users size={13}/>{room?.members?.length || 0} members · Real-time</p></div><span className="text-xs rounded-full bg-green-50 text-green-700 px-2.5 py-1">● Connected</span></div>
    <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[520px] bg-slate-50/70 dark:bg-slate-950/30">
      {messages.length === 0 && <div className="text-center py-16 text-slate-400"><div className="text-4xl mb-3">👋</div><p className="font-medium">Start the conversation</p><p className="text-sm">Your messages will appear here instantly.</p></div>}
      {messages.map((m) => { const mine = String(m.sender?._id || m.sender) === String(user?.id); return <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-3 ${mine ? "bg-brand text-white rounded-br-md" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-bl-md"}`}><div className={`text-[11px] font-semibold mb-1 ${mine ? "text-blue-100" : "text-brand"}`}>{mine ? "You" : m.sender?.name || "Member"}</div>{m.text && <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>}{m.attachment && <a className="underline text-sm break-all" href={m.attachment.url} target="_blank" rel="noreferrer">📎 {m.attachment.name}</a>}<div className={`text-[10px] mt-2 text-right ${mine ? "text-blue-100" : "text-slate-400"}`}>{new Date(m.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div></div></div>; })}
      <div ref={bottom}/></div>
    <div className="px-4 py-2 min-h-7 text-xs text-slate-400">{error || typing}</div>
    <form onSubmit={send} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
      <label className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Attach file"><Paperclip size={19}/><input type="file" className="hidden" onChange={e => upload(e.target.files?.[0])}/></label>
      <button type="button" onClick={() => setValue(v => v + " 😊")} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Add emoji"><Smile size={19}/></button>
      <input value={value} onChange={e => { setValue(e.target.value); socket?.emit("typing:start", {roomId: room._id}); }} onBlur={() => socket?.emit("typing:stop", {roomId: room._id})} placeholder="Write a message…" className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"/>
      <button className="bg-brand hover:bg-blue-700 text-white p-3 rounded-xl transition" aria-label="Send message"><Send size={18}/></button>
    </form>
  </section>;
}
