"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  User,
  ClipboardCheck,
  BookOpen,
  Award,
  Bell,
  CreditCard,
  LogOut,
  ArrowLeft,
  Edit3,
  Save,
  X,
  ShieldCheck,
  Printer,
  FileText,
  ExternalLink,
  PlayCircle,
  GraduationCap,
  Upload,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useUI } from "../../components/UIProvider";

const getDynamicRemark = (grade: string, totalObtained: number, totalFull: number) => {
  const percentage = totalFull > 0 ? (totalObtained / totalFull) * 100 : 0;
  if (grade === "F") return "Unsatisfactory (Failed). Identify your weak areas, work hard, and prepare strongly for the next exam.";
  if (percentage >= 90) return "Outstanding Performance! Excellent result, keep up this brilliant spirit and carry on.";
  if (grade === "A+") return "Excellent Result! You have done a wonderful job. Carry on and aim even higher.";
  if (grade === "A") return "Very Good Performance! With a little more focus, you can easily achieve A+. Keep trying.";
  if (grade === "A-") return "Good Result! You have great potential. Study more attentively to reach the top grade.";
  if (grade === "B") return "Satisfactory. However, you need more regular practice and dedication to do better in the next exam.";
  if (grade === "C") return "Average Performance. Needs significant improvement and extra care in almost all subjects.";
  return "Below Average. You passed marginally. Work hard and consult your teachers regularly.";
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
  const { showToast, showConfirm } = useUI();
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
      showToast("ছবির সাইজ ৫ মেগাবাইটের (5MB) নিচে দিন।", "warning");
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
    reader.onerror = () => showToast("ছবিটি পড়তে সমস্যা হয়েছে। অন্য ছবি চেষ্টা করুন।", "error");
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

  const handleLogout = async () => {
    const ok = await showConfirm({
      title: "Sign Out?",
      message: "Are you sure you want to log out of your Student Portal?",
      confirmText: "Logout",
      variant: "danger",
    });
    if (ok) router.push("/");
  };

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
        showToast("প্রোফাইল সফলভাবে আপডেট হয়েছে!", "success");
        setIsEditing(false);
        setEditImage("");
        fetchMyData();
      } else showToast(result.message || "প্রোফাইল আপডেট ব্যর্থ হয়েছে।", "error");
    } catch (error) {
      showToast("সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।", "error");
    } finally {
      setUpdateMsg("");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return showToast("নতুন পাসওয়ার্ড লিখুন।", "warning");
    setPassUpdateLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_password', id: Number(id), newPassword: newPassword })
      });
      const result = await res.json();
      if (result.success) {
        showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "success");
        setNewPassword("");
      } else showToast("পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।", "error");
    } catch (err) {
      showToast("নেটওয়ার্ক সমস্যা হয়েছে।", "error");
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
  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all";

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-slate-600 font-semibold text-base">
        Loading your portal...
      </div>
    );
  }

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
        <div className="no-print print:hidden flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-200/80 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/prottoy academy logo.png"
              alt="Prottoy Academy"
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Student Portal</h2>
              <p className="text-xs font-medium text-slate-500">Prottoy Academy</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 px-4 rounded-xl border border-rose-200/60 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {activeTab !== "dashboard" && (
          <div className="no-print print:hidden mb-6">
            <button
              onClick={() => router.push("?tab=dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-7 md:p-10 overflow-hidden shadow-xl border border-slate-800">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 font-semibold text-xs mb-3">
                    <GraduationCap className="w-3.5 h-3.5" /> Academic Overview
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                    Welcome back, <span className="text-emerald-300">{safeName}</span>
                  </h1>
                  <p className="text-slate-400 text-sm md:text-base max-w-xl">
                    Track your academic progress, attendance, exam results, payments, and class materials in one place.
                  </p>
                </div>

                {/* Photo Card */}
                <div
                  onClick={() => router.push("?tab=profile")}
                  title="Open Profile"
                  className="relative w-40 h-48 md:w-44 md:h-52 rounded-2xl overflow-hidden border border-white/20 shadow-2xl cursor-pointer group shrink-0 bg-slate-800"
                >
                  {studentData?.profile_image ? (
                    <img
                      src={studentData.profile_image}
                      alt={safeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 text-emerald-300 flex items-center justify-center font-bold text-5xl">
                      {safeName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  <div className="absolute bottom-0 inset-x-0 p-3 text-center">
                    <p className="text-xs font-mono font-bold text-white tracking-wider">
                      ID: {studentData?.student_id || id}
                    </p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold">
                      {safeClass}{studentData?.student_group ? ` • ${studentData.student_group}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTICE CORNER PREVIEW */}
            {myNotices.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2 uppercase tracking-wider">
                    <Bell className="w-4 h-4 text-amber-600" /> Latest Notices
                  </h2>
                  <button
                    onClick={() => router.push("?tab=notices")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline"
                  >
                    View All ({myNotices.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {myNotices.slice(0, 2).map((n) => (
                    <div key={n.id} className="bg-white p-3.5 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mr-2">
                          {n.target_class === "All" ? "General" : n.target_class}
                        </span>
                        <span className="font-bold text-sm text-slate-900">{n.title}</span>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{n.content}</p>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0">
                        {n.created_at?.substring(0, 10)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DASHBOARD CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div onClick={() => router.push(`?tab=profile`)} className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Profile</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Details &amp; Edit <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div onClick={() => router.push(`?tab=attendance`)} className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Attendance</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  {totalAttDays > 0 ? `${attPercentage}% Present` : "Check Record"}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div onClick={() => router.push(`?tab=materials`)} className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Materials</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Notes &amp; HW ({myMaterials.length})
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div onClick={() => router.push(`?tab=results`)} className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all">
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Results</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Academic Marksheet
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div onClick={() => router.push(`?tab=notices`)} className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notice Corner</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  All Notices ({myNotices.length})
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div onClick={() => router.push(`?tab=payments`)} className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Payments</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  History &amp; Receipts
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Attendance Report</h1>
              <p className="text-xs text-slate-500 font-medium">Your daily class attendance summary</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Classes</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalAttDays}</p>
              </div>
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/70 text-center">
                <p className="text-xs font-semibold text-emerald-700 uppercase">Present</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{presentDays}</p>
              </div>
              <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200/70 text-center">
                <p className="text-xs font-semibold text-rose-600 uppercase">Absent</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{absentDays}</p>
              </div>
              <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-200/70 text-center">
                <p className="text-xs font-semibold text-blue-700 uppercase">Attendance %</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{attPercentage}%</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <table className="min-w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Marked By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttendance.length > 0 ? myAttendance.map((a: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-4 font-semibold text-slate-800">{a.attendance_date?.substring(0, 10)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.status === "Present" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-rose-50 text-rose-600 border border-rose-200/60"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{a.marked_by || "Teacher"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-400 font-medium">No attendance records yet.</td></tr>
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
                <h1 className="text-2xl font-bold text-slate-900">Class Materials &amp; Homework</h1>
                <p className="text-xs text-slate-500 font-medium">Notes, PDFs, and Homework for {safeClass}</p>
              </div>
              <a
                href="https://www.youtube.com/@DreamUpAcademy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
              >
                <PlayCircle className="w-4 h-4" /> YouTube Lectures
              </a>
            </div>

            {myMaterials.length > 0 ? (
              <div className="space-y-3">
                {myMaterials.map((m: any) => (
                  <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">{m.material_type}</span>
                        <span className="text-xs font-medium text-slate-500">{m.subject_name} • By {m.faculty_name}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                      {m.description && <p className="text-sm text-slate-600 mt-1">{m.description}</p>}
                      <p className="text-[11px] text-slate-400 font-medium mt-2">{m.created_at?.substring(0, 10)}</p>
                    </div>
                    {m.link_url && (
                      <a
                        href={m.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-slate-400 font-medium text-sm">
                No class materials uploaded for {safeClass} yet.
              </div>
            )}
          </div>
        )}

        {/* NOTICE CORNER TAB */}
        {activeTab === "notices" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notice Corner</h1>
              <p className="text-xs text-slate-500 font-medium">Official announcements from Prottoy Academy</p>
            </div>
            {myNotices.length > 0 ? (
              <div className="space-y-3">
                {myNotices.map((n: any) => (
                  <div key={n.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                        {n.target_class === "All" ? "General Notice" : `${n.target_class} Notice`}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{n.created_at?.substring(0, 10)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{n.title}</h3>
                    <p className="text-slate-600 mt-1.5 whitespace-pre-line text-sm leading-relaxed">{n.content}</p>
                    <p className="text-xs font-medium text-slate-400 mt-3">Posted by: {n.posted_by}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-slate-400 font-medium text-sm">
                No notices available right now.
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && studentData && (
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
                <p className="text-xs text-slate-500 font-medium">View or update your personal information</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Details
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                    {studentData.profile_image ? (
                      <img src={studentData.profile_image} alt={safeName} className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-2xl">
                        {safeName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{safeName}</h2>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{safeClass} {studentData.student_group ? `• ${studentData.student_group}` : ""}</p>
                      <p className="text-xs font-mono font-medium text-slate-500 mt-1">Student ID: {studentData.student_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500 font-medium">Full Name</span><span className="font-bold text-slate-900">{safeName}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500 font-medium">Father&apos;s Name</span><span className="font-semibold text-slate-800">{studentData.fathers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500 font-medium">Mother&apos;s Name</span><span className="font-semibold text-slate-800">{studentData.mothers_name || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500 font-medium">Class</span><span className="text-blue-600 font-bold">{safeClass}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] border-b border-slate-100 pb-3 text-sm"><span className="text-slate-500 font-medium">Phone Number</span><span className="font-semibold text-slate-800">{studentData.phone_number || studentData.phone || "Not provided"}</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] text-sm"><span className="text-slate-500 font-medium">Address</span><span className="font-semibold text-slate-800">{studentData.address || "Not provided"}</span></div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Change Login Password
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                      <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" className={inputClass} />
                      <button onClick={handlePasswordChange} disabled={passUpdateLoading} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors shrink-0">
                        {passUpdateLoading ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    {editImage || studentData.profile_image ? (
                      <img src={editImage || studentData.profile_image} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                        <Upload className="w-6 h-6" />
                      </div>
                    )}
                    <div className="w-full">
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Change Profile Picture</label>
                      <input type="file" accept="image/*" onChange={handleStudentImageSelect} className="text-xs w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name *</label>
                    <input type="text" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Father&apos;s Name</label>
                      <input type="text" value={editForm.fathersName} onChange={e => setEditForm({ ...editForm, fathersName: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mother&apos;s Name</label>
                      <input type="text" value={editForm.mothersName} onChange={e => setEditForm({ ...editForm, mothersName: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                      <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="017XXXXXXXX" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Address</label>
                      <input type="text" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={!!updateMsg} className="inline-flex items-center justify-center gap-2 flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors">
                      <Save className="w-4 h-4" /> {updateMsg || "Save Changes"}
                    </button>
                    <button type="button" onClick={() => { setIsEditing(false); setEditImage(""); }} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* FACULTY TAB */}
        {activeTab === "faculty" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {faculties.length > 0 ? faculties.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 p-4">
                <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full aspect-square object-cover rounded-xl mb-3 border border-slate-100" />
                <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                <p className="text-blue-600 font-semibold text-xs uppercase tracking-wider mb-2">{teacher.designation}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 shrink-0" /> {teacher.education}</p>
                {teacher.subjects && <p className="text-xs text-slate-700 font-medium mt-1 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 shrink-0" /> {teacher.subjects}</p>}
              </div>
            )) : (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200/80 text-slate-400 font-medium text-sm">
                No faculty members listed yet.
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <div className="max-w-4xl mx-auto">
            <div className="no-print bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h1 className="text-xl font-bold text-slate-900">My Payment History</h1>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Click &ldquo;Slip / PDF&rdquo; to print or download your official money receipt</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Purpose</th>
                      <th className="p-4 font-semibold">Amount</th>
                      <th className="p-4 font-semibold">Received By</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-center">Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPayments.length > 0 ? myPayments.map((p: any, i: number) => (
                      <tr key={p.id || p.payment_id || i} className="hover:bg-slate-50/70">
                        <td className="p-4 text-xs font-medium text-slate-600">{p.payment_date?.substring(0, 10)}</td>
                        <td className="p-4 font-semibold text-slate-800">{p.payment_purpose}</td>
                        <td className="p-4 font-bold text-emerald-600">{p.amount} ৳</td>
                        <td className="p-4 font-medium text-blue-700">{p.received_by || "Admin"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.payment_status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-amber-50 text-amber-700 border border-amber-200/60"}`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs"
                          >
                            <FileText className="w-3.5 h-3.5" /> Slip / PDF
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedReceipt && (
              <div
                onClick={() => setSelectedReceipt(null)}
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm print:bg-white print:static flex items-center justify-center p-4 print:p-0"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative bg-white rounded-3xl print:rounded-none max-w-lg w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible p-6 shadow-2xl print:shadow-none border-2 border-slate-900"
                >
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="no-print absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 flex items-center justify-center transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center text-center border-b-2 border-slate-900 pb-3 mb-4">
                    <img
                      src="/prottoy academy logo.png"
                      alt="Prottoy Academy Logo"
                      className="w-14 h-14 rounded-full object-cover border border-slate-300 mb-2"
                    />
                    <h2 className="text-xl font-black text-emerald-800 leading-tight">প্রত্যয় একাডেমি</h2>
                    <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">PROTTOY ACADEMY</p>
                    <p className="text-[11px] font-medium text-slate-500">ভাবকী বাজার, মেলান্দহ, জামালপুর</p>
                    <span className="inline-block mt-2 px-4 py-0.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full">
                      Official Money Receipt
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Receipt No:</span>
                      <span className="font-bold font-mono">PA-{selectedReceipt.id || selectedReceipt.payment_id || "001"}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Date:</span>
                      <span className="font-semibold">{selectedReceipt.payment_date?.substring(0, 10)}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Student Name:</span>
                      <span className="font-bold">{safeName}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Student ID &amp; Class:</span>
                      <span className="font-semibold">{studentData?.student_id || id} ({safeClass})</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Purpose:</span>
                      <span className="font-semibold text-right">{selectedReceipt.payment_purpose}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Received By:</span>
                      <span className="font-semibold text-blue-700">{selectedReceipt.received_by || "Admin"}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed pb-1.5">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <span className="font-bold uppercase">{selectedReceipt.payment_status}</span>
                    </div>
                    <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-2">
                      <span className="font-bold text-slate-800">Total Amount:</span>
                      <span className="text-xl font-black text-emerald-700">{selectedReceipt.amount} ৳</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-8 pt-3 text-xs font-semibold text-slate-700">
                    <div className="border-t border-slate-900 pt-1 w-36 text-center">Student / Guardian</div>
                    <div className="border-t border-slate-900 pt-1 w-40 text-center">
                      {selectedReceipt.received_by || "Admin"}<br />
                      <span className="text-[10px] font-normal">Authorized Signature</span>
                    </div>
                  </div>

                  <div className="no-print flex gap-3 mt-5 pt-4 border-t">
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm"
                    >
                      <Printer className="w-4 h-4" /> Print / Save PDF
                    </button>
                    <button
                      onClick={() => setSelectedReceipt(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-sm"
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

        {/* RESULTS TAB */}
        {activeTab === "results" && (
          <div>
            <div className="no-print print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Academic Marksheet</h1>
                <p className="text-xs text-slate-500 font-medium">Print or save your official exam transcript</p>
              </div>
              {displayResults.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm text-sm"
                >
                  <Printer className="w-4 h-4" /> Print Marksheet
                </button>
              )}
            </div>

            <div className="space-y-10 print:space-y-0">
              {displayResults.length > 0 ? displayResults.map((res: any) => (
                <div key={res.id} className="marksheet-page relative overflow-hidden bg-white mx-auto max-w-[920px] p-6 md:p-8 border-[3px] border-black shadow-xl print:shadow-none text-black">

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
                            <User className="w-8 h-8 text-gray-500" />
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
                <div className="bg-white rounded-3xl p-14 text-center border border-slate-200/80">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No Exam Results Found</h3>
                  <p className="text-slate-500 text-sm mt-1">Any results published by the admin will appear here.</p>
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
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center font-semibold text-base text-slate-600">Loading Portal...</div>}>
      <StudentContent />
    </Suspense>
  );
}