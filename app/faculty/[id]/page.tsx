"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  BookOpen,
  FileSpreadsheet,
  Bell,
  LogOut,
  ArrowLeft,
  Save,
  Trash2,
  ShieldCheck,
  GraduationCap,
  Send,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  Plus,
} from "lucide-react";
import { useUI } from "../../components/UIProvider";

export default function FacultyDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast, showConfirm } = useUI();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [faculty, setFaculty] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Attendance States
  const [attClass, setAttClass] = useState("");
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attStatus, setAttStatus] = useState<Record<string, string>>({});
  const [attSaving, setAttSaving] = useState(false);

  // Materials States
  const [myMaterials, setMyMaterials] = useState<any[]>([]);
  const [matClass, setMatClass] = useState("");
  const [matSubject, setMatSubject] = useState("");
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState("Note");
  const [matLink, setMatLink] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matSaving, setMatSaving] = useState(false);

  // Marks Input States
  const [markClass, setMarkClass] = useState("");
  const [markSubject, setMarkSubject] = useState("");
  const [examName, setExamName] = useState("");
  const [fullMarks, setFullMarks] = useState("100");
  const [marksMap, setMarksMap] = useState<Record<string, { cq: string; mcq: string; pr: string }>>({});
  const [markSaving, setMarkSaving] = useState(false);

  // Notices States
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeClass, setNoticeClass] = useState("");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeSaving, setNoticeSaving] = useState(false);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const assignedClasses = Array.from(new Set(assignments.map((a) => a.class_name)));
  const getSubjectsForClass = (cls: string) =>
    assignments.filter((a) => a.class_name === cls).map((a) => a.subject_name);

  const fetchInitialData = async () => {
    try {
      const [facRes, assignRes, stuRes, matRes, notRes] = await Promise.all([
        fetch(`/api/faculty?t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/faculty-assignments?facultyId=${id}&t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/students?t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/materials?facultyId=${id}&t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/notices?t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const facData = await facRes.json();
      if (facData.success && Array.isArray(facData.data)) {
        const me = facData.data.find((f: any) => String(f.id) === String(id));
        if (me) setFaculty(me);
      }

      const assignData = await assignRes.json();
      if (assignData.success && Array.isArray(assignData.data)) {
        setAssignments(assignData.data);
      }

      const stuData = await stuRes.json();
      if (stuData.success && Array.isArray(stuData.data)) {
        setAllStudents(stuData.data);
      }

      const matData = await matRes.json();
      if (matData.success && Array.isArray(matData.data)) {
        setMyMaterials(matData.data);
      }

      const notData = await notRes.json();
      if (notData.success && Array.isArray(notData.data)) {
        setNotices(notData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchInitialData();
  }, [id]);

  // Load existing attendance when class or date changes
  useEffect(() => {
    const loadAttendance = async () => {
      if (!attClass || !attDate) return;
      const classStudents = allStudents.filter((s) => s.class_name === attClass);
      const initialMap: Record<string, string> = {};
      classStudents.forEach((s) => {
        initialMap[String(s.student_id || s.id)] = "Present";
      });

      try {
        const res = await fetch(
          `/api/attendance?className=${encodeURIComponent(attClass)}&date=${attDate}&t=${Date.now()}`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          data.data.forEach((row: any) => {
            initialMap[String(row.student_id)] = row.status;
          });
        }
      } catch (e) {}
      setAttStatus(initialMap);
    };
    loadAttendance();
  }, [attClass, attDate, allStudents]);

  const handleLogout = async () => {
    const ok = await showConfirm({
      title: "Sign Out?",
      message: "Are you sure you want to log out of the Faculty Portal?",
      confirmText: "Logout",
      variant: "danger",
    });
    if (ok) router.push("/");
  };

  const handleSaveAttendance = async () => {
    if (!attClass || !attDate) return showToast("Class এবং Date নির্বাচন করুন।", "warning");
    const classStudents = allStudents.filter((s) => s.class_name === attClass);
    if (classStudents.length === 0) return showToast("এই ক্লাসে কোনো স্টুডেন্ট পাওয়া যায়নি।", "warning");

    setAttSaving(true);
    try {
      const records = classStudents.map((s) => {
        const sid = s.student_id || s.id;
        return { student_id: sid, status: attStatus[String(sid)] || "Present" };
      });

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records,
          className: attClass,
          date: attDate,
          markedBy: faculty?.name || "Faculty",
        }),
      });
      const result = await res.json();
      if (result.success) showToast("অ্যাটেনডেন্স সফলভাবে সেভ হয়েছে!", "success");
      else showToast(result.message || "অ্যাটেনডেন্স সেভ ব্যর্থ হয়েছে।", "error");
    } catch (e) {
      showToast("অ্যাটেনডেন্স সেভ করতে নেটওয়ার্ক সমস্যা হয়েছে।", "error");
    } finally {
      setAttSaving(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matClass || !matSubject || !matTitle) {
      return showToast("Class, Subject এবং Title আবশ্যক।", "warning");
    }
    setMatSaving(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyId: Number(id),
          facultyName: faculty?.name || "Faculty",
          className: matClass,
          subjectName: matSubject,
          title: matTitle,
          materialType: matType,
          linkUrl: matLink,
          description: matDesc,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("ক্লাস ম্যাটেরিয়াল সফলভাবে পাবলিশ হয়েছে!", "success");
        setMatTitle("");
        setMatLink("");
        setMatDesc("");
        fetchInitialData();
      } else showToast(result.message || "ম্যাটেরিয়াল পাবলিশ ব্যর্থ হয়েছে।", "error");
    } catch (e) {
      showToast("ম্যাটেরিয়াল পাবলিশে সমস্যা হয়েছে।", "error");
    } finally {
      setMatSaving(false);
    }
  };

  const handleDeleteMaterial = async (matId: number) => {
    const ok = await showConfirm({
      title: "Delete Material?",
      message: "Are you sure you want to permanently remove this class material?",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/materials?id=${matId}`, { method: "DELETE" });
    showToast("ম্যাটেরিয়াল ডিলিট হয়েছে।", "success");
    fetchInitialData();
  };

  const handleSaveMarks = async () => {
    if (!markClass || !markSubject || !examName) {
      return showToast("Class, Subject এবং Exam Name আবশ্যক।", "warning");
    }
    const classStudents = allStudents.filter((s) => s.class_name === markClass);
    if (classStudents.length === 0) return showToast("এই ক্লাসে কোনো স্টুডেন্ট নেই।", "warning");

    const fMarks = Number(fullMarks || 100);
    const payloadMarks: Record<string, any> = {};
    let highestMark = 0;

    for (const stu of classStudents) {
      const sid = String(stu.student_id || stu.id);
      const m = marksMap[sid];
      if (!m || (m.cq === "" && m.mcq === "" && m.pr === "")) continue;

      const cq = Number(m.cq || 0);
      const mcq = Number(m.mcq || 0);
      const pr = Number(m.pr || 0);
      const total = cq + mcq + pr;

      if (total > fMarks) {
        return showToast(
          `${stu.full_name}-এর মোট মার্কস (${total}) Full Marks (${fMarks})-এর বেশি হতে পারবে না।`,
          "warning"
        );
      }

      if (total > highestMark) highestMark = total;

      const pct = fMarks > 0 ? (total / fMarks) * 100 : 0;
      let grade = "F";
      if (pct >= 80) grade = "A+";
      else if (pct >= 70) grade = "A";
      else if (pct >= 60) grade = "A-";
      else if (pct >= 50) grade = "B";
      else if (pct >= 40) grade = "C";
      else if (pct >= 33) grade = "D";

      payloadMarks[sid] = {
        cq: m.cq === "" ? "" : String(cq),
        mcq: m.mcq === "" ? "" : String(mcq),
        pr: m.pr === "" ? "" : String(pr),
        total: String(total),
        grade,
      };
    }

    if (Object.keys(payloadMarks).length === 0) {
      return showToast("অন্তত একজন স্টুডেন্টের মার্কস ইনপুট দিন।", "warning");
    }

    setMarkSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_name: examName.trim(),
          class_name: markClass,
          subject_name: markSubject,
          full_marks: fMarks,
          highest_marks: highestMark,
          marks_data: payloadMarks,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(result.message || "মার্কস সফলভাবে পাবলিশ হয়েছে!", "success");
        setMarksMap({});
      } else {
        showToast(result.message || "মার্কস সেভ ব্যর্থ হয়েছে।", "error");
      }
    } catch (e) {
      showToast("মার্কস সেভ করতে নেটওয়ার্ক সমস্যা হয়েছে।", "error");
    } finally {
      setMarkSaving(false);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeClass || !noticeTitle || !noticeContent) {
      return showToast("Target Class, Title এবং Notice Details আবশ্যক।", "warning");
    }
    setNoticeSaving(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          targetClass: noticeClass,
          postedBy: faculty?.name || "Faculty",
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("ক্লাস নোটিশ সফলভাবে পাবলিশ হয়েছে!", "success");
        setNoticeTitle("");
        setNoticeContent("");
        fetchInitialData();
      } else showToast(result.message || "নোটিশ পাবলিশ ব্যর্থ হয়েছে।", "error");
    } catch (e) {
      showToast("নোটিশ পাবলিশে সমস্যা হয়েছে।", "error");
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    const ok = await showConfirm({
      title: "Delete Class Notice?",
      message: "This notice will be permanently removed from student portals.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    await fetch(`/api/notices?id=${noticeId}`, { method: "DELETE" });
    showToast("নোটিশ ডিলিট হয়েছে।", "success");
    fetchInitialData();
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return showToast("নতুন পাসওয়ার্ড লিখুন।", "warning");
    if (!faculty?.user_id) return showToast("ইউজার অ্যাকাউন্ট লিঙ্ক করা নেই।", "error");
    setPassLoading(true);
    try {
      const res = await fetch("/api/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_password",
          userId: faculty.user_id,
          newPassword,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!", "success");
        setNewPassword("");
      } else showToast(result.message || "পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে।", "error");
    } catch (e) {
      showToast("পাসওয়ার্ড আপডেটে সমস্যা হয়েছে।", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all";

  const tableNumberBoxClass =
    "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none text-center font-bold text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-slate-600 font-semibold text-base">
        Loading Faculty Portal...
      </div>
    );
  }

  const attStudents = allStudents.filter((s) => s.class_name === attClass);
  const markStudents = allStudents.filter((s) => s.class_name === markClass);
  const myPostedNotices = notices.filter((n) => n.posted_by === faculty?.name);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* TOP HEADER */}
        <div className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-200/80 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/prottoy academy logo.png"
              alt="Prottoy Academy"
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Faculty Portal</h2>
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
          <div className="mb-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        )}

        {/* DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white rounded-3xl p-7 md:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 font-semibold text-xs mb-3">
                  <GraduationCap className="w-3.5 h-3.5" /> Instructor Workspace
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  Welcome, <span className="text-emerald-300">{faculty?.name || "Teacher"}</span>
                </h1>
                <p className="text-slate-300 text-sm font-medium mb-4">
                  {faculty?.designation} {faculty?.education ? `• ${faculty.education}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignments.length > 0 ? (
                    assignments.map((a) => (
                      <span
                        key={a.id}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-emerald-200"
                      >
                        {a.class_name} • {a.subject_name}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-semibold text-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" /> No classes assigned yet. Contact Admin.
                    </span>
                  )}
                </div>
              </div>

              {faculty?.image ? (
                <img
                  src={faculty.image}
                  alt={faculty.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border border-white/20 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-800 border border-white/10 text-emerald-300 flex items-center justify-center font-bold text-4xl shrink-0">
                  {(faculty?.name || "T").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab("attendance")}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Attendance <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("materials")}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes &amp; HW</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Materials ({myMaterials.length}) <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("marks")}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Examination</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Marks Input <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>

              <div
                onClick={() => setActiveTab("notices")}
                className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Announce</p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center justify-between">
                  Class Notice <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
            </div>

            {/* Password Change Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm max-w-lg">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Change Login Password
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={inputClass}
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={passLoading}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shrink-0 transition-colors"
                >
                  {passLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Daily Class Attendance</h1>
                <p className="text-xs text-slate-500 font-medium">Mark present or absent for your assigned classes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Assigned Class *</label>
                <select value={attClass} onChange={(e) => setAttClass(e.target.value)} className={inputClass}>
                  <option value="">-- Select Class --</option>
                  {assignedClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Date *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>

            {attClass && (
              <div>
                {attStudents.length > 0 ? (
                  <>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-2xl mb-6">
                      <table className="min-w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                          <tr>
                            <th className="p-4 font-semibold">Student ID</th>
                            <th className="p-4 font-semibold">Student Name</th>
                            <th className="p-4 font-semibold text-center">Attendance Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {attStudents.map((stu) => {
                            const sid = String(stu.student_id || stu.id);
                            const st = attStatus[sid] || "Present";
                            return (
                              <tr key={sid} className="hover:bg-slate-50/70">
                                <td className="p-4 font-mono text-xs font-semibold text-slate-600">{sid}</td>
                                <td className="p-4 font-semibold text-slate-900">{stu.full_name}</td>
                                <td className="p-4 text-center">
                                  <div className="inline-flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setAttStatus({ ...attStatus, [sid]: "Present" })}
                                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        st === "Present"
                                          ? "bg-emerald-600 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      }`}
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAttStatus({ ...attStatus, [sid]: "Absent" })}
                                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        st === "Absent"
                                          ? "bg-rose-600 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      }`}
                                    >
                                      <XCircle className="w-3.5 h-3.5" /> Absent
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={attSaving}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {attSaving ? "Saving Attendance..." : "Save Attendance"}
                    </button>
                  </>
                ) : (
                  <p className="text-slate-400 font-medium text-sm text-center py-10">
                    No students found in {attClass}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CLASS MATERIALS TAB */}
        {activeTab === "materials" && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddMaterial}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Publish Class Material / Homework</h1>
                  <p className="text-xs text-slate-500 font-medium">Share notes, PDFs, homework, or video links with your class</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Class *</label>
                  <select
                    value={matClass}
                    onChange={(e) => { setMatClass(e.target.value); setMatSubject(""); }}
                    className={inputClass}
                    required
                  >
                    <option value="">-- Select Class --</option>
                    {assignedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Subject *</label>
                  <select
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value)}
                    className={inputClass}
                    required
                    disabled={!matClass}
                  >
                    <option value="">-- Select Subject --</option>
                    {getSubjectsForClass(matClass).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Type</label>
                  <select value={matType} onChange={(e) => setMatType(e.target.value)} className={inputClass}>
                    <option value="Note">Note / PDF</option>
                    <option value="Homework">Homework</option>
                    <option value="Video Link">Video Lecture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    placeholder="e.g. Chapter 3 Formula Sheet"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Drive / YouTube Link (Optional)</label>
                  <input
                    type="url"
                    value={matLink}
                    onChange={(e) => setMatLink(e.target.value)}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Write details or homework instructions..."
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={matSaving}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" />
                {matSaving ? "Publishing..." : "Publish Material"}
              </button>
            </form>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">My Published Materials ({myMaterials.length})</h2>
              {myMaterials.length > 0 ? (
                <div className="space-y-3">
                  {myMaterials.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50/50"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                            {m.material_type}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {m.class_name} • {m.subject_name}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900">{m.title}</h3>
                        {m.description && <p className="text-xs text-slate-600 mt-0.5">{m.description}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {m.link_url && (
                          <a
                            href={m.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Link
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-semibold text-xs rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-medium text-sm text-center py-8">No materials published yet.</p>
              )}
            </div>
          </div>
        )}

        {/* EXAM MARKS INPUT TAB */}
        {activeTab === "marks" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Exam Marks Input</h1>
                <p className="text-xs text-slate-500 font-medium">Enter CQ, MCQ, and Practical marks for your assigned subjects</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Class *</label>
                <select
                  value={markClass}
                  onChange={(e) => { setMarkClass(e.target.value); setMarkSubject(""); }}
                  className={inputClass}
                >
                  <option value="">-- Select Class --</option>
                  {assignedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Subject *</label>
                <select
                  value={markSubject}
                  onChange={(e) => setMarkSubject(e.target.value)}
                  className={inputClass}
                  disabled={!markClass}
                >
                  <option value="">-- Select Subject --</option>
                  {getSubjectsForClass(markClass).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Exam Name *</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. Monthly Test"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Marks</label>
                <input
                  type="number"
                  value={fullMarks}
                  onChange={(e) => setFullMarks(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {markClass && markSubject && (
              <div>
                {markStudents.length > 0 ? (
                  <>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-2xl mb-6">
                      <table className="min-w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                          <tr>
                            <th className="p-4 font-semibold">Student</th>
                            <th className="p-4 font-semibold w-28 text-center">CQ</th>
                            <th className="p-4 font-semibold w-28 text-center">MCQ</th>
                            <th className="p-4 font-semibold w-28 text-center">PR</th>
                            <th className="p-4 font-semibold w-24 text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {markStudents.map((stu) => {
                            const sid = String(stu.student_id || stu.id);
                            const m = marksMap[sid] || { cq: "", mcq: "", pr: "" };
                            const hasAny = m.cq !== "" || m.mcq !== "" || m.pr !== "";
                            const total = Number(m.cq || 0) + Number(m.mcq || 0) + Number(m.pr || 0);
                            return (
                              <tr key={sid} className="hover:bg-slate-50/70">
                                <td className="p-4">
                                  <p className="font-semibold text-slate-900">{stu.full_name}</p>
                                  <p className="text-xs font-mono text-slate-500">ID: {sid}</p>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={m.cq}
                                    onChange={(e) => setMarksMap({ ...marksMap, [sid]: { ...m, cq: e.target.value } })}
                                    className={tableNumberBoxClass}
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={m.mcq}
                                    onChange={(e) => setMarksMap({ ...marksMap, [sid]: { ...m, mcq: e.target.value } })}
                                    className={tableNumberBoxClass}
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={m.pr}
                                    onChange={(e) => setMarksMap({ ...marksMap, [sid]: { ...m, pr: e.target.value } })}
                                    className={tableNumberBoxClass}
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <span className="inline-block w-full py-2 rounded-lg bg-slate-50 border border-slate-200 font-bold text-slate-800">
                                    {hasAny ? total : "-"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={markSaving}
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {markSaving ? "Saving Marks..." : "Submit Marks"}
                    </button>
                  </>
                ) : (
                  <p className="text-slate-400 font-medium text-sm text-center py-10">
                    No students found in {markClass}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CLASS NOTICE TAB */}
        {activeTab === "notices" && (
          <div className="space-y-6">
            <form
              onSubmit={handlePostNotice}
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Post Class Notice</h1>
                  <p className="text-xs text-slate-500 font-medium">Send announcements directly to your assigned classes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Target Class *</label>
                  <select value={noticeClass} onChange={(e) => setNoticeClass(e.target.value)} className={inputClass} required>
                    <option value="">-- Select Assigned Class --</option>
                    {assignedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Notice Title *</label>
                  <input
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Tomorrow's Class Test"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Notice Details *</label>
                <textarea
                  rows={3}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Write notice details..."
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={noticeSaving}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {noticeSaving ? "Publishing..." : "Publish Notice"}
              </button>
            </form>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">My Posted Notices ({myPostedNotices.length})</h2>
              {myPostedNotices.length > 0 ? (
                <div className="space-y-3">
                  {myPostedNotices.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl border border-slate-200/80 flex justify-between items-start gap-4 hover:bg-slate-50/50"
                    >
                      <div>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                          {n.target_class}
                        </span>
                        <h3 className="font-bold text-slate-900 mt-1.5">{n.title}</h3>
                        <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{n.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteNotice(n.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-semibold text-xs rounded-lg shrink-0 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-medium text-sm text-center py-8">No notices posted yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}