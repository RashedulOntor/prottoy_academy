"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FacultyDashboard() {
  const { id } = useParams();
  const router = useRouter();

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
        const res = await fetch(`/api/attendance?className=${encodeURIComponent(attClass)}&date=${attDate}&t=${Date.now()}`);
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

  const handleSaveAttendance = async () => {
    if (!attClass || !attDate) return alert("⚠️ Select Class and Date!");
    const classStudents = allStudents.filter((s) => s.class_name === attClass);
    if (classStudents.length === 0) return alert("⚠️ No students found in this class!");

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
      if (result.success) alert("✅ Attendance saved successfully!");
      else alert("❌ " + result.message);
    } catch (e) {
      alert("❌ Failed to save attendance.");
    } finally {
      setAttSaving(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matClass || !matSubject || !matTitle) return alert("⚠️ Class, Subject, and Title are required!");
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
        alert("✅ Material published!");
        setMatTitle("");
        setMatLink("");
        setMatDesc("");
        fetchInitialData();
      } else alert("❌ " + result.message);
    } catch (e) {
      alert("❌ Error publishing material.");
    } finally {
      setMatSaving(false);
    }
  };

  const handleDeleteMaterial = async (matId: number) => {
    if (!confirm("Delete this material?")) return;
    await fetch(`/api/materials?id=${matId}`, { method: "DELETE" });
    fetchInitialData();
  };

  const handleSaveMarks = async () => {
    if (!markClass || !markSubject || !examName) {
      return alert("⚠️ Select Class, Subject, and enter Exam Name!");
    }
    const classStudents = allStudents.filter((s) => s.class_name === markClass);
    if (classStudents.length === 0) return alert("⚠️ No students in this class!");

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
        return alert(`⚠️ ${stu.full_name}-এর মোট মার্কস (${total}) Full Marks (${fMarks})-এর বেশি হতে পারবে না!`);
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
      return alert("⚠️ অন্তত একজন স্টুডেন্টের মার্কস ইনপুট দিন।");
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
        alert("✅ " + (result.message || "Marks published successfully!"));
        setMarksMap({});
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (e) {
      alert("❌ Error saving marks.");
    } finally {
      setMarkSaving(false);
    }
  };

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeClass || !noticeTitle || !noticeContent) {
      return alert("⚠️ Select Class, Title, and Notice Content!");
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
        alert("✅ Class notice published!");
        setNoticeTitle("");
        setNoticeContent("");
        fetchInitialData();
      } else alert("❌ " + result.message);
    } catch (e) {
      alert("❌ Failed to publish notice.");
    } finally {
      setNoticeSaving(false);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    if (!confirm("Delete this notice?")) return;
    await fetch(`/api/notices?id=${noticeId}`, { method: "DELETE" });
    fetchInitialData();
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return alert("⚠️ Enter a new password!");
    if (!faculty?.user_id) return alert("❌ User account not linked!");
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
        alert("✅ Password updated successfully!");
        setNewPassword("");
      } else alert("❌ " + result.message);
    } catch (e) {
      alert("❌ Error updating password.");
    } finally {
      setPassLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold shadow-sm outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f8fafc] text-blue-600 font-bold text-xl">
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
        <div className="flex justify-between items-center bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">Faculty Portal</h2>
            <p className="text-xs md:text-sm font-semibold text-slate-500">Prottoy Academy</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-5 rounded-xl border border-red-100 text-sm"
          >
            🚪 Logout
          </button>
        </div>

        {activeTab !== "dashboard" && (
          <button
            onClick={() => setActiveTab("dashboard")}
            className="mb-6 px-6 py-3 bg-[#0f172a] text-white hover:bg-slate-800 font-bold rounded-xl shadow-md"
          >
            ⬅ Back to Dashboard
          </button>
        )}

        {/* DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div>
            <div className="bg-[#0a192f] text-white rounded-[2rem] p-8 md:p-10 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-emerald-400 font-bold tracking-widest text-xs uppercase mb-2">
                  Instructor Dashboard
                </p>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  Welcome, <span className="text-emerald-300">{faculty?.name || "Teacher"}</span>
                </h1>
                <p className="text-slate-300 text-sm font-semibold mb-4">
                  {faculty?.designation} {faculty?.education ? `• ${faculty.education}` : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignments.length > 0 ? (
                    assignments.map((a) => (
                      <span
                        key={a.id}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-emerald-200"
                      >
                        {a.class_name} • {a.subject_name}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-200">
                      ⚠️ No classes assigned yet. Contact Admin.
                    </span>
                  )}
                </div>
              </div>

              {faculty?.image ? (
                <img
                  src={faculty.image}
                  alt={faculty.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-3xl object-cover border-2 border-white/20 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-slate-800 text-emerald-300 flex items-center justify-center font-black text-4xl shrink-0">
                  {(faculty?.name || "T").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div
                onClick={() => setActiveTab("attendance")}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl mb-5">📋</div>
                <h3 className="text-slate-500 font-bold text-xs uppercase mb-1">Daily</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Attendance <span>➔</span></p>
              </div>

              <div
                onClick={() => setActiveTab("materials")}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl mb-5">📚</div>
                <h3 className="text-slate-500 font-bold text-xs uppercase mb-1">Notes &amp; HW</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Materials <span>➔</span></p>
              </div>

              <div
                onClick={() => setActiveTab("marks")}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-5">📝</div>
                <h3 className="text-slate-500 font-bold text-xs uppercase mb-1">Exam</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Marks Input <span>➔</span></p>
              </div>

              <div
                onClick={() => setActiveTab("notices")}
                className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-5">📢</div>
                <h3 className="text-slate-500 font-bold text-xs uppercase mb-1">Announce</h3>
                <p className="text-xl font-black text-slate-800 flex justify-between">Class Notice <span>➔</span></p>
              </div>
            </div>

            {/* Password Change Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-lg">
              <h3 className="text-lg font-black text-slate-800 mb-3">🛡️ Change Login Password</h3>
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
                  className="px-6 py-3 bg-[#0a192f] hover:bg-slate-800 text-white font-bold rounded-xl shrink-0"
                >
                  {passLoading ? "..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black mb-6">📋 Daily Class Attendance</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Class</label>
                <select value={attClass} onChange={(e) => setAttClass(e.target.value)} className={inputClass}>
                  <option value="">Select Class</option>
                  {assignedClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            {attClass && (
              <div>
                {attStudents.length > 0 ? (
                  <>
                    <div className="overflow-x-auto border rounded-2xl mb-6">
                      <table className="min-w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                          <tr>
                            <th className="p-4">Student ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {attStudents.map((stu) => {
                            const sid = String(stu.student_id || stu.id);
                            const st = attStatus[sid] || "Present";
                            return (
                              <tr key={sid}>
                                <td className="p-4 font-bold text-slate-600">{sid}</td>
                                <td className="p-4 font-black">{stu.full_name}</td>
                                <td className="p-4 text-center">
                                  <div className="inline-flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setAttStatus({ ...attStatus, [sid]: "Present" })}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-black ${
                                        st === "Present" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      Present
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAttStatus({ ...attStatus, [sid]: "Absent" })}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-black ${
                                        st === "Absent" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      Absent
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
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl"
                    >
                      {attSaving ? "Saving..." : "💾 Save Attendance"}
                    </button>
                  </>
                ) : (
                  <p className="text-slate-500 font-bold text-center py-8">No students found in {attClass}.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CLASS MATERIALS TAB */}
        {activeTab === "materials" && (
          <div className="space-y-8">
            <form onSubmit={handleAddMaterial} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <h1 className="text-2xl font-black mb-2">📚 Publish Class Material / Homework</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class *</label>
                  <select
                    value={matClass}
                    onChange={(e) => { setMatClass(e.target.value); setMatSubject(""); }}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Class</option>
                    {assignedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject *</label>
                  <select
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value)}
                    className={inputClass}
                    required
                    disabled={!matClass}
                  >
                    <option value="">Select Subject</option>
                    {getSubjectsForClass(matClass).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select value={matType} onChange={(e) => setMatType(e.target.value)} className={inputClass}>
                    <option value="Note">Note / PDF</option>
                    <option value="Homework">Homework</option>
                    <option value="Video Link">Video Lecture</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title *</label>
                  <input type="text" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} placeholder="e.g. Chapter 3 Formula Sheet" className={inputClass} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Drive / YouTube Link (Optional)</label>
                  <input type="url" value={matLink} onChange={(e) => setMatLink(e.target.value)} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructions / Description</label>
                <textarea rows={3} value={matDesc} onChange={(e) => setMatDesc(e.target.value)} placeholder="Write details or homework instructions..." className={inputClass} />
              </div>

              <button type="submit" disabled={matSaving} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl">
                {matSaving ? "Publishing..." : "🚀 Publish Material"}
              </button>
            </form>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black mb-4">My Published Materials</h2>
              {myMaterials.length > 0 ? (
                <div className="space-y-3">
                  {myMaterials.map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 mr-2">{m.material_type}</span>
                        <span className="text-xs font-bold text-slate-500">{m.class_name} • {m.subject_name}</span>
                        <h3 className="font-black text-slate-900 mt-1">{m.title}</h3>
                        {m.description && <p className="text-xs text-slate-600 mt-0.5">{m.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteMaterial(m.id)} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl">
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 font-bold text-sm">No materials published yet.</p>
              )}
            </div>
          </div>
        )}

        {/* EXAM MARKS INPUT TAB */}
        {activeTab === "marks" && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black mb-6">📝 Exam Marks Input</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class *</label>
                <select value={markClass} onChange={(e) => { setMarkClass(e.target.value); setMarkSubject(""); }} className={inputClass}>
                  <option value="">Select Class</option>
                  {assignedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject *</label>
                <select value={markSubject} onChange={(e) => setMarkSubject(e.target.value)} className={inputClass} disabled={!markClass}>
                  <option value="">Select Subject</option>
                  {getSubjectsForClass(markClass).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exam Name *</label>
                <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Monthly Test" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Marks</label>
                <input type="number" value={fullMarks} onChange={(e) => setFullMarks(e.target.value)} className={inputClass} />
              </div>
            </div>

            {markClass && markSubject && (
              <div>
                {markStudents.length > 0 ? (
                  <>
                    <div className="overflow-x-auto border rounded-2xl mb-6">
                      <table className="min-w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                          <tr>
                            <th className="p-3">ID &amp; Name</th>
                            <th className="p-3 w-24">CQ</th>
                            <th className="p-3 w-24">MCQ</th>
                            <th className="p-3 w-24">PR</th>
                            <th className="p-3 w-24 text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {markStudents.map((stu) => {
                            const sid = String(stu.student_id || stu.id);
                            const m = marksMap[sid] || { cq: "", mcq: "", pr: "" };
                            const total = Number(m.cq || 0) + Number(m.mcq || 0) + Number(m.pr || 0);
                            return (
                              <tr key={sid}>
                                <td className="p-3">
                                  <p className="font-black text-sm">{stu.full_name}</p>
                                  <p className="text-xs text-slate-500">{sid}</p>
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    value={m.cq}
                                    onChange={(e) => setMarksMap({ ...marksMap, [sid]: { ...m, cq: e.target.value } })}
                                    className="w-full px-2 py-2 border rounded-lg text-sm font-bold"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    value={m.mcq}
                                    onChange={(e) => setMarksMap({ ...marksMap, [sid]: { ...m, mcq: e.target.value } })}
                                    className="w-full px-2 py-2 border rounded-lg text-sm font-bold"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="number"
                                    value={m.pr}
                                    onChange={(e) => setMarksMap({ ...marksMap, [sid]: { ...m, pr: e.target.value } })}
                                    className="w-full px-2 py-2 border rounded-lg text-sm font-bold"
                                  />
                                </td>
                                <td className="p-3 text-center font-black text-blue-700">{total}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={markSaving}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl"
                    >
                      {markSaving ? "Saving Marks..." : "💾 Submit Marks"}
                    </button>
                  </>
                ) : (
                  <p className="text-slate-500 font-bold text-center py-8">No students found in {markClass}.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CLASS NOTICE TAB */}
        {activeTab === "notices" && (
          <div className="space-y-8">
            <form onSubmit={handlePostNotice} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
              <h1 className="text-2xl font-black mb-2">📢 Post Class Notice</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Class *</label>
                  <select value={noticeClass} onChange={(e) => setNoticeClass(e.target.value)} className={inputClass} required>
                    <option value="">Select Assigned Class</option>
                    {assignedClasses.map((cls) => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Title *</label>
                  <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} placeholder="e.g. Tomorrow's Class Test" className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notice Details *</label>
                <textarea rows={3} value={noticeContent} onChange={(e) => setNoticeContent(e.target.value)} placeholder="Write notice details..." className={inputClass} required />
              </div>
              <button type="submit" disabled={noticeSaving} className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl">
                {noticeSaving ? "Publishing..." : "📢 Publish Notice"}
              </button>
            </form>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-black mb-4">My Posted Notices</h2>
              {myPostedNotices.length > 0 ? (
                <div className="space-y-3">
                  {myPostedNotices.map((n) => (
                    <div key={n.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">{n.target_class}</span>
                        <h3 className="font-black text-slate-900 mt-1">{n.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{n.content}</p>
                      </div>
                      <button onClick={() => handleDeleteNotice(n.id)} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg shrink-0">
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 font-bold text-sm">No notices posted yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}