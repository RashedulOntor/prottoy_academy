"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
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

const emptySubject = () => ({
  name: "",
  fullMarks: 100,
  highestMarks: "",
  cq: "",
  mcq: "",
  pr: "",
  obtained: ""
});

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

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab);
  }, [urlTab]);

  // Student states
  const [fullName, setFullName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Student List Filter States
  const [studentListClassFilter, setStudentListClassFilter] = useState("");
  const [studentListSearch, setStudentListSearch] = useState("");
  
  // Manage Student Interface States
  const [manageStudent, setManageStudent] = useState<any>(null);
  const [adminResetPass, setAdminResetPass] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Faculty & Payments & Results States
  const [fName, setFName] = useState("");
  const [fDesignation, setFDesignation] = useState("");
  const [fEducation, setFEducation] = useState("");
  const [fSubjects, setFSubjects] = useState("");
  const [fExperience, setFExperience] = useState("");
  const [fImage, setFImage] = useState("");
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

  const handleAddSubject = () => setSubjects([...subjects, emptySubject()]);
  const handleRemoveSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
  };

  // 🔴 STRICT AUTO-CALCULATION & LIMIT GUARD FOR CQ, MCQ, PR
  const handleSubjectFieldChange = (index: number, field: string, value: string | number) => {
    const newSubs: any = [...subjects];

    // Prevent negative numbers
    if (["fullMarks", "highestMarks", "cq", "mcq", "pr"].includes(field) && value !== "") {
      if (Number(value) < 0) return;
    }

    // Highest marks cannot exceed Full Marks
    if (field === "highestMarks" && value !== "") {
      const full = Number(newSubs[index].fullMarks) || 100;
      if (Number(value) > full) {
        alert(`⚠️ Highest Marks cannot be greater than Full Marks (${full})!`);
        return;
      }
    }

    newSubs[index][field] = value;

    // Auto-calculate Total Obtained from CQ + MCQ + PR
    const cqVal = Number(newSubs[index].cq) || 0;
    const mcqVal = Number(newSubs[index].mcq) || 0;
    const prVal = Number(newSubs[index].pr) || 0;
    const hasAnyMark = newSubs[index].cq !== "" || newSubs[index].mcq !== "" || newSubs[index].pr !== "";

    if (hasAnyMark) {
      const total = cqVal + mcqVal + prVal;
      newSubs[index].obtained = String(total);
    } else {
      newSubs[index].obtained = "";
    }

    setSubjects(newSubs);
  };

  const handlePublishResult = async () => {
    if (!resultStudentId || !examName || subjects.length === 0) {
      return alert("❌ Required: Select a Student, Exam Name, and add at least one Subject!");
    }

    // Validate every subject before publishing
    for (let i = 0; i < subjects.length; i++) {
      const s = subjects[i];
      const full = Number(s.fullMarks) || 100;
      const obt = Number(s.obtained) || 0;

      if (!s.name.trim()) {
        return alert(`❌ Please enter Subject Name for Subject #${i + 1}!`);
      }
      if (s.obtained === "") {
        return alert(`❌ Please enter CQ, MCQ, or Practical marks for "${s.name}"!`);
      }
      if (obt > full) {
        return alert(`❌ Invalid Marks in "${s.name}": Total Obtained (${obt}) cannot be greater than Full Marks (${full})!`);
      }
      if (s.highestMarks !== "" && Number(s.highestMarks) > full) {
        return alert(`❌ Invalid Highest Marks in "${s.name}": Cannot exceed Full Marks (${full})!`);
      }
    }

    setResultLoading("Publishing...");
    try {
      const enrichedSubjects = subjects.map((s) => {
        const obt = Number(s.obtained) || 0;
        const full = Number(s.fullMarks) || 100;
        const { grade, gp } = calculateGradeInfo(obt, full);
        return {
          ...s,
          ca: "-",
          obtained: obt,
          fullMarks: full,
          highestMarks: s.highestMarks ? Number(s.highestMarks) : obt,
          grade,
          gp
        };
      });

      const res = await fetch("/api/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: resultStudentId, exam_name: examName, subjects: JSON.stringify(enrichedSubjects) }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Result Published Successfully!");
        setResultStudentId(""); setExamName(""); setSubjects([emptySubject()]);
        fetchResults();
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to publish result!"); } 
    finally { setResultLoading(""); }
  };

  const fetchResults = () => {
    fetch(`/api/results?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setResultsList(data.data); })
      .catch((err) => console.error("Failed to fetch results", err));
  };

  const handleDeleteResult = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exam result?")) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ " + result.message); fetchResults(); } 
      else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to delete result."); }
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
        if (data.success) setFaculties([...coreMembers, ...otherFoundingTeachers, ...data.data]); 
        else setFaculties([...coreMembers, ...otherFoundingTeachers]);
      })
      .catch(() => setFaculties([...coreMembers, ...otherFoundingTeachers]));
  };

  const fetchPayments = () => {
    fetch(`/api/payments?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setPayments(data.data); })
      .catch((err) => console.error("Failed to fetch payments", err));
  };

  useEffect(() => { 
    fetchStudents(); 
    fetchArchivedStudents();
    fetchFaculties(); 
    fetchPayments(); 
    fetchResults(); 
  }, []);

  const handleLogout = () => { window.location.href = "/"; };

  const handleDeleteStudent = async (id: number) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { 
        alert("✅ Student moved to archive successfully."); 
        setManageStudent(null); 
        fetchStudents(); 
        fetchArchivedStudents();
      } 
      else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to remove student."); }
  };

  const handleRecoverStudent = async (id: number) => {
    if (!window.confirm("Do you want to restore this student to the active list?")) return;
    try {
      const res = await fetch(`/api/students`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'recover', id: Number(id) })
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Student restored successfully!");
        fetchStudents();
        fetchArchivedStudents();
      } else alert("❌ Failed to restore student.");
    } catch (err) { alert("❌ Something went wrong."); }
  };

  const handleRegisterStudent = async () => {
    if (!fullName || !phone || !className) return alert("❌ Required: Full Name, Phone, and Class!");
    setLoadingMsg("Registering...");
    try {
      const res = await fetch("/api/students", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, fathersName, mothersName, className, phone, address }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        setFullName(""); setFathersName(""); setMothersName(""); setClassName(""); setPhone(""); setAddress("");
        fetchStudents(); router.push("/admin?tab=studentsList");
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Registration failed!"); } 
    finally { setLoadingMsg(""); }
  };

  const handleAdminPasswordReset = async () => {
    if (!adminResetPass) return alert("⚠️ Please enter a new password for the student.");
    if (!manageStudent) return;
    
    setIsResetting(true);
    try {
      const res = await fetch('/api/students', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type: 'update_password', id: Number(manageStudent.student_id), newPassword: adminResetPass }) 
      });
      const result = await res.json();
      if (result.success) { 
        alert(`✅ Password successfully changed for ${manageStudent.full_name}!`); 
        setAdminResetPass(""); 
      } 
      else alert("❌ Failed to reset password.");
    } catch (err) { alert("❌ Something went wrong."); } 
    finally { setIsResetting(false); }
  };

  const handleRegisterFaculty = async () => {
    if (!fName || !fDesignation || !fSubjects) return alert("❌ Required: Name, Designation, and Subjects!");
    setLoadingMsg("Adding Teacher...");
    try {
      const res = await fetch("/api/faculty", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fName, designation: fDesignation, education: fEducation, subjects: fSubjects, experience: fExperience, image: fImage }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Teacher added successfully!");
        setFName(""); setFDesignation(""); setFEducation(""); setFSubjects(""); setFExperience(""); setFImage("");
        fetchFaculties(); 
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to add teacher!"); } 
    finally { setLoadingMsg(""); }
  };

  const handleDeleteFaculty = async (id: number) => {
    if (id === 901 || id === 902) return alert("⚠️ This is a Core Founding Member! You cannot delete them.");
    if (id >= 903 && id <= 905) {
      if (!window.confirm("Are you sure you want to delete this founding teacher?")) return;
      setFaculties(faculties.filter(f => f.id !== id));
      alert("✅ Teacher removed."); return;
    }
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ " + result.message); fetchFaculties(); } 
      else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to delete teacher."); }
  };

  const handleRecordPayment = async () => {
    if (!payStudentId || !payAmount || !payPurpose) return alert("❌ Required: Select a Student, Amount, and Purpose!");
    setPayLoading("Recording...");
    try {
      const res = await fetch("/api/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: payStudentId, amount: payAmount, payment_purpose: payPurpose, payment_status: payStatus }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Payment recorded successfully!");
        setPayStudentId(""); setPayAmount(""); setPayPurpose(""); setPayStatus("Paid"); setPaySearchQuery("");
        fetchPayments(); 
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to record payment!"); } 
    finally { setPayLoading(""); }
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

  const getStudentInfo = (id: any) => {
    const s = students.find(st => st.student_id == id);
    return s ? `${s.full_name} (${s.class_name})` : `ID: ${id}`;
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900 font-bold shadow-sm text-base";
  const numberBoxClass = "w-full px-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white text-slate-900 font-black text-center text-base shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  // Check if any subject exceeds full marks
  const hasAnyExceededError = subjects.some(s => (Number(s.obtained) || 0) > (Number(s.fullMarks) || 100));

  return (
    <div className="max-w-7xl mx-auto w-full font-sans bg-[#f8fafc] min-h-screen text-slate-900">
      
      {/* Top Header with Logout */}
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
          <button
            onClick={() => router.push("?tab=dashboard")}
            className="no-print px-5 py-2.5 bg-[#0f172a] text-white hover:bg-slate-800 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg w-fit active:scale-95"
          >
            ⬅ Back to Dashboard
          </button>
        </div>
      )}

      {/* DASHBOARD */}
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
            <div onClick={() => router.push("/admin?tab=studentsList")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl mb-6">📚</div>
              <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">Total Students</h3>
              <p className="text-4xl font-black text-slate-800">{students.length}</p>
            </div>
            <div onClick={() => router.push("/admin?tab=facultyList")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl mb-6">👨‍🏫</div>
              <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">Total Faculty</h3>
              <p className="text-4xl font-black text-slate-800">{faculties.length}</p>
            </div>
            <div onClick={() => router.push("/admin?tab=examResults")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl mb-6">🏆</div>
              <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">Exam Results</h3>
              <p className="text-xl font-black text-indigo-600 mt-2">Publish & View</p>
            </div>
            <div onClick={() => router.push("/admin?tab=payments")} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-2xl mb-6">💳</div>
              <h3 className="text-slate-500 font-bold mb-1 text-sm uppercase tracking-wider">Payments</h3>
              <p className="text-xl font-black text-amber-500 mt-2">{payments.length} Records</p>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS LIST & MANAGE */}
      {activeTab === "studentsList" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageStudent ? (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-200 relative">
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
                    <div className="w-20 h-20 bg-red-50 border-4 border-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🗑️</div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h2>
                    <p className="text-slate-500 mb-8 font-medium">
                      You are about to remove <strong>{manageStudent.full_name}</strong>. Their account will be archived and can be restored anytime.
                    </p>
                    <div className="flex gap-4">
                      <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">No, Cancel</button>
                      <button onClick={() => { setShowDeleteModal(false); handleDeleteStudent(manageStudent.student_id); }} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md">Yes, Remove</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#0a192f] flex items-center gap-3">⚙️ Manage Student</h2>
                  <p className="text-slate-500 font-bold mt-1">Viewing details for {manageStudent.full_name}</p>
                </div>
                <button onClick={() => setManageStudent(null)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">Close</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-wider">Student Details</h3>
                  <div className="grid grid-cols-[100px_1fr]"><span className="text-slate-500 font-bold">Name:</span><span className="font-black text-slate-900">{manageStudent.full_name}</span></div>
                  <div className="grid grid-cols-[100px_1fr]"><span className="text-slate-500 font-bold">ID:</span><span className="font-black text-blue-600">{manageStudent.student_id}</span></div>
                  <div className="grid grid-cols-[100px_1fr]"><span className="text-slate-500 font-bold">Class:</span><span className="font-bold text-slate-800">{manageStudent.class_name}</span></div>
                  <div className="grid grid-cols-[100px_1fr]"><span className="text-slate-500 font-bold">Phone:</span><span className="font-bold text-slate-800">{manageStudent.phone_number || manageStudent.phone}</span></div>
                  <div className="grid grid-cols-[100px_1fr]"><span className="text-slate-500 font-bold">Address:</span><span className="font-bold text-slate-800">{manageStudent.address || "N/A"}</span></div>
                </div>

                <div className="space-y-8">
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                    <h3 className="text-lg font-black text-emerald-800 mb-2">🔑 Reset Password</h3>
                    <p className="text-emerald-700 text-sm font-medium mb-4">Set a new password for this student.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="text" value={adminResetPass} onChange={(e) => setAdminResetPass(e.target.value)} placeholder="Type new password..." className="w-full px-4 py-3 rounded-xl border border-emerald-300 outline-none font-bold bg-white" />
                      <button onClick={handleAdminPasswordReset} disabled={isResetting} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold whitespace-nowrap">
                        {isResetting ? "Wait..." : "Update Password"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-lg font-black text-red-800 mb-2">🗑️ Remove Student</h3>
                    <p className="text-red-700 text-sm font-medium mb-4">Move this student account to the archive.</p>
                    <button onClick={() => setShowDeleteModal(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-md">
                      Remove Student Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-[#0a192f]">Detailed Students List</h1>
                {archivedStudents.length > 0 && (
                  <button onClick={() => setActiveTab("archivedStudents")} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md flex items-center gap-2">
                    ♻️ View Archive ({archivedStudents.length})
                  </button>
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
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                      <tr>
                        <th className="p-5 font-bold text-slate-500 uppercase text-sm">ID</th>
                        <th className="p-5 font-bold text-slate-500 uppercase text-sm">Name</th>
                        <th className="p-5 font-bold text-slate-500 uppercase text-sm">Class</th>
                        <th className="p-5 font-bold text-slate-500 uppercase text-sm text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudentsForList.map((student) => (
                        <tr key={student.student_id} className="hover:bg-slate-50">
                          <td className="p-5 font-bold text-slate-500">{student.student_id}</td>
                          <td className="p-5 font-black text-slate-900 text-lg">{student.full_name}</td>
                          <td className="p-5"><span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100">{student.class_name}</span></td>
                          <td className="p-5 text-center">
                            <button onClick={() => setManageStudent(student)} className="px-5 py-2.5 bg-[#0a192f] hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md">
                              ⚙️ Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ARCHIVED STUDENTS */}
      {activeTab === "archivedStudents" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">♻️ Student Archive</h1>
              <p className="text-slate-500 font-medium">Restore previously removed students.</p>
            </div>
            <button onClick={() => setActiveTab("studentsList")} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl">
              ⬅ Back to List
            </button>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                <tr>
                  <th className="p-5 font-bold text-slate-500 text-sm">ID</th>
                  <th className="p-5 font-bold text-slate-500 text-sm">Name</th>
                  <th className="p-5 font-bold text-slate-500 text-sm">Class</th>
                  <th className="p-5 font-bold text-slate-500 text-sm text-center">Restore</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="p-5 font-bold text-slate-400">{student.student_id}</td>
                    <td className="p-5 font-black text-slate-800">{student.full_name}</td>
                    <td className="p-5">{student.class_name}</td>
                    <td className="p-5 text-center">
                      <button onClick={() => handleRecoverStudent(student.student_id)} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black">
                        ♻️ Recover Account
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD STUDENT */}
      {activeTab === "addNewStudent" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-black text-[#0a192f] mb-6">Register New Student</h1>
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 max-w-3xl space-y-6">
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Student Full Name *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className={inputClass} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Father's Name</label><input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" className={inputClass} /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Mother's Name</label><input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Class *</label>
                <select value={className} onChange={(e) => setClassName(e.target.value)} className={inputClass}>
                  <option value="">Select Class</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                </select>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Phone Number (Login ID) *</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXX" className={inputClass} /></div>
            </div>
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, Thana, District" className={inputClass} /></div>
            <button type="button" onClick={handleRegisterStudent} disabled={!!loadingMsg} className="w-full py-4 bg-[#0a192f] hover:bg-slate-800 text-white font-black rounded-xl text-lg shadow-lg">
              {loadingMsg ? loadingMsg : "Register Student"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔴 STRICT CQ + MCQ + PR AUTO-CALCULATOR (NEVER EXCEEDS FULL MARKS)        */}
      {/* ========================================================================= */}
      {activeTab === "examResults" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-black text-[#0a192f] mb-6">Exam Results Management</h1>
          <div className="flex flex-wrap gap-4 mb-8">
            <button onClick={() => setResultTab("publish")} className={`px-6 py-3 rounded-xl font-bold transition-all ${resultTab === "publish" ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>+ Publish New Result</button>
            <button onClick={() => setResultTab("manage")} className={`px-6 py-3 rounded-xl font-bold transition-all ${resultTab === "manage" ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>📋 View & Manage Results</button>
          </div>

          {resultTab === "publish" && (
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 max-w-5xl">
              
              {/* Top 3 Selection Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">1. Select Class *</label>
                  <select className={inputClass} onChange={(e) => setPayClassFilter(e.target.value)}>
                    <option value="">All Classes</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">2. Select Student *</label>
                  <select value={resultStudentId} onChange={(e) => setResultStudentId(e.target.value)} className={inputClass}>
                    <option value="">-- Choose Student --</option>
                    {students.filter(std => payClassFilter ? std.class_name === payClassFilter : true).map(std => (
                      <option key={std.student_id} value={std.student_id}>{std.full_name} (ID: {std.student_id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2">3. Exam Name *</label>
                  <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Half Yearly Exam 2026" className={inputClass} />
                </div>
              </div>

              {/* Subject-Wise Marks Entry Header */}
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0a192f] uppercase tracking-wide">Subject-Wise Marks Entry</h3>
                  <p className="text-sm text-slate-500 font-semibold mt-0.5">Enter CQ, MCQ, and Practical marks. Total & Grade will be calculated automatically.</p>
                </div>
                <button onClick={handleAddSubject} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md transition-all active:scale-95">
                  + Add Another Subject
                </button>
              </div>

              {/* Spacious Subject Cards List */}
              <div className="space-y-6">
                {subjects.map((sub, index) => {
                  const obtNum = Number(sub.obtained) || 0;
                  const fullNum = Number(sub.fullMarks) || 100;
                  const isExceeded = obtNum > fullNum;
                  const { grade, gp } = calculateGradeInfo(obtNum, fullNum);

                  return (
                    <div key={index} className={`p-6 rounded-2xl border-2 shadow-sm transition-all ${isExceeded ? 'bg-red-50/60 border-red-500' : 'bg-slate-50/80 border-slate-200 hover:border-blue-300'}`}>
                      
                      {/* Card Top Bar */}
                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#0a192f] text-white px-3.5 py-1 rounded-lg text-xs font-black tracking-wider uppercase">
                            Subject #{index + 1}
                          </span>
                          {isExceeded && (
                            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black animate-pulse">
                              ⚠️ Error: Total marks ({obtNum}) cannot exceed Full Marks ({fullNum})!
                            </span>
                          )}
                        </div>
                        {subjects.length > 1 && (
                          <button onClick={() => handleRemoveSubject(index)} className="px-3.5 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-black hover:bg-red-200 transition-colors">
                            🗑️ Remove Subject
                          </button>
                        )}
                      </div>

                      {/* ROW 1: Subject Name, Full Marks, Highest Marks */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
                        <div className="md:col-span-6">
                          <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-wider">Subject Name *</label>
                          <input 
                            type="text" 
                            value={sub.name} 
                            onChange={(e) => handleSubjectFieldChange(index, "name", e.target.value)} 
                            placeholder="e.g. Bangla 1st Paper / Mathematics" 
                            className={inputClass} 
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Full Marks *</label>
                          <input 
                            type="number" 
                            value={sub.fullMarks} 
                            onChange={(e) => handleSubjectFieldChange(index, "fullMarks", Number(e.target.value))} 
                            className={numberBoxClass} 
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-wider">Highest Marks (Opt.)</label>
                          <input 
                            type="number" 
                            value={sub.highestMarks} 
                            onChange={(e) => handleSubjectFieldChange(index, "highestMarks", e.target.value)} 
                            placeholder="e.g. 95" 
                            className={numberBoxClass} 
                          />
                        </div>
                      </div>

                      {/* ROW 2: CQ, MCQ, PR, AUTO TOTAL, AUTO GRADE */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-white p-5 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-xs font-black text-blue-600 mb-2 text-center uppercase">CQ (Written)</label>
                          <input 
                            type="number" 
                            value={sub.cq} 
                            onChange={(e) => handleSubjectFieldChange(index, "cq", e.target.value)} 
                            placeholder="00" 
                            className={numberBoxClass} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-blue-600 mb-2 text-center uppercase">MCQ</label>
                          <input 
                            type="number" 
                            value={sub.mcq} 
                            onChange={(e) => handleSubjectFieldChange(index, "mcq", e.target.value)} 
                            placeholder="00" 
                            className={numberBoxClass} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-blue-600 mb-2 text-center uppercase">Practical (PR)</label>
                          <input 
                            type="number" 
                            value={sub.pr} 
                            onChange={(e) => handleSubjectFieldChange(index, "pr", e.target.value)} 
                            placeholder="-" 
                            className={numberBoxClass} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-emerald-700 mb-2 text-center uppercase">Total (Auto)</label>
                          <input 
                            type="text" 
                            readOnly
                            value={sub.obtained !== "" ? `${sub.obtained} / ${fullNum}` : "-"} 
                            className={`w-full px-3 py-3 rounded-xl border-2 font-black text-center text-base outline-none cursor-not-allowed ${isExceeded ? 'border-red-600 bg-red-100 text-red-700' : 'border-emerald-500 bg-emerald-50/70 text-slate-900'}`} 
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                          <label className="block text-xs font-black text-slate-500 mb-2 text-center uppercase">Grade & GP (Auto)</label>
                          <div className={`w-full py-3 rounded-xl border-2 flex items-center justify-center font-black text-base ${sub.obtained === "" ? 'bg-slate-100 border-slate-200 text-slate-400' : isExceeded ? 'bg-red-600 border-red-700 text-white' : grade === 'F' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {sub.obtained === "" ? "-" : isExceeded ? "Exceeds Full!" : `${grade} (${gp})`}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              <button 
                onClick={handlePublishResult} 
                disabled={!!resultLoading || hasAnyExceededError} 
                className={`w-full mt-8 py-4 text-white font-black rounded-2xl transition-all shadow-xl text-lg ${hasAnyExceededError ? 'bg-red-400 cursor-not-allowed' : 'bg-[#0a192f] hover:bg-slate-800 active:scale-98'}`}
              >
                {hasAnyExceededError ? "❌ Fix Exceeded Marks Before Publishing" : resultLoading ? resultLoading : "🏆 Publish Official Marksheet"}
              </button>
            </div>
          )}

          {resultTab === "manage" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-[#f8fafc] border-b-2 border-slate-200">
                    <tr>
                      <th className="p-5 font-bold text-slate-500 uppercase text-sm">Student</th>
                      <th className="p-5 font-bold text-slate-500 uppercase text-sm">Exam Name</th>
                      <th className="p-5 font-bold text-slate-500 text-center uppercase text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultsList.map((resItem: any, index: number) => {
                      const resId = resItem.id || resItem.result_id;
                      const studentInfo = resItem.full_name ? `${resItem.full_name} (${resItem.class_name})` : getStudentInfo(resItem.student_id);
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-5 font-black text-slate-900">{studentInfo}</td>
                          <td className="p-5 font-bold text-slate-600 uppercase">{resItem.exam_name}</td>
                          <td className="p-5 text-center">
                             <button onClick={() => handleDeleteResult(resId)} className="px-5 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100">Delete</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {resultsList.length === 0 && <p className="text-center text-slate-500 font-bold p-10 text-lg">No results published yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* FACULTY MANAGEMENT */}
      {activeTab === "facultyList" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-black text-slate-900 mb-6">Faculty Management</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {faculties.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col">
                <div className="w-full aspect-square bg-slate-100 relative">
                  <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 mb-1">{teacher.name}</h3>
                  <p className="text-indigo-600 font-bold text-sm mb-4">{teacher.designation}</p>
                  <div className="text-sm text-slate-600 space-y-2 mb-6">
                    <p>🎓 <strong>Edu:</strong> {teacher.education}</p>
                    <p>⏳ <strong>Exp:</strong> {teacher.experience}</p>
                    <p>📚 <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold text-xs">{teacher.subjects}</span></p>
                  </div>
                  {(teacher.id === 901 || teacher.id === 902) ? (
                    <button disabled className="mt-auto w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl font-bold">Protected</button>
                  ) : (
                    <button onClick={() => handleDeleteFaculty(teacher.id)} className="mt-auto w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-bold">🗑️ Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYMENTS SECTION */}
      {activeTab === "payments" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <h1 className="text-3xl font-black text-[#0a192f] mb-6">Student Payments Management</h1>
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-xl font-black text-blue-600 border-b border-slate-100 pb-4 mb-6">+ Record New Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Student *</label>
                <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} className={inputClass}>
                  <option value="">-- Choose Student --</option>
                  {filteredStudentsForPayment.map(std => (
                    <option key={std.student_id} value={std.student_id}>{std.full_name} (ID: {std.student_id})</option>
                  ))}
                </select>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Amount (৳) *</label><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="1500" className={inputClass} /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Purpose *</label><input type="text" value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} placeholder="Monthly Fee" className={inputClass} /></div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status *</label>
                <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className={inputClass}>
                  <option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Partial">Partial</option>
                </select>
              </div>
              <div className="lg:col-span-4">
                <button type="button" onClick={handleRecordPayment} disabled={!!payLoading} className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-md">
                  {payLoading ? payLoading : "💾 Record Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLASS LECTURES */}
      {activeTab === "classLecture" && (
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-lg border border-slate-200 max-w-3xl mx-auto mt-10">
          <p className="text-6xl mb-4">📺</p>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Class Lectures</h2>
          <a href="https://www.youtube.com/@prottoyacademy" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg">
            ▶️ Go to Prottoy Academy YouTube
          </a>
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