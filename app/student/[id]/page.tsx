"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const getDynamicRemark = (grade: string, totalObtained: number, totalFull: number) => {
  const percentage = totalFull > 0 ? (totalObtained / totalFull) * 100 : 0;
  if (grade === "F") return "❌ Unsatisfactory (Failed)! Don't lose hope—identify your weak areas, work hard, and prepare strongly for the next exam.";
  if (percentage >= 90) return "🌟 Outstanding Performance! Excellent result, keep up this brilliant spirit and carry on!";
  if (grade === "A+") return "🎉 Excellent Result! You have done a wonderful job. Carry on and aim even higher!";
  if (grade === "A") return "👏 Very Good Performance! With a little more focus, you can easily achieve A+. Keep trying!";
  if (grade === "A-") return "👍 Good Result! You have great potential. Study more attentively to reach the top grade.";
  if (grade === "B") return "📚 Satisfactory! However, you need more regular practice and dedication to do better in the next exam.";
  if (grade === "C") return "⚠️ Average Performance! Needs significant improvement and extra care in almost all subjects.";
  return "❗ Below Average! You passed marginally. Work hard and consult your teachers regularly.";
};

const getSubjectGradeAndGP = (obt: number, full: number) => {
  const pct = full > 0 ? (obt / full) * 100 : 0;
  if (pct >= 80) return { grade: "A+", gp: 5.0 };
  if (pct >= 70) return { grade: "A", gp: 4.0 };
  if (pct >= 60) return { grade: "A-", gp: 3.5 };
  if (pct >= 50) return { grade: "B", gp: 3.0 };
  if (pct >= 40) return { grade: "C", gp: 2.0 };
  if (pct >= 33) return { grade: "D", gp: 1.0 };
  return { grade: "F", gp: 0.0 };
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
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [myResults, setMyResults] = useState<any[]>([]);
  const [myNotices, setMyNotices] = useState<any[]>([]);
  const [myMaterials, setMyMaterials] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    fathersName: "",
    mothersName: "",
    phone: "",
    address: ""
  });
  const [editImage, setEditImage] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passUpdateLoading, setPassUpdateLoading] = useState(false);

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  const handleStudentImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ ছবির সাইজ ৫ মেগাবাইটের (5MB) নিচে দিন।");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const img = new window.Image();
      img.src = base64String;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 300;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = Math.round(img.width * scaleSize);
          canvas.height = Math.round(img.height * scaleSize);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setEditImage(canvas.toDataURL("image/jpeg", 0.6));
          } else {
            setEditImage(base64String);
          }
        } catch (err) {
          setEditImage(base64String);
        }
      };
      img.onerror = () => setEditImage(base64String);
    };
    reader.onerror = () => alert("❌ ছবিটি পড়তে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।");
  };

  const fetchMyData = async () => {
    try {
      const res = await fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" });
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
            phone: myInfo.phone_number || myInfo.phone || "",
            address: myInfo.address || ""
          });

          const cls = myInfo.class_name || myInfo.className || myInfo.class || "";
          const sid = myInfo.student_id || myInfo.id;
          fetchExtraData(cls, sid);
        }
      }
    } catch (err) {} finally { setLoading(false); }
  };

  const fetchExtraData = async (className: string, studentId: any) => {
    try {
      const [notRes, matRes, attRes] = await Promise.all([
        fetch(`/api/notices?className=${encodeURIComponent(className)}&t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/materials?className=${encodeURIComponent(className)}&t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/attendance?studentId=${studentId}&t=${Date.now()}`, { cache: "no-store" }),
      ]);
      const notData = await notRes.json();
      if (notData.success && Array.isArray(notData.data)) setMyNotices(notData.data);

      const matData = await matRes.json();
      if (matData.success && Array.isArray(matData.data)) setMyMaterials(matData.data);

      const attData = await attRes.json();
      if (attData.success && Array.isArray(attData.data)) setMyAttendance(attData.data);
    } catch (e) {}
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setFaculties(data.data);
      else setFaculties([]);
    } catch (err) { setFaculties([]); }
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

      if (data.success && Array.isArray(data.data)) {
        const studentResults = data.data.filter((r: any) => String(r.student_id) === String(id));
        setMyResults(studentResults);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (id) { fetchMyData(); fetchFaculties(); fetchMyPayments(); fetchMyResults(); }
  }, [id]);

  const handleLogout = () => { router.push("/"); };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg("Updating...");
    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          fullName: editForm.fullName,
          fathersName: editForm.fathersName,
          mothersName: editForm.mothersName,
          className: studentData?.class_name || "",
          phone: editForm.phone,
          address: editForm.address,
          profile_image: editImage || undefined
        })
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Profile Updated Successfully!");
        setIsEditing(false);
        setEditImage("");
        fetchMyData();
      } else alert("❌ Error updating profile: " + (result.message || ""));
    } catch (error) {
      alert("❌ Something went wrong.");
    } finally {
      setUpdateMsg("");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return alert("⚠️ Please type a new password!");
    setPassUpdateLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_password', id: Number(id), newPassword: newPassword })
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Password updated successfully!");
        setNewPassword("");
      } else alert("❌ Failed to update password.");
    } catch (err) {
      alert("❌ Something went wrong.");
    } finally {
      setPassUpdateLoading(false);
    }
  };

  const generateDisplayResults = () => {
    if (myResults.length === 0) return [];
    const groupedExams: Record<string, any[]> = {};

    myResults.forEach(res => {
      const examName = res.exam_name || "Unknown Exam";
      if (!groupedExams[examName]) groupedExams[examName] = [];
      groupedExams[examName].push(res);
    });

    const finalMarksheets: any[] = [];

    Object.entries(groupedExams).forEach(([examName, subjectsArray], index) => {
      let totalFull = 0;
      let totalObtained = 0;
      let totalPoints = 0;
      let hasFailed = false;

      const uniqueSubjectsMap: Record<string, any> = {};
      subjectsArray.forEach(sub => {
        const subName = sub.subject_name || "Unknown Subject";
        uniqueSubjectsMap[subName] = sub;
      });
      const uniqueSubjectsArray = Object.values(uniqueSubjectsMap);

      const processedSubs = uniqueSubjectsArray.map((sub: any) => {
        const full = Number(sub.full_marks || 100);
        const obt = Number(sub.total || 0);
        const highest = Number(sub.highest_marks || obt);

        const cq = sub.cq !== null && sub.cq !== "" ? Number(sub.cq) : "-";
        const mcq = sub.mcq !== null && sub.mcq !== "" ? Number(sub.mcq) : "-";
        const pr = sub.pr !== null && sub.pr !== "" ? Number(sub.pr) : "-";

        const { grade, gp } = getSubjectGradeAndGP(obt, full);

        totalFull += full;
        totalObtained += obt;
        totalPoints += gp;
        if (grade === "F") hasFailed = true;

        return {
          name: sub.subject_name || "Unknown Subject",
          fullMarks: full,
          highestMarks: highest,
          cq, mcq, pr,
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

      finalMarksheets.push({
        id: `exam_${index}`,
        exam_name: examName,
        marks_data: processedSubs,
        totalFull,
        totalObtained,
        gpa: finalGpa,
        grade: finalGrade,
        remark: getDynamicRemark(finalGrade, totalObtained, totalFull)
      });
    });

    return finalMarksheets;
  };

  const displayResults = generateDisplayResults();
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-blue-600 font-bold text-xl">Loading your portal...</div>;

  const safeName = studentData?.full_name || studentData?.fullName || studentData?.name || "Student";
  const safeClass = studentData?.class_name || studentData?.className || studentData?.class || "N/A";

  const totalAttDays = myAttendance.length;
  const presentDays = myAttendance.filter((a) => a.status === "Present").length;
  const absentDays = totalAttDays - presentDays;
  const attPercentage = totalAttDays > 0 ? Math.round((presentDays / totalAttDays) * 100) : 0;

  return (
    <div className="w-full min-h-screen print:min-h-0 bg-[#f8fafc] print:bg-white text-slate-900 font-sans pb-20 print:pb-0">
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 print:p-0 print:max-w-none">

        {/* TOP HEADER */}
        <div className="no-print print:hidden flex justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">Student Portal</h2>
            <p className="text-xs md:text-sm font-semibold text-slate-500">Prottoy Academy</p>
          </div>

          <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 md:px-5 rounded-xl border border-red-100 transition-colors text-sm">
            🚪 <span className="hidden md:inline">Logout</span>
          </button>
        </div>

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

        {activeTab === "dashboard" && (
          <div className="animate-fade-in">
            {/* HERO BANNER WITH FULL-FIT PHOTO CARD & OVERLAY ID/CLASS */}
            <div className="relative bg-[#0a192f] text-white rounded-[2rem] p-8 md:p-12 mb-8 overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-blue-400 font-bold tracking-widest mb-2 text-sm uppercase">Academic Overview</p>
                  <h1 className="text-3xl md:text-5xl font-black mb-4 text-white">
                    Welcome back, <span className="text-emerald-300">{safeName}</span>!
                  </h1>
                  <p className="text-slate-400 text-base md:text-lg max-w-xl font-medium">
                    Track your academic progress, attendance, exam results, and class materials in one place.
                  </p>
                </div>

                {/* Full-Fit Professional Photo Card with ID & Class Overlay */}
                <div
                  onClick={() => router.push("?tab=profile")}
                  title="Open Profile"
                  className="relative w-44 h-52 md:w-48 md:h-56 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl cursor-pointer group shrink-0 bg-slate-800"
                >
                  {studentData?.profile_image ? (
                    <img
                      src={studentData.profile_image}
                      alt={safeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 text-emerald-300 flex items-center justify-center font-black text-5xl">
                      {safeName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/35 to-transparent" />

                  <div className="absolute bottom-0 inset-x-0 p-3.5 text-center">
                    <p className="text-xs font-black text-white tracking-wider drop-shadow">
                      ID: {studentData?.student_id || id}
                    </p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[11px] font-bold shadow-sm">
                      {safeClass}{studentData?.student_group ? ` • ${studentData.student_group}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTICE CORNER PREVIEW */}
            {myNotices.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 md:p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-black text-amber-900 flex items-center gap-2">📢 Notice Corner</h2>
                  <button
                    onClick={() => router.push("?tab=notices")}
                    className="text-xs font-black text-amber-800 hover:underline"
                  >
                    View All ({myNotices.length}) ➔
                  </button>
                </div>
                <div className="space-y-2.5">
                  {myNotices.slice(0, 2).map((n) => (
                    <div key={n.id} className="bg-white p-3.5 rounded-2xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mr-2">
                          {n.target_class === "All" ? "General" : n.target_class}
                        </span>
                        <span className="font-black text-sm text-slate-800">{n.title}</span>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{n.content}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                        {n.created_at?.substring(0, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div onClick={() => router.push(`?tab=profile`)} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-5">👤</div>
                <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase">My Profile</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Details &amp; Edit <span>➔</span></p>
              </div>

              <div onClick={() => router.push(`?tab=attendance`)} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-5">📋</div>
                <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase">My Attendance</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">
                  {totalAttDays > 0 ? `${attPercentage}% Present` : "Check Record"} <span>➔</span>
                </p>
              </div>

              <div onClick={() => router.push(`?tab=materials`)} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-5">📚</div>
                <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase">Class Materials</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Notes &amp; HW ({myMaterials.length}) <span>➔</span></p>
              </div>

              <div onClick={() => router.push(`?tab=results`)} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl mb-5">🏆</div>
                <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase">Exam Results</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Marksheet <span>➔</span></p>
              </div>

              <div onClick={() => router.push(`?tab=notices`)} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-5">📢</div>
                <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase">Notice Corner</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">All Notices ({myNotices.length}) <span>➔</span></p>
              </div>

              <div onClick={() => router.push(`?tab=payments`)} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-2xl mb-5">💳</div>
                <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase">My Payments</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">History <span>➔</span></p>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-black text-slate-900">📋 My Attendance Report</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Classes</p>
                <p className="text-3xl font-black text-slate-800 mt-1">{totalAttDays}</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-center">
                <p className="text-xs font-bold text-emerald-700 uppercase">Present</p>
                <p className="text-3xl font-black text-emerald-700 mt-1">{presentDays}</p>
              </div>
              <div className="bg-red-50 p-5 rounded-2xl border border-red-200 text-center">
                <p className="text-xs font-bold text-red-600 uppercase">Absent</p>
                <p className="text-3xl font-black text-red-600 mt-1">{absentDays}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 text-center">
                <p className="text-xs font-bold text-blue-700 uppercase">Attendance %</p>
                <p className="text-3xl font-black text-blue-700 mt-1">{attPercentage}%</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myAttendance.length > 0 ? myAttendance.map((a: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-4 font-bold">{a.attendance_date?.substring(0, 10)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${a.status === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-semibold">{a.marked_by || "Teacher"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-500 font-bold">No attendance records yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLASS MATERIALS TAB */}
        {activeTab === "materials" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">📚 Class Materials &amp; Homework</h1>
                <p className="text-sm text-slate-500 font-semibold">Notes, PDFs, and Homework for {safeClass}</p>
              </div>
              <a
                href="https://www.youtube.com/@DreamUpAcademy"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                ▶️ YouTube Lectures
              </a>
            </div>

            {myMaterials.length > 0 ? (
              <div className="space-y-4">
                {myMaterials.map((m: any) => (
                  <div key={m.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700">{m.material_type}</span>
                        <span className="text-xs font-bold text-slate-500">{m.subject_name} • By {m.faculty_name}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{m.title}</h3>
                      {m.description && <p className="text-sm text-slate-600 mt-1">{m.description}</p>}
                      <p className="text-[11px] text-slate-400 font-semibold mt-2">{m.created_at?.substring(0, 10)}</p>
                    </div>
                    {m.link_url && (
                      <a
                        href={m.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-[#0a192f] hover:bg-slate-800 text-white font-bold rounded-xl text-xs shrink-0"
                      >
                        🔗 Open Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 font-bold">
                No class materials uploaded for {safeClass} yet.
              </div>
            )}
          </div>
        )}

        {/* NOTICE CORNER TAB */}
        {activeTab === "notices" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-black text-slate-900">📢 Notice Corner</h1>
            {myNotices.length > 0 ? (
              <div className="space-y-4">
                {myNotices.map((n: any) => (
                  <div key={n.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                        {n.target_class === "All" ? "General Notice" : `${n.target_class} Notice`}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{n.created_at?.substring(0, 10)}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{n.title}</h3>
                    <p className="text-slate-700 mt-2 whitespace-pre-line text-sm leading-relaxed">{n.content}</p>
                    <p className="text-xs font-bold text-slate-400 mt-3">Posted by: {n.posted_by}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 font-bold">
                No notices available right now.
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && studentData && (
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                  ✏️ Edit Details
                </button>
              )}
            </div>
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
              {!isEditing ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                    {studentData.profile_image ? (
                      <img src={studentData.profile_image} alt={safeName} className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 border-4 border-blue-100 flex items-center justify-center font-black text-3xl shadow-sm">
                        {safeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{safeName}</h2>
                      <p className="text-sm font-bold text-blue-600 mt-0.5">{safeClass} {studentData.student_group ? `• ${studentData.student_group}` : ""}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Student ID (Login ID): {studentData.student_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Full Name:</span><span className="font-black text-xl">{safeName}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Father&apos;s Name:</span><span className="font-bold">{studentData.fathers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Mother&apos;s Name:</span><span className="font-bold">{studentData.mothers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Class:</span><span className="text-blue-600 font-black">{safeClass}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b pb-4"><span className="text-slate-500 font-bold">Phone Number:</span><span className="font-bold">{studentData.phone_number || studentData.phone || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]"><span className="text-slate-500 font-bold">Address:</span><span className="font-bold">{studentData.address || "Not provided"}</span></div>

                  <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200">
                    <h3 className="text-xl font-black mb-4">🛡️ Change Login Password</h3>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                      <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" className={inputClass} />
                      <button onClick={handlePasswordChange} disabled={passUpdateLoading} className="px-8 py-3 bg-[#0a192f] hover:bg-slate-800 text-white rounded-xl font-bold transition-colors">
                        {passUpdateLoading ? "..." : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    {editImage || studentData.profile_image ? (
                      <img src={editImage || studentData.profile_image} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl shrink-0">
                        {safeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="w-full">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Change Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleStudentImageSelect} className="text-xs w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                    <input type="text" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father&apos;s Name</label>
                      <input type="text" value={editForm.fathersName} onChange={e => setEditForm({ ...editForm, fathersName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mother&apos;s Name</label>
                      <input type="text" value={editForm.mothersName} onChange={e => setEditForm({ ...editForm, mothersName: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                      <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="017XXXXXXXX" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                      <input type="text" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button type="submit" disabled={!!updateMsg} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors">
                      {updateMsg || "💾 Save Changes"}
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setEditImage(""); }} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === "faculty" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {faculties.length > 0 ? faculties.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 p-5">
                <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full aspect-square object-cover rounded-2xl mb-4" />
                <h3 className="text-xl font-black">{teacher.name}</h3>
                <p className="text-blue-600 font-bold text-sm mb-2">{teacher.designation}</p>
                <p className="text-xs text-slate-600">🎓 {teacher.education}</p>
                {teacher.subjects && <p className="text-xs text-slate-700 font-semibold mt-1">📚 {teacher.subjects}</p>}
              </div>
            )) : (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 font-bold">
                No faculty members listed yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="max-w-4xl mx-auto">
            <div className="no-print bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-900">💳 My Payment History</h1>
                <p className="text-xs font-semibold text-slate-500">Click &ldquo;Slip / PDF&rdquo; to print or download your official money receipt</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Purpose</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Received By</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {myPayments.length > 0 ? myPayments.map((p: any, i: number) => (
                      <tr key={p.id || p.payment_id || i}>
                        <td className="p-4">{p.payment_date?.substring(0, 10)}</td>
                        <td className="p-4 font-bold">{p.payment_purpose}</td>
                        <td className="p-4 font-black text-emerald-600">{p.amount} ৳</td>
                        <td className="p-4 font-semibold text-blue-700">{p.received_by || "Admin"}</td>
                        <td className="p-4 text-center font-bold">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${p.payment_status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="px-3.5 py-1.5 bg-[#0a192f] hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                          >
                            📄 Slip / PDF
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedReceipt && (
              <div
                onClick={() => setSelectedReceipt(null)}
                className="fixed inset-0 z-50 bg-black/60 print:bg-white print:static flex items-center justify-center p-4 print:p-0"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-2xl print:rounded-none max-w-lg w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible p-6 shadow-2xl print:shadow-none border-2 border-slate-900"
                >
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="no-print absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 font-black flex items-center justify-center"
                    title="Close"
                  >
                    ✕
                  </button>

                  <div className="flex flex-col items-center text-center border-b-2 border-slate-900 pb-3 mb-4">
                    <img
                      src="/prottoy academy logo.png"
                      alt="Prottoy Academy Logo"
                      className="w-14 h-14 rounded-full object-cover border border-slate-300 mb-2"
                    />
                    <h2 className="text-xl font-black text-emerald-800 leading-tight">প্রত্যয় একাডেমি</h2>
                    <p className="text-xs font-black text-slate-700 tracking-wider uppercase">PROTTOY ACADEMY</p>
                    <p className="text-[11px] font-semibold text-slate-500">ভাবকী বাজার, মেলান্দহ, জামালপুর</p>
                    <span className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-full">
                      Official Money Receipt
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Receipt No:</span>
                      <span className="font-black">PA-{selectedReceipt.id || selectedReceipt.payment_id || "001"}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Date:</span>
                      <span className="font-bold">{selectedReceipt.payment_date?.substring(0, 10)}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Student Name:</span>
                      <span className="font-black">{safeName}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Student ID &amp; Class:</span>
                      <span className="font-bold">{studentData?.student_id || id} ({safeClass})</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Purpose:</span>
                      <span className="font-bold text-right">{selectedReceipt.payment_purpose}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Received By:</span>
                      <span className="font-bold text-blue-700">{selectedReceipt.received_by || "Admin"}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-bold">Status:</span>
                      <span className="font-black uppercase">{selectedReceipt.payment_status}</span>
                    </div>
                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-2">
                      <span className="font-black text-slate-800">Total Amount:</span>
                      <span className="text-xl font-black text-emerald-700">{selectedReceipt.amount} ৳</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-8 pt-3 text-xs font-bold text-slate-700">
                    <div className="border-t border-slate-900 pt-1 w-36 text-center">Student / Guardian</div>
                    <div className="border-t border-slate-900 pt-1 w-40 text-center">
                      {selectedReceipt.received_by || "Admin"}<br />
                      <span className="text-[10px] font-normal">Authorized Signature</span>
                    </div>
                  </div>

                  <div className="no-print flex gap-3 mt-5 pt-4 border-t">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm"
                    >
                      🖨️ Print / Save PDF
                    </button>
                    <button
                      onClick={() => setSelectedReceipt(null)}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                .no-print { display: none !important; }
                body { background: #ffffff !important; }
              }
            `}} />
          </div>
        )}

        {activeTab === "results" && (
          <div>
            <div className="no-print print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Academic Marksheet</h1>
                <p className="text-sm text-slate-500 font-semibold">Print your result easily</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {displayResults.length > 0 && (
                  <button onClick={() => window.print()} className="px-6 py-2.5 bg-[#0a192f] hover:bg-slate-800 text-white font-black rounded-xl shadow-md flex items-center gap-2 text-sm">
                    🖨️ Print Marksheet
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-10 print:space-y-0">
              {displayResults.length > 0 ? displayResults.map((res: any) => (
                <div key={res.id} className="marksheet-page relative overflow-hidden bg-white mx-auto max-w-[920px] p-6 md:p-8 border-[3px] border-black shadow-2xl print:shadow-none text-black">

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                    <img src="/prottoy academy logo.png" alt="Prottoy Academy Watermark" className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] object-contain opacity-[0.08] print:opacity-[0.10]" />
                  </div>

                  <div className="relative z-10">
                    <div className="border-b-2 border-black pb-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_90px_1fr] print:grid-cols-[1fr_80px_1fr] items-center gap-2 text-center">
                        <div className="text-center md:text-left print:text-left">
                          <h2 className="text-2xl font-black text-emerald-800 tracking-tight">প্রত্যয় একাডেমি</h2>
                          <p className="text-xs font-bold text-gray-800">ভাবকী বাজার, মেলান্দহ, জামালপুর</p>
                          <p className="text-[11px] font-semibold text-gray-700">স্থাপিতঃ ২০২৫ | একাডেমিক পোর্টাল</p>
                        </div>

                        <div className="flex justify-center my-1 md:my-0">
                          <Image
  src="/prottoy academy logo.png"
  alt="Logo"
  width={75}
  height={75}
  className="rounded-full border border-black object-cover bg-white"
/>
                        </div>

                        <div className="text-center md:text-right print:text-right">
                          <h2 className="text-xl font-black text-emerald-800 uppercase tracking-tight">PROTTOY ACADEMY</h2>
                          <p className="text-xs font-bold text-gray-800">Bhabki Bazar, Melandah, Jamalpur</p>
                          <p className="text-[11px] font-semibold text-gray-700">ESTD:- 2025 | Academic Portal</p>
                        </div>
                      </div>

                      <div className="text-center mt-2">
                        <span className="inline-block border-b-2 border-black px-8 pb-0.5 font-black text-sm uppercase tracking-wider">
                          Mark Sheet - {safeClass}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] print:grid-cols-[1fr_220px] gap-4 mb-3 items-start">
                      <div className="text-xs space-y-1.5 font-semibold">
                        <div className="w-20 h-20 border border-black bg-gray-100/80 flex items-center justify-center rounded mb-2 overflow-hidden">
                          {studentData?.profile_image ? (
                            <img src={studentData.profile_image} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">🧑‍🎓</span>
                          )}
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
                              <td className="border border-black p-1 font-bold">{sub.gp}</td>
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

                    <div className="mt-4 border-[1.5px] border-black bg-gray-50/70 px-4 py-2.5 rounded flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                      <span className="font-black uppercase tracking-wide whitespace-nowrap text-gray-900">
                        Remarks / Comment :
                      </span>
                      <span className={`font-bold italic ${res.grade === 'F' ? 'text-red-600' : 'text-emerald-900'}`}>
                        &ldquo;{res.remark}&rdquo;
                      </span>
                    </div>

                    <div className="flex justify-between items-end mt-12 pt-4 px-4 text-xs font-bold">
                      <div className="text-center border-t border-black pt-1 w-36">Guardian&apos;s Signature</div>
                      <div className="text-center border-t border-black pt-1 w-36">Class Teacher</div>
                      <div className="text-center border-t border-black pt-1 w-44">
                        Director / CEO<br />
                        <span className="text-[10px] font-normal">Prottoy Academy</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-3xl p-16 text-center border">
                  <p className="text-6xl mb-4">📭</p>
                  <h3 className="text-2xl font-black">No Exam Results Found</h3>
                  <p className="text-slate-500 mt-2">Any results published by the admin will appear here.</p>
                </div>
              )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                @page { size: A4 portrait; margin: 8mm; }
                html, body { height: auto !important; overflow: visible !important; background: #ffffff !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .no-print { display: none !important; }
                .marksheet-page { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 15px !important; border: 2px solid #000000 !important; box-shadow: none !important; page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: always; }
                .marksheet-page:last-child { page-break-after: auto; }
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
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center font-black text-xl text-blue-600 animate-pulse">Loading Portal...</div>}>
      <StudentContent/>
    </Suspense>
  );
}