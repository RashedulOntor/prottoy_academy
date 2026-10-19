"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const calculateGradeInfo = (obtained: number, fullMarks: number = 100) => {
  if (fullMarks <= 0 || obtained > fullMarks) return { grade: "INVALID", gp: "0.00" };
  const percentage = (obtained / fullMarks) * 100;
  if (percentage >= 80) return { grade: "A+", gp: "5.00" };
  if (percentage >= 70) return { grade: "A", gp: "4.00" };
  if (percentage >= 60) return { grade: "A-", gp: "3.50" };
  if (percentage >= 50) return { grade: "B", gp: "3.00" };
  if (percentage >= 40) return { grade: "C", gp: "2.00" };
  if (percentage >= 33) return { grade: "D", gp: "1.00" };
  return { grade: "F", gp: "0.00" };
};

const emptySubject = () => ({ name: "", fullMarks: 100, highestMarks: "", cq: "", mcq: "", pr: "", obtained: "" });

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]); 
  const [loadingMsg, setLoadingMsg] = useState("");

  useEffect(() => { if (urlTab) setActiveTab(urlTab); }, [urlTab]);

  const [fullName, setFullName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [studentImage, setStudentImage] = useState("");

  const [studentListClassFilter, setStudentListClassFilter] = useState("");
  const [studentListSearch, setStudentListSearch] = useState("");
  
  const [manageStudent, setManageStudent] = useState<any>(null);
  const [adminResetPass, setAdminResetPass] = useState("");
  const [updateStudentImage, setUpdateStudentImage] = useState("");
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [fName, setFName] = useState("");
  const [fDesignation, setFDesignation] = useState("");
  const [fEducation, setFEducation] = useState("");
  const [fSubjects, setFSubjects] = useState("");
  const [fExperience, setFExperience] = useState("");
  const [fImage, setFImage] = useState(""); 
  
  const [manageFaculty, setManageFaculty] = useState<any>(null);
  const [isUpdatingFaculty, setIsUpdatingFaculty] = useState(false);

  const [payClassFilter, setPayClassFilter] = useState("");
  const [paySearchQuery, setPaySearchQuery] = useState("");
  const [payStudentId, setPayStudentId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payPurpose, setPayPurpose] = useState("");
  const [payStatus, setPayStatus] = useState("Paid");
  const [payLoading, setPayLoading] = useState("");
  
  const [resultTab, setResultTab] = useState("publish");
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [resultStudentId, setResultStudentId] = useState("");
  const [examName, setExamName] = useState("");
  const [subjects, setSubjects] = useState([emptySubject()]);
  const [resultLoading, setResultLoading] = useState("");

  // ==========================================
  // 🔴 FIXED: BULLETPROOF IMAGE COMPRESSION
  // ==========================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { 
      alert("⚠️ ছবির সাইজ ৫ মেগাবাইটের (5MB) নিচে দিন।"); return;
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
          const MAX_WIDTH = 400; 
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) {
            scaleSize = MAX_WIDTH / img.width;
          }
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL("image/jpeg", 0.7)); 
          } else {
            // ক্যানভাস সাপোর্ট না করলে অরিজিনাল ছবি
            callback(base64String); 
          }
        } catch (e) {
          // কম্প্রেশন এরর হলে অরিজিনাল ছবি
          callback(base64String); 
        }
      };
      
      img.onerror = () => {
        // ইমেজ রেন্ডার ফেইল করলেও অরিজিনাল ছবি গ্যারান্টি দিয়ে প্রিভিউতে আনবে
        callback(base64String); 
      };
    };
  };

  const handleAddSubject = () => setSubjects([...subjects, emptySubject()]);
  const handleRemoveSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
  };

  const handleSubjectFieldChange = (index: number, field: string, value: string | number) => {
    const newSubs: any = [...subjects];
    if (["fullMarks", "highestMarks", "cq", "mcq", "pr"].includes(field) && value !== "") {
      if (Number(value) < 0) return;
    }
    if (field === "highestMarks" && value !== "") {
      const full = Number(newSubs[index].fullMarks) || 100;
      if (Number(value) > full) {
        alert(`⚠️ Highest Marks cannot be greater than Full Marks (${full})!`); return;
      }
    }
    newSubs[index][field] = value;
    const cqVal = Number(newSubs[index].cq) || 0;
    const mcqVal = Number(newSubs[index].mcq) || 0;
    const prVal = Number(newSubs[index].pr) || 0;
    if (newSubs[index].cq !== "" || newSubs[index].mcq !== "" || newSubs[index].pr !== "") {
      newSubs[index].obtained = String(cqVal + mcqVal + prVal);
    } else {
      newSubs[index].obtained = "";
    }
    setSubjects(newSubs);
  };

  const handlePublishResult = async () => {
    if (!resultStudentId || !examName || subjects.length === 0) return alert("❌ Select a Student, Exam Name, and add Subjects!");
    for (let i = 0; i < subjects.length; i++) {
      const s = subjects[i];
      const full = Number(s.fullMarks) || 100;
      const obt = Number(s.obtained) || 0;
      if (!s.name.trim()) return alert(`❌ Please enter Subject Name for Subject #${i + 1}!`);
      if (s.obtained === "") return alert(`❌ Please enter CQ, MCQ, or Practical marks for "${s.name}"!`);
      if (obt > full) return alert(`❌ Total Obtained (${obt}) cannot be greater than Full Marks (${full})!`);
    }
    setResultLoading("Publishing...");
    try {
      const enrichedSubjects = subjects.map((s) => {
        const obt = Number(s.obtained) || 0;
        const full = Number(s.fullMarks) || 100;
        const { grade, gp } = calculateGradeInfo(obt, full);
        return { ...s, ca: "-", obtained: obt, fullMarks: full, highestMarks: s.highestMarks ? Number(s.highestMarks) : obt, grade, gp };
      });
      const res = await fetch("/api/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: resultStudentId, exam_name: examName, subjects: JSON.stringify(enrichedSubjects) }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Result Published Successfully!");
        setResultStudentId(""); setExamName(""); setSubjects([emptySubject()]); fetchResults();
      } else alert("❌ Error: " + result.message);
    } catch (err) {} finally { setResultLoading(""); }
  };

  const fetchResults = () => {
    fetch(`/api/results?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setResultsList(data.data); })
  };

  const handleDeleteResult = async (id: number) => {
    if (!window.confirm("Delete this exam result?")) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ " + result.message); fetchResults(); } 
    } catch (err) {}
  };

  const fetchStudents = () => {
    fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStudents(data.data); });
  };

  const fetchArchivedStudents = () => {
    fetch(`/api/students?archived=true&t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setArchivedStudents(data.data); });
  };

  const fetchFaculties = () => {
    fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { 
        if (data.success && Array.isArray(data.data)) {
          setFaculties(data.data); 
        } else {
          setFaculties([]);
        }
      })
      .catch(() => setFaculties([]));
  };

  const fetchPayments = () => {
    fetch(`/api/payments?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setPayments(data.data); })
  };

  useEffect(() => { 
    fetchStudents(); fetchArchivedStudents(); fetchFaculties(); fetchPayments(); fetchResults(); 
  }, []);

  const handleLogout = () => { window.location.href = "/"; };

  const handleDeleteStudent = async (id: number) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ Moved to archive."); setManageStudent(null); fetchStudents(); fetchArchivedStudents(); }
    } catch (err) {}
  };

  const handleRecoverStudent = async (id: number) => {
    if (!window.confirm("Restore this student?")) return;
    try {
      const res = await fetch(`/api/students`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: 'recover', id: Number(id) }) });
      const result = await res.json();
      if (result.success) { alert("✅ Restored!"); fetchStudents(); fetchArchivedStudents(); }
    } catch (err) {}
  };

  const handleRegisterStudent = async () => {
    if (!fullName || !phone || !className) return alert("❌ Required: Full Name, Phone, and Class!");
    setLoadingMsg("Registering...");
    try {
      const res = await fetch("/api/students", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, fathersName, mothersName, className, phone, address, profile_image: studentImage }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        setFullName(""); setFathersName(""); setMothersName(""); setClassName(""); setPhone(""); setAddress(""); setStudentImage("");
        fetchStudents(); router.push("/admin?tab=studentsList");
      } else alert("❌ Error: " + result.message);
    } catch (err) {} finally { setLoadingMsg(""); }
  };

  const handleUpdateStudentImageAPI = async () => {
    if (!updateStudentImage || !manageStudent) return alert("⚠️ Please select an image!");
    setIsUpdatingImage(true);
    try {
      const res = await fetch('/api/students', { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type: 'update_image', id: Number(manageStudent.student_id), profile_image: updateStudentImage }) 
      });
      const result = await res.json();
      if (result.success) { 
        alert(`✅ Image updated!`); setUpdateStudentImage(""); fetchStudents(); 
        setManageStudent({...manageStudent, profile_image: updateStudentImage}); 
      }
    } catch (err) {} finally { setIsUpdatingImage(false); }
  };

  const handleAdminPasswordReset = async () => {
    if (!adminResetPass || !manageStudent) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/students', { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type: 'update_password', id: Number(manageStudent.student_id), newPassword: adminResetPass }) 
      });
      if ((await res.json()).success) { alert(`✅ Password changed!`); setAdminResetPass(""); }
    } catch (err) {} finally { setIsResetting(false); }
  };

  const handleRegisterFaculty = async () => {
    if (!fName || !fDesignation) return alert("❌ Required: Name and Designation!");
    setLoadingMsg("Adding Teacher...");
    try {
      const res = await fetch("/api/faculty", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fName, designation: fDesignation, education: fEducation, subjects: fSubjects, experience: fExperience, image: fImage }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Teacher added successfully!");
        setFName(""); setFDesignation(""); setFEducation(""); setFSubjects(""); setFExperience(""); setFImage(""); fetchFaculties(); 
      } else alert("❌ Error: " + result.message);
    } catch (err) {} finally { setLoadingMsg(""); }
  };

  const handleUpdateFacultyDetails = async () => {
    setIsUpdatingFaculty(true);
    try {
      const res = await fetch('/api/faculty', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_details', ...manageFaculty })
      });
      const result = await res.json();
      if (result.success) { alert("✅ Faculty details updated!"); fetchFaculties(); } 
    } catch (err) {} finally { setIsUpdatingFaculty(false); }
  };

  const handleUpdateFacultyImageAPI = async (base64String: string) => {
    try {
      const res = await fetch('/api/faculty', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'update_image', id: manageFaculty.id, image: base64String })
      });
      const result = await res.json();
      if (result.success) { alert("✅ Image updated!"); setManageFaculty({...manageFaculty, image: base64String}); fetchFaculties(); }
    } catch (err) {} 
  };

  const handleDeleteFaculty = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher permanently?")) return;
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ Deleted."); setManageFaculty(null); fetchFaculties(); } 
    } catch (err) {}
  };

  const handleRecordPayment = async () => {
    if (!payStudentId || !payAmount || !payPurpose) return alert("❌ Required fields missing!");
    setPayLoading("Recording...");
    try {
      const res = await fetch("/api/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: payStudentId, amount: payAmount, payment_purpose: payPurpose, payment_status: payStatus }),
      });
      if ((await res.json()).success) { alert("✅ Recorded!"); setPayStudentId(""); setPayAmount(""); setPayPurpose(""); fetchPayments(); }
    } catch (err) {} finally { setPayLoading(""); }
  };

  const filteredStudentsForPayment = students.filter(std => {
    const matchClass = payClassFilter ? std.class_name === payClassFilter : true;
    const matchSearch = paySearchQuery ? std.full_name.toLowerCase().includes(paySearchQuery.toLowerCase()) || std.student_id.toString().includes(paySearchQuery) : true;
    return matchClass && matchSearch;
  });

  const filteredStudentsForList = students.filter(std => {
    const matchClass = studentListClassFilter ? std.class_name === studentListClassFilter : true;
    const matchSearch = studentListSearch ? std.full_name.toLowerCase().includes(studentListSearch.toLowerCase()) || std.student_id.toString().includes(studentListSearch) : true;
    return matchClass && matchSearch;
  });

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold shadow-sm text-base";
  const numberBoxClass = "w-full px-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white text-slate-900 font-black text-center text-base shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const hasAnyExceededError = subjects.some(s => (Number(s.obtained) || 0) > (Number(s.fullMarks) || 100));

  return (
    <div className="max-w-7xl mx-auto w-full font-sans bg-[#f8fafc] min-h-screen text-slate-900">
      <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800">Admin Portal</h2>
          <p className="text-sm font-bold text-slate-500">Manage Prottoy Academy System</p>
        </div>
        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-5 rounded-xl transition-colors flex items-center gap-2 border border-red-100 shadow-sm">
          🚪 <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      {activeTab !== "dashboard" && (
        <div className="mb-6">
          <button onClick={() => router.push("?tab=dashboard")} className="px-5 py-2.5 bg-[#0f172a] text-white hover:bg-slate-800 font-bold rounded-xl shadow-lg active:scale-95">⬅ Back to Dashboard</button>
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="animate-fade-in">
          <div className="relative bg-[#0a192f] text-white rounded-[2rem] p-8 md:p-12 mb-10 overflow-hidden shadow-2xl border border-slate-800">
            <div className="relative z-10">
              <p className="text-blue-400 font-bold tracking-widest mb-2 text-sm uppercase">Overview</p>
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-white leading-tight">Welcome, Admin!</h1>
              <p className="text-slate-400 text-base md:text-lg max-w-xl font-medium">Manage students, faculties, payments, and exam results securely from this portal.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push("/admin?tab=studentsList")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold">Total Students</h3><p className="text-4xl font-black">{students.length}</p></div>
            <div onClick={() => router.push("/admin?tab=facultyList")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold">Total Faculty</h3><p className="text-4xl font-black">{faculties.length}</p></div>
            <div onClick={() => router.push("/admin?tab=examResults")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold">Exam Results</h3><p className="text-xl font-black text-indigo-600">Publish & View</p></div>
            <div onClick={() => router.push("/admin?tab=payments")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold">Payments</h3><p className="text-xl font-black text-amber-500">{payments.length} Records</p></div>
          </div>
        </div>
      )}

      {activeTab === "studentsList" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageStudent ? (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200 relative">
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h2>
                    <p className="text-slate-500 mb-8 font-medium">You are about to remove <strong>{manageStudent.full_name}</strong>.</p>
                    <div className="flex gap-4">
                      <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 bg-slate-100 font-bold rounded-xl">Cancel</button>
                      <button onClick={() => { setShowDeleteModal(false); handleDeleteStudent(manageStudent.student_id); }} className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl shadow-md">Yes, Remove</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div><h2 className="text-2xl font-black">⚙️ Manage Student</h2></div>
                <button onClick={() => setManageStudent(null)} className="px-5 py-2 bg-slate-100 font-bold rounded-xl">Close</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-black tracking-wider">Student Details</h3>
                  <div><strong>Name:</strong> {manageStudent.full_name}</div>
                  <div><strong>ID:</strong> {manageStudent.student_id}</div>
                  <div><strong>Class:</strong> {manageStudent.class_name}</div>
                  <div><strong>Phone:</strong> {manageStudent.phone_number || manageStudent.phone}</div>
                </div>

                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-black text-blue-800 mb-2">📷 Update Profile Picture</h3>
                    <div className="flex items-center gap-4">
                      {updateStudentImage ? <img src={updateStudentImage} className="w-16 h-16 rounded-full object-cover" /> : manageStudent.profile_image ? <img src={manageStudent.profile_image} className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center text-2xl">👤</div>}
                      <div className="flex-1 w-full">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setUpdateStudentImage)} className="text-xs w-full mb-2" />
                        <button onClick={handleUpdateStudentImageAPI} disabled={isUpdatingImage || !updateStudentImage} className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Upload & Save Image</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-lg font-black text-emerald-800 mb-2">🔑 Reset Password</h3>
                    <div className="flex gap-3">
                      <input type="text" value={adminResetPass} onChange={(e) => setAdminResetPass(e.target.value)} placeholder="Type new password..." className="w-full px-4 py-3 rounded-xl border border-emerald-300 font-bold" />
                      <button onClick={handleAdminPasswordReset} disabled={isResetting} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">Update</button>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-lg font-black text-red-800 mb-2">🗑️ Remove Student</h3>
                    <button onClick={() => setShowDeleteModal(true)} className="w-full py-3 bg-red-600 text-white rounded-xl font-black shadow-md">Remove Student Account</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-[#0a192f]">Students List</h1>
                {archivedStudents.length > 0 && (
                  <button onClick={() => setActiveTab("archivedStudents")} className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-md">♻️ Archive ({archivedStudents.length})</button>
                )}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">🔍 Filter by Class</label>
                    <select value={studentListClassFilter} onChange={(e) => setStudentListClassFilter(e.target.value)} className={inputClass}>
                      <option value="">All Classes</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-2">🔍 Search Name / ID</label>
                    <input type="text" value={studentListSearch} onChange={(e) => setStudentListSearch(e.target.value)} placeholder="Type student name or ID..." className={inputClass} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                    <tr><th className="p-5 font-bold text-slate-500">ID</th><th className="p-5 font-bold text-slate-500">Name</th><th className="p-5 font-bold text-slate-500">Class</th><th className="p-5 font-bold text-slate-500 text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudentsForList.map((student) => (
                      <tr key={student.student_id} className="hover:bg-slate-50">
                        <td className="p-5 font-bold text-slate-500">{student.student_id}</td>
                        <td className="p-5 font-black text-slate-900 flex items-center gap-3">
                           {student.profile_image ? <img src={student.profile_image} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">👤</div>}
                           {student.full_name}
                        </td>
                        <td className="p-5"><span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">{student.class_name}</span></td>
                        <td className="p-5 text-center"><button onClick={() => setManageStudent(student)} className="px-5 py-2.5 bg-[#0a192f] text-white rounded-xl font-bold">⚙️ Manage</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "archivedStudents" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black text-slate-900 mb-1">♻️ Student Archive</h1>
            <button onClick={() => setActiveTab("studentsList")} className="px-5 py-2.5 bg-slate-100 font-bold rounded-xl">⬅ Back to List</button>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                <tr><th className="p-5 font-bold text-slate-500">ID</th><th className="p-5 font-bold text-slate-500">Name</th><th className="p-5 font-bold text-slate-500 text-center">Restore</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="p-5 font-bold text-slate-400">{student.student_id}</td>
                    <td className="p-5 font-black text-slate-800">{student.full_name}</td>
                    <td className="p-5 text-center"><button onClick={() => handleRecoverStudent(student.student_id)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black">♻️ Recover</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "addNewStudent" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-black text-[#0a192f] mb-6">Register New Student</h1>
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50">
                <p className="text-xs font-bold text-slate-500 mb-4 text-center">Profile Image<br/>(Auto-Compressed)</p>
                {studentImage ? <img src={studentImage} className="w-32 h-32 object-cover rounded-full shadow-md mb-4 border-4 border-white" /> : <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-4">📷</div>}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setStudentImage)} className="text-sm w-full" />
              </div>
              <div className="md:col-span-2 space-y-6">
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name *" className={inputClass} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" className={inputClass} />
                  <input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select value={className} onChange={(e) => setClassName(e.target.value)} className={inputClass}>
                    <option value="">Select Class *</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                  </select>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (Login ID) *" className={inputClass} />
                </div>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className={inputClass} />
                <button onClick={handleRegisterStudent} disabled={!!loadingMsg} className="w-full py-4 bg-[#0a192f] text-white font-black rounded-xl text-lg shadow-lg">
                  {loadingMsg ? loadingMsg : "Register Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "examResults" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-black text-[#0a192f] mb-6">Exam Results Management</h1>
          <div className="flex flex-wrap gap-4 mb-8">
            <button onClick={() => setResultTab("publish")} className={`px-6 py-3 rounded-xl font-bold transition-all ${resultTab === "publish" ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200'}`}>+ Publish Result</button>
            <button onClick={() => setResultTab("manage")} className={`px-6 py-3 rounded-xl font-bold transition-all ${resultTab === "manage" ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-slate-200'}`}>📋 Manage Results</button>
          </div>

          {resultTab === "publish" && (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">1. Select Class *</label>
                  <select className={inputClass} onChange={(e) => setPayClassFilter(e.target.value)}>
                    <option value="">All Classes</option><option value="Class 6">Class 6</option><option value="Class 10">Class 10</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">2. Select Student *</label>
                  <select value={resultStudentId} onChange={(e) => setResultStudentId(e.target.value)} className={inputClass}>
                    <option value="">-- Choose Student --</option>
                    {students.filter(std => payClassFilter ? std.class_name === payClassFilter : true).map(std => (
                      <option key={std.student_id} value={std.student_id}>{std.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">3. Exam Name *</label>
                  <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Half Yearly" className={inputClass} />
                </div>
              </div>

              <div className="flex justify-between items-center gap-4 mb-6">
                <h3 className="text-xl font-black text-[#0a192f] uppercase tracking-wide">Subject-Wise Marks Entry</h3>
                <button onClick={handleAddSubject} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-md">+ Add Subject</button>
              </div>

              <div className="space-y-6">
                {subjects.map((sub, index) => {
                  const obtNum = Number(sub.obtained) || 0;
                  const fullNum = Number(sub.fullMarks) || 100;
                  const isExceeded = obtNum > fullNum;
                  return (
                    <div key={index} className={`p-6 rounded-2xl border-2 shadow-sm ${isExceeded ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex justify-between mb-4 border-b border-slate-200 pb-3">
                        <span className="bg-[#0a192f] text-white px-3 py-1 rounded-lg text-xs font-black">Subject #{index + 1}</span>
                        {subjects.length > 1 && <button onClick={() => handleRemoveSubject(index)} className="text-red-600 font-bold text-xs">🗑️ Remove</button>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
                        <div className="md:col-span-6"><input type="text" value={sub.name} onChange={(e) => handleSubjectFieldChange(index, "name", e.target.value)} placeholder="Subject Name *" className={inputClass} /></div>
                        <div className="md:col-span-3"><input type="number" value={sub.fullMarks} onChange={(e) => handleSubjectFieldChange(index, "fullMarks", Number(e.target.value))} placeholder="Full Marks" className={numberBoxClass} /></div>
                        <div className="md:col-span-3"><input type="number" value={sub.highestMarks} onChange={(e) => handleSubjectFieldChange(index, "highestMarks", e.target.value)} placeholder="Highest" className={numberBoxClass} /></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200">
                        <input type="number" value={sub.cq} onChange={(e) => handleSubjectFieldChange(index, "cq", e.target.value)} placeholder="CQ" className={numberBoxClass} />
                        <input type="number" value={sub.mcq} onChange={(e) => handleSubjectFieldChange(index, "mcq", e.target.value)} placeholder="MCQ" className={numberBoxClass} />
                        <input type="number" value={sub.pr} onChange={(e) => handleSubjectFieldChange(index, "pr", e.target.value)} placeholder="PR" className={numberBoxClass} />
                        <input type="text" readOnly value={sub.obtained !== "" ? `${sub.obtained} / ${fullNum}` : "Total"} className="w-full px-3 py-3 rounded-xl border-2 font-black text-center bg-slate-100 text-slate-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={handlePublishResult} disabled={!!resultLoading || hasAnyExceededError} className="w-full mt-8 py-4 bg-[#0a192f] text-white font-black rounded-2xl shadow-xl text-lg">
                {hasAnyExceededError ? "❌ Fix Marks" : resultLoading ? resultLoading : "🏆 Publish Result"}
              </button>
            </div>
          )}

          {resultTab === "manage" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                    <tr><th className="p-5 font-bold">Student</th><th className="p-5 font-bold">Exam</th><th className="p-5 font-bold text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultsList.map((resItem: any, index: number) => {
                      const resId = resItem.id || resItem.result_id;
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-5 font-black">{resItem.full_name ? `${resItem.full_name} (${resItem.class_name})` : resItem.student_id}</td>
                          <td className="p-5 font-bold text-slate-600 uppercase">{resItem.exam_name}</td>
                          <td className="p-5 text-center"><button onClick={() => handleDeleteResult(resId)} className="px-5 py-2 bg-red-50 text-red-600 rounded-xl font-bold">Delete</button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FACULTY MANAGEMENT */}
      {activeTab === "facultyList" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageFaculty ? (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200 relative">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div><h2 className="text-2xl font-black text-[#0a192f]">⚙️ Manage Faculty</h2><p className="font-bold text-slate-500">Editing {manageFaculty.name}</p></div>
                <button onClick={() => setManageFaculty(null)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl">Close</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="font-black text-slate-700 mb-4">Profile Image</h3>
                  {manageFaculty.image ? <img src={manageFaculty.image} className="w-40 h-40 object-cover rounded-full shadow-md mb-4 border-4 border-white" /> : <div className="w-40 h-40 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-4">👨‍🏫</div>}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, handleUpdateFacultyImageAPI)} className="text-xs w-full text-center" />
                  <p className="text-xs text-slate-500 mt-2 text-center">Image auto-saves upon selection.</p>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Name</label><input type="text" value={manageFaculty.name} onChange={(e) => setManageFaculty({...manageFaculty, name: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Designation</label><input type="text" value={manageFaculty.designation} onChange={(e) => setManageFaculty({...manageFaculty, designation: e.target.value})} className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Education</label><input type="text" value={manageFaculty.education} onChange={(e) => setManageFaculty({...manageFaculty, education: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-1">Subjects</label><input type="text" value={manageFaculty.subjects} onChange={(e) => setManageFaculty({...manageFaculty, subjects: e.target.value})} className={inputClass} /></div>
                  </div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-1">Experience</label><input type="text" value={manageFaculty.experience} onChange={(e) => setManageFaculty({...manageFaculty, experience: e.target.value})} className={inputClass} /></div>
                  
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button onClick={handleUpdateFacultyDetails} disabled={isUpdatingFaculty} className="flex-1 py-3.5 bg-[#0a192f] text-white font-black rounded-xl shadow-md">{isUpdatingFaculty ? "Saving..." : "💾 Save Changes"}</button>
                    <button onClick={() => handleDeleteFaculty(manageFaculty.id)} className="px-6 py-3.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-black rounded-xl border border-red-100">🗑️ Delete Teacher</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-slate-900 mb-6">Faculty Management</h1>
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-10">
                <h3 className="text-xl font-black text-emerald-600 mb-6">+ Add New Teacher</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 p-6 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 mb-4">Profile Image</p>
                    {fImage ? <img src={fImage} className="w-32 h-32 object-cover rounded-full shadow-md mb-4 border-4 border-white" /> : <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-4xl mb-4">👨‍🏫</div>}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setFImage)} className="text-sm w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Name *" className={inputClass} />
                      <input type="text" value={fDesignation} onChange={(e) => setFDesignation(e.target.value)} placeholder="Designation *" className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={fEducation} onChange={(e) => setFEducation(e.target.value)} placeholder="Education" className={inputClass} />
                      <input type="text" value={fSubjects} onChange={(e) => setFSubjects(e.target.value)} placeholder="Subjects" className={inputClass} />
                      <input type="text" value={fExperience} onChange={(e) => setFExperience(e.target.value)} placeholder="Experience" className={inputClass} />
                    </div>
                    <button onClick={handleRegisterFaculty} disabled={!!loadingMsg} className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl">{loadingMsg ? loadingMsg : "💾 Save Teacher"}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {faculties.map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="w-full aspect-square bg-slate-100 relative">
                      <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-slate-900 mb-1">{teacher.name}</h3>
                      <p className="text-indigo-600 font-bold text-sm mb-4">{teacher.designation}</p>
                      <div className="text-sm text-slate-600 space-y-2 mb-6">
                        <p>🎓 {teacher.education}</p>
                        <p>⏳ {teacher.experience}</p>
                        <p>📚 <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">{teacher.subjects}</span></p>
                      </div>
                      
                      <button onClick={() => setManageFaculty(teacher)} className="mt-auto w-full py-2.5 bg-[#0a192f] text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md">
                        ⚙️ Manage
                      </button>
                    </div>
                  </div>
                ))}
                {faculties.length === 0 && <p className="col-span-full text-center text-slate-500 font-bold p-10">No teachers found in the database. Please add them above!</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* PAYMENTS SECTION */}
      {activeTab === "payments" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <h1 className="text-3xl font-black text-[#0a192f] mb-6">Student Payments Management</h1>
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-xl font-black text-blue-600 border-b border-slate-100 pb-4 mb-6">+ Record Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} className={inputClass}>
                  <option value="">-- Choose Student --</option>
                  {filteredStudentsForPayment.map(std => (<option key={std.student_id} value={std.student_id}>{std.full_name}</option>))}
                </select>
              </div>
              <div><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Amount (৳)" className={inputClass} /></div>
              <div><input type="text" value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} placeholder="Purpose" className={inputClass} /></div>
              <div>
                <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className={inputClass}>
                  <option value="Paid">Paid</option><option value="Pending">Pending</option>
                </select>
              </div>
              <div className="lg:col-span-4"><button type="button" onClick={handleRecordPayment} disabled={!!payLoading} className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-md">💾 Record Payment</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-blue-600 font-black text-2xl animate-pulse">Loading Admin Portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}