"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const coreMembers = [
  { id: 901, name: "Md. Rashedul Islam", designation: "Founder and CEO", education: "B.Sc in CSE (studying) at Brahmaputra International University", subjects: "Math, Science, ICT", experience: "6+ Years", image: "/faculty/rashedul.jpg" },
  { id: 902, name: "Md. Shohel Islam", designation: "Founder and MD", education: "B.A in Bangla at Govt. Asheq Mahmud College", subjects: "Bangla", experience: "12+ Years", image: "/faculty/shohel.jpg" }
];

const otherFoundingTeachers = [
  { id: 903, name: "Md. Ratan Hasan", designation: "Instructor", education: "B.Sc in Math (studying) at Govt. Asheq Mahmud College", subjects: "Math, Science", experience: "3+ Years", image: "/faculty/ratan.jpg" },
  { id: 904, name: "Md. Maruf Hasan", designation: "Instructor", education: "B.A in English (studying) at Govt. Asheq Mahmud College", subjects: "English", experience: "4+ Years", image: "/faculty/maruf.jpg" },
  { id: 905, name: "Sayan Mahmud Mahi", designation: "Instructor", education: "B.Sc in Textile Engineering (studying) at Jamalpur Textile Engineering College", subjects: "Science", experience: "3+ Years", image: "/faculty/sayan.jpg" }
];

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

const getSubjectGradeAndGP = (sub: any) => {
  const full = Number(sub.full_marks || sub.fullMarks || 100);
  const obt = Number(sub.obtained_marks ?? sub.obtained ?? 0);
  const pct = full > 0 ? (obt / full) * 100 : 0;

  if (pct >= 80) return { grade: "A+", gpa: 5.0 };
  if (pct >= 70) return { grade: "A", gpa: 4.0 };
  if (pct >= 60) return { grade: "A-", gpa: 3.5 };
  if (pct >= 50) return { grade: "B", gpa: 3.0 };
  if (pct >= 40) return { grade: "C", gpa: 2.0 };
  if (pct >= 33) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
};

// 🔴 গ্রেড এবং প্রাপ্ত নম্বরের শতকরা হার অনুযায়ী অটোমেটিক কমেন্ট / রিমার্কস জেনারেটর
const getDynamicRemark = (grade: string, totalObtained: number, totalFull: number) => {
  const percentage = totalFull > 0 ? (totalObtained / totalFull) * 100 : 0;

  if (grade === "F") {
    return "❌ Unsatisfactory (Failed)! Don't lose hope—identify your weak areas, work hard, and prepare strongly for the next exam.";
  }
  if (percentage >= 90) {
    return "🌟 Outstanding Performance! Excellent result, keep up this brilliant spirit and carry on!";
  }
  if (grade === "A+") {
    return "🎉 Excellent Result! You have done a wonderful job. Carry on and aim even higher!";
  }
  if (grade === "A") {
    return "👏 Very Good Performance! With a little more focus, you can easily achieve A+. Keep trying!";
  }
  if (grade === "A-") {
    return "👍 Good Result! You have great potential. Study more attentively to reach the top grade.";
  }
  if (grade === "B") {
    return "📚 Satisfactory! However, you need more regular practice and dedication to do better in the next exam.";
  }
  if (grade === "C") {
    return "⚠️ Average Performance! Needs significant improvement and extra care in almost all subjects.";
  }
  return "❗ Below Average! You passed marginally. Work hard and consult your teachers regularly.";
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
    } catch (err) {} finally { setLoading(false); }
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
      if (result.success) { alert("✅ Password updated successfully!"); setNewPassword(""); } 
      else alert("❌ Failed to update password.");
    } catch (err) { alert("❌ Something went wrong."); } finally { setPassUpdateLoading(false); }
  };

  const processResultItem = (examName: string, rawSubjects: any[], keyId: any) => {
    let totalFull = 0;
    let totalObtained = 0;
    let totalPoints = 0;
    let hasFailed = false;

    const processedSubs = rawSubjects.map((sub: any) => {
      const full = Number(sub.full_marks || sub.fullMarks || 100);
      
      const rawCq = sub.cq ?? sub.cq_marks ?? sub.written ?? "";
      const rawMcq = sub.mcq ?? sub.mcq_marks ?? "";
      const rawPr = sub.pr ?? sub.practical ?? sub.pr_marks ?? "";

      const cqVal = rawCq !== "" && rawCq !== "-" && rawCq !== null ? Number(rawCq) : null;
      const mcqVal = rawMcq !== "" && rawMcq !== "-" && rawMcq !== null ? Number(rawMcq) : null;
      const prVal = rawPr !== "" && rawPr !== "-" && rawPr !== null ? Number(rawPr) : null;

      const hasBreakdown = cqVal !== null || mcqVal !== null || prVal !== null;
      const calculatedObt = hasBreakdown ? (cqVal || 0) + (mcqVal || 0) + (prVal || 0) : Number(sub.obtained_marks ?? sub.obtained ?? 0);
      const obt = Number(sub.obtained_marks ?? sub.obtained ?? calculatedObt);
      const highest = sub.highestMarks || sub.highest_marks || obt;

      const { grade, gpa: gp } = getSubjectGradeAndGP({ fullMarks: full, obtained: obt });

      totalFull += full;
      totalObtained += obt;
      totalPoints += gp;
      if (grade === "F") hasFailed = true;

      return {
        name: sub.subject_name || sub.name || "Subject",
        fullMarks: full,
        highestMarks: highest,
        cq: cqVal !== null ? cqVal : "-",
        mcq: mcqVal !== null ? mcqVal : "-",
        pr: prVal !== null ? prVal : "-",
        obtained: obt,
        grade,
        gp: gp.toFixed(2)
      };
    });

    const count = processedSubs.length || 1;
    const rawGpa = hasFailed ? 0.0 : totalPoints / count;
    const finalGpa = rawGpa.toFixed(2);
    let finalGrade = "F";

    if (!hasFailed) {
      if (rawGpa >= 5.0) finalGrade = "A+";
      else if (rawGpa >= 4.0) finalGrade = "A";
      else if (rawGpa >= 3.5) finalGrade = "A-";
      else if (rawGpa >= 3.0) finalGrade = "B";
      else if (rawGpa >= 2.0) finalGrade = "C";
      else if (rawGpa >= 1.0) finalGrade = "D";
    }

    return {
      id: keyId,
      exam_name: examName,
      marks_data: processedSubs,
      totalFull,
      totalObtained,
      gpa: finalGpa,
      grade: finalGrade,
      remark: getDynamicRemark(finalGrade, totalObtained, totalFull)
    };
  };

  const getDisplayResults = () => {
    if (resultViewMode === "integrated") {
      const grouped: Record<string, { exam_name: string; subs: any[] }> = {};
      myResults.forEach((res) => {
        const key = res.exam_name ? res.exam_name.trim().toUpperCase() : "EXAM";
        const arr = parseSubjectsSafe(res.marks_data || res.subjects);
        if (arr.length === 0) return;
        if (!grouped[key]) grouped[key] = { exam_name: res.exam_name, subs: [...arr] };
        else grouped[key].subs = [...grouped[key].subs, ...arr];
      });
      return Object.entries(grouped).map(([k, val]) => processResultItem(val.exam_name, val.subs, k));
    } else {
      return myResults
        .map((res, idx) => {
          const arr = parseSubjectsSafe(res.marks_data || res.subjects);
          return processResultItem(res.exam_name, arr, res.id || idx);
        })
        .filter((r) => r.marks_data.length > 0);
    }
  };

  const displayResults = getDisplayResults();
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold shadow-sm outline-none";

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-blue-600 font-bold text-xl">Loading your portal...</div>;

  const safeName = studentData?.full_name || studentData?.fullName || studentData?.name || "Student";
  const safeClass = studentData?.class_name || studentData?.className || studentData?.class || "Ten";

  return (
    <div className="w-full min-h-screen print:min-h-0 bg-[#f8fafc] print:bg-white text-slate-900 font-sans pb-20 print:pb-0">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 print:p-0 print:max-w-none">
        
        {/* Top Header */}
        <div className="no-print print:hidden flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">Student Portal</h2>
            <p className="text-sm font-semibold text-slate-500">Prottoy Academy</p>
          </div>
          <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-5 rounded-xl border border-red-100">
            🚪 <span className="hidden md:inline">Logout</span>
          </button>
        </div>

        {/* Sticky Back Button */}
        {activeTab !== "dashboard" && (
          <div className="no-print print:hidden mb-6">
            <button
              onClick={() => router.push("?tab=dashboard")}
              className="px-6 py-3 bg-[#0f172a] text-white hover:bg-slate-800 font-bold rounded-xl flex items-center gap-3 shadow-lg w-fit"
            >
              ⬅ Back to Dashboard
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            <div className="relative bg-[#0a192f] text-white rounded-[2rem] p-8 md:p-12 mb-10 overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <p className="text-blue-400 font-bold tracking-widest mb-2 text-sm uppercase">Academic Overview</p>
                <h1 className="text-3xl md:text-5xl font-black mb-4 text-white">
                  Welcome back, <span className="text-emerald-300">{safeName}</span>!
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-xl font-medium">Track your academic progress, view exam results, and access all your class materials in one place.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div onClick={() => router.push(`?tab=profile`)} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-6">👤</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase">My Profile</h3>
                <p className="text-2xl font-black text-slate-800 flex justify-between">Details <span>➔</span></p>
              </div>
              <div onClick={() => router.push(`?tab=payments`)} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-6">💳</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase">My Payments</h3>
                <p className="text-2xl font-black text-slate-800 flex justify-between">History <span>➔</span></p>
              </div>
              <div onClick={() => window.open("https://youtube.com/@prottoyacademy", "_blank")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl mb-6">🎥</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase">Class Lectures</h3>
                <p className="text-2xl font-black text-slate-800 flex justify-between">Watch <span>➔</span></p>
              </div>
              <div onClick={() => router.push(`?tab=results`)} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-6">🏆</div>
                <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase">Exam Results</h3>
                <p className="text-2xl font-black text-slate-800 flex justify-between">Check <span>➔</span></p>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE SECTION */}
        {activeTab === "profile" && studentData && (
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
              {!isEditing && <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">✏️ Edit Details</button>}
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Full Name:</span><span className="font-black text-xl">{safeName}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Father&apos;s Name:</span><span className="font-bold">{studentData.fathers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Mother&apos;s Name:</span><span className="font-bold">{studentData.mothers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Class:</span><span className="text-blue-600 font-black">{safeClass}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]"><span className="text-slate-500 font-bold">Address:</span><span className="font-bold">{studentData.address || "Not provided"}</span></div>

                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
                    <h3 className="text-xl font-black mb-4">🛡️ Change Login Password</h3>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                      <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" className={inputClass} />
                      <button onClick={handlePasswordChange} disabled={passUpdateLoading} className="px-8 py-3 bg-[#0a192f] text-white rounded-xl font-bold">{passUpdateLoading ? "..." : "Update"}</button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div><label className="block text-sm font-bold mb-2">Full Name</label><input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required className={inputClass} /></div>
                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl">{updateMsg || "💾 Save Changes"}</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 font-bold rounded-xl">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* FACULTY & PAYMENTS & CLASSES */}
        {activeTab === "faculty" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {faculties.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 p-5">
                <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full aspect-square object-cover rounded-2xl mb-4" />
                <h3 className="text-xl font-black">{teacher.name}</h3>
                <p className="text-blue-600 font-bold text-sm mb-2">{teacher.designation}</p>
                <p className="text-xs text-slate-600">🎓 {teacher.education}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr><th className="p-4">Date</th><th className="p-4">Purpose</th><th className="p-4">Amount</th><th className="p-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y">
                {myPayments.map((p: any, i: number) => (
                  <tr key={i}><td className="p-4">{p.payment_date?.substring(0, 10)}</td><td className="p-4 font-bold">{p.payment_purpose}</td><td className="p-4 font-black text-emerald-600">{p.amount} ৳</td><td className="p-4 text-center font-bold">{p.payment_status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "classes" && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">Watch Recorded Classes</h2>
            <a href="https://www.youtube.com/@DreamUpAcademy" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-red-600 text-white font-black rounded-xl">▶️ Open YouTube Channel</a>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🔴 Official Marksheet      */}
        {/* ========================================================================= */}
        {activeTab === "results" && (
          <div>
            <div className="no-print print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Academic Marksheet</h1>
                <p className="text-sm text-slate-500 font-semibold"> Print </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                  <button onClick={() => setResultViewMode('integrated')} className={`px-4 py-2 rounded-lg font-bold text-xs ${resultViewMode === 'integrated' ? 'bg-[#0a192f] text-white' : 'text-slate-600'}`}>📑 Combined View</button>
                  <button onClick={() => setResultViewMode('single')} className={`px-4 py-2 rounded-lg font-bold text-xs ${resultViewMode === 'single' ? 'bg-[#0a192f] text-white' : 'text-slate-600'}`}>📄 Single View</button>
                </div>
                {displayResults.length > 0 && (
                  <button onClick={() => window.print()} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 text-sm">
                    🖨️ Print 
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-10 print:space-y-0">
              {displayResults.length > 0 ? displayResults.map((res: any) => (
                <div key={res.id} className="marksheet-page relative overflow-hidden bg-white mx-auto max-w-[920px] p-6 md:p-8 border-[3px] border-black shadow-2xl print:shadow-none text-black">
                  
                  {/* 🔴 CENTER LOGO WATERMARK (জলছাপ) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                    <img 
                      src="/prottoy academy logo.png" 
                      alt="Prottoy Academy Watermark" 
                      className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] object-contain opacity-[0.08] print:opacity-[0.10]" 
                    />
                  </div>

                  {/* MAIN CONTENT ABOVE WATERMARK */}
                  <div className="relative z-10">
                    
                    {/* 1. INSTITUTION BILINGUAL HEADER */}
                    <div className="border-b-2 border-black pb-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_1fr] print:grid-cols-[1fr_80px_1fr] items-center gap-2 text-center">
                        <div className="text-center md:text-left print:text-left">
                          <h2 className="text-2xl font-black text-emerald-800 tracking-tight">প্রত্যয় একাডেমি</h2>
                          <p className="text-xs font-bold text-gray-800">ভাবকী বাজার, মেলান্দহ, জামালপুর</p>
                          <p className="text-[11px] font-semibold text-gray-700">স্থাপিতঃ ২০২৫ | একাডেমিক পোর্টাল</p>
                        </div>

                        <div className="flex justify-center my-1 md:my-0">
                          <Image src="/prottoy academy logo.png" alt="Logo" width={75} height={75} className="rounded-full border border-black object-cover bg-white" />
                        </div>

                        <div className="text-center md:text-right print:text-right">
                          <h2 className="text-xl font-black text-emerald-800 uppercase tracking-tight">PROTTOY ACADEMY</h2>
                          <p className="text-xs font-bold text-gray-800">P.O: Bhabki Bazar, Upazilla: Melandah, Jamalpur</p>
                        <p className="text-[11px] font-semibold text-gray-700">ESTD:- 2025 | Academic Portal </p>
                        </div>
                      </div>

                      <div className="text-center mt-2">
                        <span className="inline-block border-b-2 border-black px-8 pb-0.5 font-black text-sm uppercase tracking-wider">
                          Mark Sheet - {safeClass}
                        </span>
                      </div>
                    </div>

                    {/* 2. STUDENT DETAILS (LEFT) & GRADING SCALE + SUMMARY (RIGHT) */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] print:grid-cols-[1fr_220px] gap-4 mb-3 items-start">
                      
                      <div className="text-xs space-y-1.5 font-semibold">
                        <div className="w-20 h-20 border border-black bg-gray-100/80 flex items-center justify-center rounded mb-2 overflow-hidden">
                          <span className="text-3xl">🧑‍🎓</span>
                        </div>
                        <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold">Student Name</span><span>:</span><span className="font-black uppercase">{safeName}</span></div>
                        {studentData?.fathers_name && <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold">Father&apos;s Name</span><span>:</span><span className="uppercase">{studentData.fathers_name}</span></div>}
                        {studentData?.mothers_name && <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold">Mother&apos;s Name</span><span>:</span><span className="uppercase">{studentData.mothers_name}</span></div>}
                        <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold">Exam Name</span><span>:</span><span className="font-bold uppercase">{res.exam_name}</span></div>
                        <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold">Student ID</span><span>:</span><span className="font-bold">{studentData?.student_id}</span></div>
                        <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold">Class</span><span>:</span><span className="font-bold">{safeClass}</span></div>
                        <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold underline">Full Marks</span><span>:</span><span className="font-bold">{res.totalFull}</span></div>
                        <div className="grid grid-cols-[120px_10px_1fr]"><span className="font-bold underline">Total Marks</span><span>:</span><span className="font-black">{res.totalObtained}</span></div>
                      </div>

                      <div>
                        <table className="w-full border-collapse border border-black text-[10px] text-center mb-2 bg-white/80">
                          <thead>
                            <tr className="bg-gray-100/90 font-bold">
                              <th className="border border-black py-0.5 px-1">Range</th>
                              <th className="border border-black py-0.5 px-1">Grade</th>
                              <th className="border border-black py-0.5 px-1">GP</th>
                            </tr>
                          </thead>
                          <tbody className="font-semibold">
                            <tr><td className="border border-black py-0.5">80-100</td><td className="border border-black">A+</td><td className="border border-black">5.0</td></tr>
                            <tr><td className="border border-black py-0.5">70-79</td><td className="border border-black">A</td><td className="border border-black">4.0</td></tr>
                            <tr><td className="border border-black py-0.5">60-69</td><td className="border border-black">A-</td><td className="border border-black">3.5</td></tr>
                            <tr><td className="border border-black py-0.5">50-59</td><td className="border border-black">B</td><td className="border border-black">3.0</td></tr>
                            <tr><td className="border border-black py-0.5">40-49</td><td className="border border-black">C</td><td className="border border-black">2.0</td></tr>
                            <tr><td className="border border-black py-0.5">33-39</td><td className="border border-black">D</td><td className="border border-black">1.0</td></tr>
                            <tr><td className="border border-black py-0.5">00-32</td><td className="border border-black font-bold text-red-600">F</td><td className="border border-black">0.0</td></tr>
                          </tbody>
                        </table>

                        <div className="text-xs space-y-1 font-semibold border-t border-black pt-1.5">
                          <div className="grid grid-cols-[100px_10px_1fr]">
                            <span>Status</span><span>:</span>
                            <span className={`font-black ${res.grade === 'F' ? 'text-red-600' : 'text-emerald-700'}`}>{res.grade === 'F' ? 'FAIL' : 'PASS'}</span>
                          </div>
                          <div className="grid grid-cols-[100px_10px_1fr]">
                            <span className="underline">GPA</span><span>:</span>
                            <span className="font-black">{res.gpa}</span>
                          </div>
                          <div className="grid grid-cols-[100px_10px_1fr]">
                            <span>Grade</span><span>:</span>
                            <span className="font-black">{res.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-[10px] font-semibold text-gray-700 mb-2">
                      [ N.B: CQ = Creative Question (Written), MCQ = Multiple Choice Question, PR = Practical ]
                    </p>

                    {/* 3. SUBJECT-WISE GRADE/MARKS TABLE (CALCULATE MARKS REMOVED) */}
                    <h3 className="text-center font-black text-sm underline mb-2">Subject-Wise Grade/Marks</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border-[1.5px] border-black text-xs bg-transparent">
                        <thead>
                          <tr className="bg-gray-100/80 font-bold text-center">
                            <th rowSpan={2} className="border border-black p-1.5 text-left w-[36%]">Name of Subject</th>
                            <th rowSpan={2} className="border border-black p-1 w-[10%]">Full Marks</th>
                            <th rowSpan={2} className="border border-black p-1 w-[10%]">Highest Marks</th>
                            <th colSpan={3} className="border border-black p-1">Obtaining Marks</th>
                            <th rowSpan={2} className="border border-black p-1 w-[11%]">Total Marks</th>
                            <th rowSpan={2} className="border border-black p-1 w-[9%]">Grade</th>
                            <th rowSpan={2} className="border border-black p-1 w-[10%]">Grade Point</th>
                          </tr>
                          <tr className="bg-gray-100/80 font-bold text-center text-[10px]">
                            <th className="border border-black py-1 px-1.5">CQ</th>
                            <th className="border border-black py-1 px-1.5">MCQ</th>
                            <th className="border border-black py-1 px-1.5">PR</th>
                          </tr>
                        </thead>
                        <tbody className="font-medium bg-transparent">
                          {res.marks_data.map((sub: any, idx: number) => (
                            <tr key={idx} className="text-center bg-transparent">
                              <td className="border border-black p-1.5 text-left font-bold">{sub.name}</td>
                              <td className="border border-black p-1">{sub.fullMarks}</td>
                              <td className="border border-black p-1">{sub.highestMarks}</td>
                              <td className="border border-black p-1 font-bold">{sub.cq}</td>
                              <td className="border border-black p-1 font-bold">{sub.mcq}</td>
                              <td className="border border-black p-1 font-bold">{sub.pr}</td>
                              <td className="border border-black p-1 font-black">{sub.obtained}</td>
                              <td className={`border border-black p-1 font-black ${sub.grade === 'F' ? 'text-red-600' : ''}`}>{sub.grade}</td>
                              <td className="border border-black p-1 font-bold">{sub.gpa}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100/80 font-black text-center">
                            <td className="border border-black p-1.5 text-right">Total Marks &amp; GPA:</td>
                            <td className="border border-black p-1">{res.totalFull}</td>
                            <td colSpan={4} className="border border-black p-1"></td>
                            <td className="border border-black p-1">{res.totalObtained}</td>
                            <td className={`border border-black p-1 ${res.grade === 'F' ? 'text-red-600' : 'text-emerald-800'}`}>{res.grade}</td>
                            <td className="border border-black p-1">{res.gpa}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* 🔴 4. DYNAMIC REMARKS / COMMENT BOX BASED ON GRADE & MARKS */}
                    <div className="mt-4 border-[1.5px] border-black bg-gray-50/70 px-4 py-2.5 rounded flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                      <span className="font-black uppercase tracking-wide whitespace-nowrap text-gray-900">
                        Remarks / Comment :
                      </span>
                      <span className={`font-bold italic ${res.grade === 'F' ? 'text-red-600' : 'text-emerald-900'}`}>
                        &ldquo;{res.remark}&rdquo;
                      </span>
                    </div>

                    {/* 5. SIGNATURE FOOTER */}
                    <div className="flex justify-between items-end mt-12 pt-4 px-4 text-xs font-bold">
                      <div className="text-center border-t border-black pt-1 w-36">
                        Guardian&apos;s Signature
                      </div>
                      <div className="text-center border-t border-black pt-1 w-36">
                        Class Teacher
                      </div>
                      <div className="text-center border-t border-black pt-1 w-44">
                        Director / CEO<br/>
                        <span className="text-[10px] font-normal">Prottoy Academy</span>
                      </div>
                    </div>

                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-3xl p-16 text-center border">
                  <p className="text-6xl mb-4">📭</p>
                  <h3 className="text-2xl font-black">No Exam Results Found</h3>
                </div>
              )}
            </div>

            {/* STRICT 1-PAGE A4 PRINT CSS */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm;
                }
                html, body {
                  height: auto !important;
                  overflow: visible !important;
                  background: #ffffff !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print {
                  display: none !important;
                }
                .marksheet-page {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 15px !important;
                  border: 2px solid #000000 !important;
                  box-shadow: none !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  page-break-after: always;
                }
                .marksheet-page:last-child {
                  page-break-after: auto;
                }
              }
            `}} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center font-black text-xl">Loading Portal...</div>}>
      <StudentContent />
    </Suspense>
  );
}