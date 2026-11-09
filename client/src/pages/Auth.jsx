import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cloud, ArrowLeft } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode = "login" }) {
  const register = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError("");
    if (register && form.name.trim().length < 2) return setError("Name must contain at least 2 characters.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    if (form.password.length < 8) return setError("Password must contain at least 8 characters.");
    setBusy(true);
    try { const { data } = await api.post(`/api/auth/${register ? "register" : "login"}`, form); authenticate(data); navigate("/app"); }
    catch (e) { setError(e.response?.data?.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  };
  return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5"><div className="w-full max-w-md animate-in"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand mb-7"><ArrowLeft size={16}/> Back to home</Link><div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-7 sm:p-9"><div className="flex items-center gap-2 font-bold text-xl mb-8"><span className="bg-brand text-white rounded-xl p-2"><Cloud size={20}/></span>Cloud<span className="text-brand">Chat</span></div><h1 className="text-2xl font-extrabold">{register ? "Create your account" : "Welcome back"}</h1><p className="text-sm text-slate-500 mt-2">{register ? "Join your team and start a conversation." : "Sign in to continue to your workspace."}</p>
    <form onSubmit={submit} className="space-y-4 mt-7">{register && <label className="block text-sm font-semibold">Full name<input name="name" value={form.name} onChange={update} required minLength="2" maxLength="60" placeholder="Your name" className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-normal"/></label>}<label className="block text-sm font-semibold">Email address<input type="email" name="email" value={form.email} onChange={update} required placeholder="you@example.com" className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-normal"/></label><label className="block text-sm font-semibold">Password<input type="password" name="password" value={form.password} onChange={update} required minLength="8" placeholder="At least 8 characters" className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-normal"/></label>{error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}<button disabled={busy} className="w-full bg-brand hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3.5 font-semibold">{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button></form><p className="text-sm text-center text-slate-500 mt-6">{register ? "Already have an account?" : "New to CloudChat?"} <Link className="text-brand font-semibold hover:underline" to={register ? "/login" : "/register"}>{register ? "Login" : "Create an account"}</Link></p></div><p className="text-center text-xs text-slate-400 mt-5">Your password is securely hashed before storage.</p></div></div>;
}
