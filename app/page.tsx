"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // 🔴 Role-based Dynamic Routing
        if (data.role === "admin") {
          router.push("/admin");
        } else if (data.role === "student") {
          router.push(`/student/${data.id}`);
        } else if (data.role === "faculty") {
          router.push(`/faculty/${data.id}`);
        } else {
          setErrorMsg("অজানা ইউজার রোল!");
        }
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      setErrorMsg("লগইন ফেইল হয়েছে। নেটওয়ার্ক চেক করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-5/12 bg-slate-900 text-white p-10 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-full p-2 mb-6 shadow-lg">
              <Image src="/prottoy academy logo.png" alt="Prottoy Academy" width={100} height={100} className="rounded-full object-contain" />
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-wide">PROTTOY</h1>
            <h2 className="text-xl font-bold text-emerald-400 tracking-widest uppercase mb-4">Academy</h2>
            <p className="text-slate-400 text-sm font-medium px-4">
              Integrated Education Management System
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">Welcome Back!</h2>
            <p className="text-slate-500 font-medium text-sm">Please sign in to access your portal</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-xl text-sm font-bold mb-6 flex items-center gap-2">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Login ID / Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Enter your ID or phone number"
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black rounded-xl shadow-md text-base transition-all disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in..." : "Secure Login"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs font-bold text-slate-400">© 2026 Prottoy Academy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}