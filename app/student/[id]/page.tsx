"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

// Core Founding Members
const coreMembers = [
  { id: 901, name: "Md. Rashedul Islam", designation: "Founder and CEO", education: "B.Sc in CSE (studying) at Brahmaputra International University", subjects: "Math, Science, ICT", experience: "6+ Years", image: "/faculty/rashedul.jpg" },
  { id: 902, name: "Md. Shohel Islam", designation: "Founder and MD", education: "B.A in Bangla at Govt. Asheq Mahmud College", subjects: "Bangla", experience: "12+ Years", image: "/faculty/shohel.jpg" }
];

const otherFoundingTeachers = [
  { id: 903, name: "Md. Ratan Hasan", designation: "Instructor", education: "B.Sc in Math (studying) at Govt. Asheq Mahmud College", subjects: "Math, Science", experience: "3+ Years", image: "/faculty/ratan.jpg" },
  { id: 904, name: "Md. Maruf Hasan", designation: "Instructor", education: "B.A in English (studying) at Govt. Asheq Mahmud College", subjects: "English", experience: "4+ Years", image: "/faculty/maruf.jpg" },
  { id: 905, name: "Sayan Mahmud Mahi", designation: "Instructor", education: "B.Sc in Textile Engineering (studying) at Jamalpur Textile Engineering College", subjects: "Science", experience: "3+ Years", image: "/faculty/sayan.jpg" }
];

// Strong JSON Parser for Student Dashboard
const parseSubjectsSafe = (data: any) => {
  if (!data) return [];
  let parsedData = data;
  let attempts = 0;
  while (typeof parsedData === 'string' && attempts < 3) {
    try {
      if (parsedData.trim() === '') break;
      if (parsedData.includes('[object Object]')) return [];
      parsedData = JSON.parse(parsedData);
    } catch (error) { break; }
    attempts++;
  }
  if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) parsedData = Object.values(parsedData);
  if (Array.isArray(parsedData)) {
    return parsedData.map(item => {
      if (typeof item === 'string') {
        try { return JSON.parse(item); } catch(e) { return null; }
      }
      return item;
    }).filter(Boolean);
  }
  return [];
};

function StudentContent() {
  const { id } = useParams(); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [faculties, setFaculties] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]);

  const [resultViewMode, setResultViewMode] = useState<"integrated" | "single">("integrated");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", fathersName: "", mothersName: "", className: "", address: "" });
  const [updateMsg, setUpdateMsg] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [passUpdateLoading, setPassUpdateLoading] = useState(false);

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  const fetchMyData = async () => {
    try {
      const res = await fetch(`/api/students?t=${new Date().getTime()}`);
      const data = await res.json();
      let allStudents = [];
      if (data.success && Array.isArray(data.data)) allStudents = data.data;
      else if (Array.isArray(data)) allStudents = data;
      else if (data.students && Array.isArray(data.students)) allStudents = data.students;

      if (allStudents.length > 0) {
        const myInfo = allStudents.find((s: any) => String(s.student_id) === String(id) || String(s.id) === String(id));
        if (myInfo) {
          setStudentData(myInfo);
          setEditForm({
            fullName: myInfo.full_name || myInfo.fullName || myInfo.name || "",
            fathersName: myInfo.fathers_name || "",
            mothersName: myInfo.mothers_name || "",
            className: myInfo.class_name || myInfo.className || myInfo.class || "",
            address: myInfo.address || ""
          });
        }
      }
    } catch (err) { console.error("Failed to load profile."); } finally { setLoading(false); }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setFaculties([...coreMembers, ...otherFoundingTeachers, ...data.data]); 
      else setFaculties([...coreMembers, ...otherFoundingTeachers]);
    } catch (err) { setFaculties([...coreMembers, ...otherFoundingTeachers]); }
  };

  const fetchMyPayments = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/payments?studentId=${id}&t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setMyPayments(data.data);
    } catch (err) {}
  };

  const fetchMyResults = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/results?studentId=${id}&t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setMyResults(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    if (id) { fetchMyData(); fetchFaculties(); fetchMyPayments(); fetchMyResults(); }
  }, [id]);

  useEffect(() => {
    if (activeTab === "payments" || activeTab === "dashboard") fetchMyPayments();
    if (activeTab === "results" || activeTab === "dashboard") fetchMyResults();
  }, [activeTab]);

  const handleLogout = () => { router.push("/"); };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setUpdateMsg("Updating...");
    try {
      const res = await fetch("/api/students", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Number(id), ...editForm }) });
      const result = await res.json();
      if (result.success) { alert("✅ Profile Updated Successfully!"); setIsEditing(false); fetchMyData(); } 
      else alert("❌ Error updating profile.");
    } catch (error) { alert("❌ Something went wrong."); } finally { setUpdateMsg(""); }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return alert("⚠️ Please type a new password!");
    setPassUpdateLoading(true);
    try {
      const res = await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'update_password', id: Number(id), newPassword: newPassword }) });
      const result = await res.json();
      if (result.success) { alert("✅ Password updated successfully! Old password will no longer work."); setNewPassword(""); } 
      else alert("❌ Failed to update password.");
    } catch (err) { alert("❌ Something went wrong while updating password."); } finally { setPassUpdateLoading(false); }
  };

  const getIntegratedResults = () => {
    const grouped: Record<string, any> = {};
    myResults.forEach(res => {
      const examNameKey = res.exam_name ? res.exam_name.trim().toUpperCase() : "UNKNOWN EXAM";
      let marksArr = parseSubjectsSafe(res.marks_data || res.subjects);
      if (!Array.isArray(marksArr) || marksArr.length === 0) return;
      if (!grouped[examNameKey]) { grouped[examNameKey] = { exam_name: res.exam_name, marks_data: [...marksArr] }; } 
      else { grouped[examNameKey].marks_data = [...grouped[examNameKey].marks_data, ...marksArr]; }
    });

    return Object.values(grouped).map((group: any) => {
      let totalPoint = 0; let isFailed = false;
      group.marks_data.forEach((m: any) => {
        let p = 0;
        if (m.grade === 'A+') p = 5.0; else if (m.grade === 'A') p = 4.0; else if (m.grade === 'A-') p = 3.5;
        else if (m.grade === 'B') p = 3.0; else if (m.grade === 'C') p = 2.0; else if (m.grade === 'D') p = 1.0;
        else { p = 0; isFailed = true; }
        totalPoint += p;
      });

      let finalGpa = (totalPoint / group.marks_data.length).toFixed(2);
      let finalGrade = 'F';

      if (isFailed) { finalGpa = '0.00'; finalGrade = 'F'; } 
      else {
        const gNum = parseFloat(finalGpa);
        if (gNum >= 5.0) finalGrade = 'A+'; else if (gNum >= 4.0) finalGrade = 'A'; else if (gNum >= 3.5) finalGrade = 'A-';
        else if (gNum >= 3.0) finalGrade = 'B'; else if (gNum >= 2.0) finalGrade = 'C'; else if (gNum >= 1.0) finalGrade = 'D';
      }
      return { ...group, gpa: finalGpa, grade: finalGrade, id: group.exam_name };
    });
  };

  const displayResults = resultViewMode === "integrated" ? getIntegratedResults() : myResults.map(res => ({ ...res, marks_data: parseSubjectsSafe(res.marks_data || res.subjects) }));

  // Fixed Input Class to explicitly have white background and black text to bypass Dark Mode
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold shadow-sm";

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-blue-600 font-bold text-xl animate-pulse">Loading your portal...</div>;

  const safeName = studentData?.full_name || studentData?.fullName || studentData?.name || "Student";
  const safeClass = studentData?.class_name || studentData?.className || studentData?.class || "Your Class";

  return (
    // 🔴 NEW: Explicitly setting light background (#f8fafc) and dark text to totally block OS Dark mode bugs
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* Top Header with Logout */}
        <div className="no-print flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">Student Portal</h2>
            <p className="text-sm font-semibold text-slate-500">Prottoy Academy</p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-5 rounded-xl transition-colors flex items-center gap-2 border border-red-100 shadow-sm">
            🚪 <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* 🔴 NEW: STICKY PREMIUM BACK BUTTON */}
        {activeTab !== "dashboard" && (
          <div className="mb-8">
            <button
              onClick={() => router.push("?tab=dashboard")}
              className="no-print px-6 py-3 bg-[#0f172a] text-white hover:bg-slate-800 font-bold rounded-xl transition-all flex items-center gap-3 shadow-lg active:scale-95 w-fit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Dashboard
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            
            {/* 🔴 NEW: PREMIUM WELCOME BANNER (Inspired by your Portfolio) */}
            <div className="relative bg-[#0a192f] text-white rounded-[2rem] p-8 md:p-12 mb-10 overflow-hidden shadow-2xl border border-slate-800">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-600 opacity-20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full bg-emerald-600 opacity-20 blur-2xl pointer-events-none"></div>
              <div className="relative z-10">
                <p className="text-blue-400 font-bold tracking-widest mb-2 text-sm uppercase">Academic Overview</p>
                <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white leading-tight">
                  Welcome back, <br className="md:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">{safeName}</span>!
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-xl font-medium">Track your academic progress, view exam results, and access all your class materials securely in one premium portal.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div onClick={() => router.push(`?tab=profile`)} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl mb-6 group-hover:scale-110 transition-transform">👤</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">My Profile</h3>
                <p className="text-2xl font-black text-slate-800 flex items-center justify-between">Details <span className="text-indigo-500 group-hover:translate-x-2 transition-transform">➔</span></p>
              </div>
              <div onClick={() => router.push(`?tab=payments`)} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl mb-6 group-hover:scale-110 transition-transform">💳</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">My Payments</h3>
                <p className="text-2xl font-black text-slate-800 flex items-center justify-between">History <span className="text-emerald-500 group-hover:translate-x-2 transition-transform">➔</span></p>
              </div>
              <div onClick={() => window.open("https://youtube.com/@prottoyacademy", "_blank")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 text-2xl mb-6 group-hover:scale-110 transition-transform">🎥</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">Class Lectures</h3>
                <p className="text-2xl font-black text-slate-800 flex items-center justify-between">Watch <span className="text-red-500 group-hover:translate-x-2 transition-transform">➔</span></p>
              </div>
              <div onClick={() => router.push(`?tab=results`)} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:scale-110 transition-transform">🏆</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">Exam Results</h3>
                <p className="text-2xl font-black text-slate-800 flex items-center justify-between">Check <span className="text-blue-500 group-hover:translate-x-2 transition-transform">➔</span></p>
              </div>
            </div>
          </div>
        )}

        {/* FACULTY LIST SECTION */}
        {activeTab === "faculty" && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Our Honorable Faculty</h1>
            <p className="text-slate-500 font-medium mb-8">Meet the experienced and dedicated teachers of Prottoy Academy.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {faculties.map((teacher) => (
                <div key={teacher.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 flex flex-col transition-all group">
                  <div className="w-full aspect-square bg-slate-100 relative overflow-hidden">
                    <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 mb-1">{teacher.name}</h3>
                    <p className="text-blue-600 font-bold text-sm mb-4 uppercase tracking-wide">{teacher.designation}</p>
                    <div className="text-sm text-slate-600 space-y-3">
                      <p>🎓 <span className="font-bold text-slate-800">Edu:</span> {teacher.education}</p>
                      <p>⏳ <span className="font-bold text-slate-800">Exp:</span> {teacher.experience}</p>
                      <p className="mt-4 pt-2 border-t border-slate-100">📚 <span className="inline-block mt-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-xs border border-blue-100">{teacher.subjects}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE SECTION */}
        {activeTab === "profile" && studentData && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
              {!isEditing && <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md">✏️ Edit Details</button>}
            </div>
            
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-5"><span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Full Name:</span><span className="text-slate-900 font-black text-xl">{safeName}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-5"><span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Father's Name:</span><span className="text-slate-800 font-bold text-lg">{studentData.fathers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-5"><span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Mother's Name:</span><span className="text-slate-800 font-bold text-lg">{studentData.mothers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-5"><span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Class:</span><span className="text-blue-600 font-black text-xl bg-blue-50 px-3 py-1 rounded-lg w-fit">{safeClass}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-5"><span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Phone (Login ID):</span><span className="text-slate-800 font-bold text-lg">{studentData.phone_number || studentData.phone || "N/A"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]"><span className="text-slate-500 font-bold uppercase text-sm tracking-wider">Address:</span><span className="text-slate-800 font-bold text-lg">{studentData.address || "Not provided"}</span></div>

                  <div className="mt-10 pt-10 border-t-2 border-dashed border-slate-200">
                    <h3 className="text-xl font-black text-[#0a192f] mb-6 flex items-center gap-3">🛡️ Security Settings</h3>
                    <div className="max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Change Login Password</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" className={inputClass} />
                        <button onClick={handlePasswordChange} disabled={passUpdateLoading} className="px-8 py-3 bg-[#0a192f] hover:bg-slate-800 text-white rounded-xl font-bold whitespace-nowrap transition-all shadow-md">{passUpdateLoading ? "..." : "Update"}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label><input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required className={inputClass} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Father's Name</label><input type="text" value={editForm.fathersName} onChange={e => setEditForm({...editForm, fathersName: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Mother's Name</label><input type="text" value={editForm.mothersName} onChange={e => setEditForm({...editForm, mothersName: e.target.value})} className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Class</label>
                      <select value={editForm.className} onChange={e => setEditForm({...editForm, className: e.target.value})} required className={inputClass}>
                        <option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Address</label><input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className={inputClass} /></div>
                  </div>
                  <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                    <button type="submit" disabled={!!updateMsg} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-md text-lg">{updateMsg ? updateMsg : "💾 Save Changes"}</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PAYMENTS SECTION */}
        {activeTab === "payments" && (
          <div className="animate-fade-in max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-6">My Payment History</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                    <tr>
                      <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-sm">Date</th>
                      <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-sm">Purpose</th>
                      <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-sm">Amount</th>
                      <th className="p-5 font-bold text-slate-500 uppercase tracking-wider text-sm text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPayments.length > 0 ? myPayments.map((payment: any, index: number) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="p-5 text-slate-600 font-bold">{payment.payment_date ? payment.payment_date.substring(0, 10) : ''}</td>
                        <td className="p-5 text-slate-900 font-black text-lg">{payment.payment_purpose}</td>
                        <td className="p-5 font-black text-emerald-600 text-xl">{payment.amount} ৳</td>
                        <td className="p-5 text-center">
                          <span className={`px-4 py-2 rounded-xl text-sm font-black border ${payment.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                            {payment.payment_status}
                          </span>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={4} className="p-12 text-center text-slate-500 font-bold text-lg">No payment records found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLASSES SECTION */}
        {activeTab === "classes" && (
          <div className="bg-white rounded-[2rem] p-10 md:p-20 text-center shadow-lg border border-slate-200 animate-fade-in max-w-3xl mx-auto mt-8">
            <p className="text-7xl mb-6 drop-shadow-md">📺</p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">Watch Your Classes Online<br/><span className="text-red-600">Totally FREE!</span></h2>
            <p className="text-slate-500 font-medium text-lg mb-10">Access all recorded lectures, tutorials, and guidelines from our official channel.</p>
            <a href="https://youtube.com/@prottoyacademy" target="_blank" rel="noopener noreferrer" className="inline-block px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-xl hover:scale-105 text-lg">
              ▶️ Open Prottoy Academy YouTube
            </a>
          </div>
        )}

        {/* EXAM RESULTS SECTION */}
        {activeTab === "results" && (
          <div className="animate-fade-in">
            <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <h1 className="text-3xl font-black text-slate-900">My Exam Results</h1>
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                <button onClick={() => setResultViewMode('integrated')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${resultViewMode === 'integrated' ? 'bg-[#0a192f] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>📑 Integrated Marksheet</button>
                <button onClick={() => setResultViewMode('single')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${resultViewMode === 'single' ? 'bg-[#0a192f] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>📄 Single Exam</button>
              </div>
            </div>

            {resultViewMode === "integrated" && displayResults.length > 0 && (
              <div className="no-print bg-blue-50 border-l-4 border-blue-600 text-blue-800 p-5 rounded-r-2xl mb-10 text-base font-medium shadow-sm">
                💡 <strong>Smart View:</strong> Exams with the exact same name (e.g. "Half Yearly") are automatically combined into a single transcript with recalculated Final GPA.
              </div>
            )}

            <div className="grid gap-12">
              {displayResults.length > 0 ? displayResults.map((res: any) => (
                <div key={res.id} className="print-card bg-white rounded-[2rem] p-6 md:p-12 shadow-xl border-t-[12px] border-[#0a192f] relative overflow-hidden">
                  <div className="no-print absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 text-6xl md:text-8xl font-black text-slate-50 opacity-80 whitespace-nowrap pointer-events-none select-none z-0">
                    PROTTOY ACADEMY
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col items-center border-b-2 border-slate-100 pb-8 mb-10 relative">
                      <div className="absolute left-0 top-0 hidden md:block">
                        <Image src="/prottoy academy logo.png" alt="Logo" width={100} height={100} className="rounded-2xl shadow-md border border-slate-100" />
                      </div>
                      <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-black text-[#0a192f] mb-2 tracking-widest uppercase">PROTTOY ACADEMY</h1>
                        <p className="text-slate-500 font-bold mb-5">Bhabki Bazar, Melandah, Jamalpur | Estd: 2025</p>
                        <div className="inline-block bg-[#0a192f] text-white px-8 py-2.5 rounded-xl font-black text-lg tracking-widest uppercase shadow-lg">ACADEMIC TRANSCRIPT</div>
                      </div>
                      <div className="absolute right-0 bottom-8 text-sm font-black text-slate-400 hidden md:block uppercase tracking-wider">
                        Date: {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_250px] gap-6 mb-10">
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-[110px_15px_1fr] items-center mb-3"><span className="text-slate-500 font-bold text-sm uppercase">Student Name</span><span className="font-black text-slate-300">:</span><span className="font-black text-slate-900 text-lg">{safeName}</span></div>
                        <div className="grid grid-cols-[110px_15px_1fr] items-center mb-3"><span className="text-slate-500 font-bold text-sm uppercase">Student ID</span><span className="font-black text-slate-300">:</span><span className="font-black text-slate-900">{studentData?.student_id}</span></div>
                        <div className="grid grid-cols-[110px_15px_1fr] items-center"><span className="text-slate-500 font-bold text-sm uppercase">Class</span><span className="font-black text-slate-300">:</span><span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit">{safeClass.replace(/Class\s*/i, '').trim()}</span></div>
                      </div>
                      
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-[110px_15px_1fr] items-center mb-3"><span className="text-slate-500 font-bold text-sm uppercase">Examination</span><span className="font-black text-slate-300">:</span><span className="font-black text-[#0a192f] text-lg uppercase tracking-wide">{res.exam_name}</span></div>
                        <div className="grid grid-cols-[110px_15px_1fr] items-center mb-3"><span className="text-slate-500 font-bold text-sm uppercase">Result Status</span><span className="font-black text-slate-300">:</span><span className={`font-black text-lg ${res.grade === 'F' ? 'text-red-600' : 'text-emerald-600'}`}>{res.grade === 'F' ? 'Failed' : 'Passed'}</span></div>
                        <div className="grid grid-cols-[110px_15px_1fr] items-center"><span className="text-slate-500 font-bold text-sm uppercase">Overall GPA</span><span className="font-black text-slate-300">:</span><span className="font-black text-slate-900 text-lg">{res.gpa} ({res.grade})</span></div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hidden lg:block">
                        <h4 className="text-center font-black text-slate-800 border-b border-slate-200 pb-3 mb-3 text-sm uppercase tracking-wider">Grading Scale</h4>
                        <div className="grid grid-cols-2 text-xs font-bold text-slate-500 gap-y-2">
                          <div>80-100 : A+</div><div>70-79 : A</div><div>60-69 : A-</div><div>50-59 : B</div><div>40-49 : C</div><div>33-39 : D</div>
                          <div className="col-span-2 text-center text-red-600 mt-2 bg-red-50 py-1 rounded-md">0-32 : F (Fail)</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-200 mb-12 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0a192f] text-white">
                              <th className="p-5 font-black uppercase tracking-wider text-sm border-r border-slate-700 w-2/5">Subject Name</th>
                              <th className="p-5 font-black uppercase tracking-wider text-sm text-center border-r border-slate-700">Full Marks</th>
                              <th className="p-5 font-black uppercase tracking-wider text-sm text-center border-r border-slate-700">Marks Obtained</th>
                              <th className="p-5 font-black uppercase tracking-wider text-sm text-center">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {(Array.isArray(res.marks_data) ? res.marks_data : []).map((sub: any, i: number) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-5 font-bold text-slate-900 border-r border-slate-200 text-lg">{sub.subject_name || sub.name}</td>
                                <td className="p-5 text-center font-bold text-slate-500 border-r border-slate-200 text-lg">{sub.full_marks || sub.fullMarks}</td>
                                <td className="p-5 text-center font-black text-slate-900 border-r border-slate-200 text-xl">{sub.obtained_marks || sub.obtained}</td>
                                <td className={`p-5 text-center font-black text-xl ${sub.grade === 'F' ? 'text-red-600' : 'text-[#0a192f]'}`}>{sub.grade}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-100 border-t-[3px] border-slate-300">
                            <tr>
                              <td colSpan={2} className="p-5 text-right font-black text-slate-900 text-xl uppercase tracking-wider">Final Result:</td>
                              <td colSpan={2} className={`p-5 text-center font-black text-2xl ${res.grade === 'F' ? 'text-red-600' : 'text-emerald-600'}`}>
                                GPA {res.gpa} <span className="text-slate-500 text-lg">({res.grade})</span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div className="print-footer flex justify-between px-2 md:px-12">
                      <div className="text-center w-36 md:w-48 border-t-2 border-slate-900 pt-3">
                        <p className="font-black text-base text-slate-900 uppercase">Class Teacher</p>
                      </div>
                      <div className="text-center w-36 md:w-48 border-t-2 border-slate-900 pt-3">
                        <p className="font-black text-base text-slate-900 uppercase">Director / CEO</p>
                        <p className="text-sm font-bold text-slate-500 mt-1">Prottoy Academy</p>
                      </div>
                    </div>
                  </div>

                  <div className="no-print flex justify-center mt-16 pt-10 border-t border-slate-200">
                    <button onClick={() => window.print()} className="px-10 py-5 bg-[#0a192f] hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-3 hover:-translate-y-1 text-lg">
                      🖨️ Download / Print Official Marksheet
                    </button>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-[2rem] p-20 text-center shadow-lg border border-slate-200">
                  <p className="text-7xl mb-6">📭</p>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">No Exam Results Found</h3>
                  <p className="text-slate-500 text-lg font-medium">If you missed an exam or your result is pending, it will not appear here. Contact your class teacher.</p>
                </div>
              )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                body { background-color: white !important; margin: 0; }
                .no-print { display: none !important; }
                .print-card { box-shadow: none !important; border: 2px solid #cbd5e1 !important; border-radius: 0 !important; margin: 0 !important; padding: 40px !important; page-break-inside: avoid; break-inside: avoid; border-top: 12px solid #0a192f !important; }
              }
            `}} />
          </div>
        )}
      </div>
    </div>
  );
}

// Suspense Wrapper for useSearchParams
export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-blue-600 font-black text-2xl animate-pulse">Loading Premium Portal...</div>}>
      <StudentContent />
    </Suspense>
  );
}