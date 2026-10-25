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

const EXAM_NAMES = ["Half Yearly Exam", "Annual Exam", "Pre-Test Exam", "Test Exam", "Model Test"];
const CLASSES = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "SSC 2026"];
const GROUPS = ["Science", "Humanities", "Business Studies", "General"];

const getSubjectsList = (cls: string, grp: string) => {
  if (!cls) return []; 

  const juniorSubjects = [
    "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper", 
    "Mathematics", "Science", "Bangladesh & Global Studies", "ICT", 
    "Life & Livelihood", "Health & Wellbeing", "Religion", "Art & Culture"
  ];
  
  const commonSenior = [
    "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper", 
    "General Mathematics", "Religion & Moral Education", "ICT"
  ];
  
  if (["Class 6", "Class 7", "Class 8"].includes(cls)) return juniorSubjects;
  
  if (!grp) return []; 
  
  let specific: string[] = [];
  if (grp === "Science") {
    specific = ["Physics", "Chemistry", "Biology", "Bangladesh & Global Studies", "Higher Mathematics", "Agriculture Studies", "Home Science"];
  } else if (grp === "Humanities") {
    specific = ["History of BD & World Civilization", "Geography & Environment", "Civics & Citizenship", "General Science", "Economics", "Agriculture Studies", "Home Science"];
  } else if (grp === "Business Studies") {
    specific = ["Accounting", "Finance & Banking", "Business Entrepreneurship", "General Science", "Agriculture Studies", "Home Science"];
  }
  
  return [...commonSenior, ...specific];
};

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

  // General States
  const [fullName, setFullName] = useState(""); const [fathersName, setFathersName] = useState(""); const [mothersName, setMothersName] = useState("");
  const [className, setClassName] = useState(""); const [studentGroup, setStudentGroup] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState(""); const [studentImage, setStudentImage] = useState("");
  const [studentListClassFilter, setStudentListClassFilter] = useState(""); const [studentListSearch, setStudentListSearch] = useState("");
  const [manageStudent, setManageStudent] = useState<any>(null); const [adminResetPass, setAdminResetPass] = useState("");
  const [updateStudentImage, setUpdateStudentImage] = useState(""); const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isResetting, setIsResetting] = useState(false); const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [fName, setFName] = useState(""); const [fDesignation, setFDesignation] = useState(""); const [fEducation, setFEducation] = useState("");
  const [fSubjects, setFSubjects] = useState(""); const [fExperience, setFExperience] = useState(""); const [fImage, setFImage] = useState(""); 
  const [manageFaculty, setManageFaculty] = useState<any>(null); const [isUpdatingFaculty, setIsUpdatingFaculty] = useState(false);

  const [payClassFilter, setPayClassFilter] = useState(""); const [paySearchQuery, setPaySearchQuery] = useState("");
  const [payStudentId, setPayStudentId] = useState(""); const [payAmount, setPayAmount] = useState("");
  const [payPurpose, setPayPurpose] = useState(""); const [payStatus, setPayStatus] = useState("Paid");
  const [payLoading, setPayLoading] = useState("");
  
  // Batch Result Entry States
  const [resultTab, setResultTab] = useState("publish");
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [batchExamName, setBatchExamName] = useState(""); const [batchClass, setBatchClass] = useState("");
  const [batchGroup, setBatchGroup] = useState(""); const [batchSubject, setBatchSubject] = useState("");
  const [batchFullMarks, setBatchFullMarks] = useState(100);
  const [batchHighestMarks, setBatchHighestMarks] = useState("");
  const [batchMarks, setBatchMarks] = useState<any>({}); 
  const [resultLoading, setResultLoading] = useState("");
  const [resultSearchQuery, setResultSearchQuery] = useState("");

  // Manage Result States
  const [manageResult, setManageResult] = useState<any>(null);
  const [editResultData, setEditResultData] = useState({ cq: "", mcq: "", pr: "", total: "", grade: "" });
  const [isUpdatingResult, setIsUpdatingResult] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("⚠️ ছবির সাইজ ৫ মেগাবাইটের (5MB) নিচে দিন।"); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const img = new window.Image();
      img.src = base64String;
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width * scaleSize; canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          if (ctx) { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); callback(canvas.toDataURL("image/jpeg", 0.7)); } 
          else callback(base64String); 
        } catch (e) { callback(base64String); }
      };
      img.onerror = () => callback(base64String); 
    };
  };

  const handleBatchMarkChange = (studentId: number, field: string, value: string) => {
    if (value !== "") {
      const numVal = Number(value);
      if (numVal < 0 || numVal > batchFullMarks) {
        alert(`⚠️ মার্কস অবশ্যই ০ থেকে ${batchFullMarks} এর মধ্যে হতে হবে!`);
        return;
      }
    }
    setBatchMarks((prev: any) => {
      const current = prev[studentId] || { cq: "", mcq: "", pr: "" };
      const updated = { ...current, [field]: value };
      const cq = Number(updated.cq) || 0; const mcq = Number(updated.mcq) || 0; const pr = Number(updated.pr) || 0;
      const total = cq + mcq + pr;

      if (total > batchFullMarks) { alert(`⚠️ মোট মার্কস (${total}) কোনোভাবেই Full Marks (${batchFullMarks}) এর বেশি হতে পারবে না!`); return prev; }
      updated.total = (updated.cq !== "" || updated.mcq !== "" || updated.pr !== "") ? String(total) : "";
      return { ...prev, [studentId]: updated };
    });
  };

  const handlePublishBatchResult = async () => {
    if (!batchExamName || !batchClass || !batchSubject) return alert("❌ Exam, Class and Subject are required!");
    
    // 🔴 FILTER STUDENTS BY CLASS AND GROUP BEFORE SAVING
    const studentsInClass = classStudents; 
    const payloadMarks: any = {};
    
    for (let std of studentsInClass) {
      const marks = batchMarks[std.student_id];
      if (marks && marks.total !== "") {
        if (Number(marks.total) > batchFullMarks) return alert(`❌ Marks for ${std.full_name} exceeds Full Marks!`);
        const { grade } = calculateGradeInfo(Number(marks.total), batchFullMarks);
        payloadMarks[std.student_id] = { ...marks, grade };
      }
    }

    if (Object.keys(payloadMarks).length === 0) return alert("⚠️ No marks entered to publish!");

    setResultLoading("Publishing...");
    try {
      const res = await fetch("/api/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_name: batchExamName, class_name: batchClass, subject_name: batchSubject,
          full_marks: batchFullMarks, highest_marks: calculatedHighestMark, marks_data: payloadMarks
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ " + data.message);
        setBatchMarks({}); fetchResults(); setResultTab("manage");
      } else alert("❌ Error: " + data.message);
    } catch (err) { alert("❌ Failed to save results!"); }
    finally { setResultLoading(""); }
  };

  const fetchResults = () => {
    fetch(`/api/results?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setResultsList(data.data); })
  };

  const openManageResultModal = (resItem: any) => {
    setManageResult(resItem);
    setEditResultData({ cq: resItem.cq || "", mcq: resItem.mcq || "", pr: resItem.pr || "", total: resItem.total || "", grade: resItem.grade || "" });
  };

  const handleEditResultMarkChange = (field: string, value: string) => {
    if (value !== "") {
      const numVal = Number(value);
      if (numVal < 0 || numVal > manageResult.full_marks) { alert(`⚠️ মার্কস ০ থেকে ${manageResult.full_marks} এর মধ্যে হতে হবে!`); return; }
    }
    setEditResultData((prev: any) => {
      const updated = { ...prev, [field]: value };
      const cq = Number(updated.cq) || 0; const mcq = Number(updated.mcq) || 0; const pr = Number(updated.pr) || 0;
      const total = cq + mcq + pr;

      if (total > manageResult.full_marks) { alert(`⚠️ টোটাল মার্কস (${total}) Full Marks এর বেশি হতে পারবে না!`); return prev; }
      updated.total = (updated.cq !== "" || updated.mcq !== "" || updated.pr !== "") ? String(total) : "";
      const { grade } = calculateGradeInfo(total, manageResult.full_marks);
      updated.grade = updated.total ? grade : "";
      return updated;
    });
  };

  const handleUpdateSingleResult = async () => {
    setIsUpdatingResult(true);
    try {
      const res = await fetch('/api/results', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: manageResult.id, ...editResultData })
      });
      const data = await res.json();
      if (data.success) { alert("✅ Result updated successfully!"); setManageResult(null); fetchResults(); }
      else alert("❌ Update failed.");
    } catch (err) { alert("❌ Update error"); }
    finally { setIsUpdatingResult(false); }
  };

  const handleDeleteResult = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this result?")) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { alert("✅ " + data.message); if(manageResult?.id === id) setManageResult(null); fetchResults(); } 
    } catch (err) {}
  };

  const fetchStudents = () => { fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" }).then((res) => res.json()).then((data) => { if (data.success) setStudents(data.data); }); };
  const fetchArchivedStudents = () => { fetch(`/api/students?archived=true&t=${new Date().getTime()}`, { cache: "no-store" }).then((res) => res.json()).then((data) => { if (data.success) setArchivedStudents(data.data); }); };
  const fetchFaculties = () => { fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" }).then((res) => res.json()).then((data) => { if (data.success && Array.isArray(data.data)) setFaculties(data.data); else setFaculties([]); }).catch(() => setFaculties([])); };
  const fetchPayments = () => { fetch(`/api/payments?t=${new Date().getTime()}`, { cache: "no-store" }).then((res) => res.json()).then((data) => { if (data.success) setPayments(data.data); }) };

  useEffect(() => { fetchStudents(); fetchArchivedStudents(); fetchFaculties(); fetchPayments(); fetchResults(); }, []);
  const handleLogout = () => { window.location.href = "/"; };

  const handleDeleteStudent = async (id: number) => { try { const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" }); const result = await res.json(); if (result.success) { alert("✅ Moved to archive."); setManageStudent(null); fetchStudents(); fetchArchivedStudents(); } } catch (err) {} };
  const handleRecoverStudent = async (id: number) => { if (!window.confirm("Restore this student?")) return; try { const res = await fetch(`/api/students`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: 'recover', id: Number(id) }) }); const result = await res.json(); if (result.success) { alert("✅ Restored!"); fetchStudents(); fetchArchivedStudents(); } } catch (err) {} };
  
  // 🔴 UPDATE: Group Validation added to Registration
  const handleRegisterStudent = async () => {
    if (!fullName || !phone || !className) return alert("❌ Required: Full Name, Phone, and Class!");
    if (["Class 9", "Class 10", "SSC 2026"].includes(className) && !studentGroup) return alert("❌ Required: Group must be selected for senior classes!");

    setLoadingMsg("Registering...");
    try {
      const res = await fetch("/api/students", { 
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ fullName, fathersName, mothersName, className, studentGroup, phone, address, profile_image: studentImage }), 
      }); 
      const result = await res.json(); 
      if (result.success) { 
        alert("✅ " + result.message); 
        setFullName(""); setFathersName(""); setMothersName(""); setClassName(""); setStudentGroup(""); setPhone(""); setAddress(""); setStudentImage(""); 
        fetchStudents(); router.push("/admin?tab=studentsList"); 
      } else alert("❌ Error: " + result.message); 
    } catch (err) {} finally { setLoadingMsg(""); } 
  };
  
  const handleUpdateStudentImageAPI = async () => { if (!updateStudentImage || !manageStudent) return alert("⚠️ Please select an image!"); setIsUpdatingImage(true); try { const res = await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'update_image', id: Number(manageStudent.student_id), profile_image: updateStudentImage }) }); const result = await res.json(); if (result.success) { alert(`✅ Image updated!`); setUpdateStudentImage(""); fetchStudents(); setManageStudent({...manageStudent, profile_image: updateStudentImage}); } } catch (err) {} finally { setIsUpdatingImage(false); } };
  const handleAdminPasswordReset = async () => { if (!adminResetPass || !manageStudent) return; setIsResetting(true); try { const res = await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'update_password', id: Number(manageStudent.student_id), newPassword: adminResetPass }) }); if ((await res.json()).success) { alert(`✅ Password changed!`); setAdminResetPass(""); } } catch (err) {} finally { setIsResetting(false); } };
  const handleRegisterFaculty = async () => { if (!fName || !fDesignation) return alert("❌ Required: Name and Designation!"); setLoadingMsg("Adding Teacher..."); try { const res = await fetch("/api/faculty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: fName, designation: fDesignation, education: fEducation, subjects: fSubjects, experience: fExperience, image: fImage }), }); const result = await res.json(); if (result.success) { alert("✅ Teacher added successfully!"); setFName(""); setFDesignation(""); setFEducation(""); setFSubjects(""); setFExperience(""); setFImage(""); fetchFaculties(); } else alert("❌ Error: " + result.message); } catch (err) {} finally { setLoadingMsg(""); } };
  const handleUpdateFacultyDetails = async () => { setIsUpdatingFaculty(true); try { const res = await fetch('/api/faculty', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'update_details', ...manageFaculty }) }); if ((await res.json()).success) { alert("✅ Faculty details updated!"); fetchFaculties(); } } catch (err) {} finally { setIsUpdatingFaculty(false); } };
  const handleUpdateFacultyImageAPI = async (base64String: string) => { try { const res = await fetch('/api/faculty', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'update_image', id: manageFaculty.id, image: base64String }) }); if ((await res.json()).success) { alert("✅ Image updated!"); setManageFaculty({...manageFaculty, image: base64String}); fetchFaculties(); } } catch (err) {} };
  const handleDeleteFaculty = async (id: number) => { if (!window.confirm("Delete this teacher permanently?")) return; try { const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" }); if ((await res.json()).success) { alert("✅ Deleted."); setManageFaculty(null); fetchFaculties(); } } catch (err) {} };
  const handleRecordPayment = async () => { if (!payStudentId || !payAmount || !payPurpose) return alert("❌ Required fields missing!"); setPayLoading("Recording..."); try { const res = await fetch("/api/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: payStudentId, amount: payAmount, payment_purpose: payPurpose, payment_status: payStatus }) }); if ((await res.json()).success) { alert("✅ Recorded!"); setPayStudentId(""); setPayAmount(""); setPayPurpose(""); fetchPayments(); } } catch (err) {} finally { setPayLoading(""); } };

  // Filters
  const filteredStudentsForPayment = students.filter(std => { const matchClass = payClassFilter ? std.class_name === payClassFilter : true; const matchSearch = paySearchQuery ? std.full_name.toLowerCase().includes(paySearchQuery.toLowerCase()) || std.student_id.toString().includes(paySearchQuery) : true; return matchClass && matchSearch; });
  const filteredStudentsForList = students.filter(std => { const matchClass = studentListClassFilter ? std.class_name === studentListClassFilter : true; const matchSearch = studentListSearch ? std.full_name.toLowerCase().includes(studentListSearch.toLowerCase()) || std.student_id.toString().includes(studentListSearch) : true; return matchClass && matchSearch; });
  const filteredResults = resultsList.filter(res => resultSearchQuery ? res.full_name?.toLowerCase().includes(resultSearchQuery.toLowerCase()) || res.exam_name?.toLowerCase().includes(resultSearchQuery.toLowerCase()) || res.subject_name?.toLowerCase().includes(resultSearchQuery.toLowerCase()) : true);

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 font-medium shadow-sm text-sm";
  const tableNumberBoxClass = "w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-sm transition-all shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const isSeniorClass = ["Class 9", "Class 10", "SSC 2026"].includes(batchClass);
  const availableSubjects = getSubjectsList(batchClass, batchGroup);
  
  // 🔴 UPDATE: স্টুডেন্ট লিস্ট শুধুমাত্র নির্দিষ্ট গ্রুপের জন্য ফিল্টার করা
  const classStudents = students.filter(s => {
    const matchClass = s.class_name === batchClass;
    const matchGroup = (isSeniorClass && batchGroup) ? s.student_group === batchGroup : true;
    return matchClass && matchGroup;
  });

  let calculatedHighestMark = 0;
  classStudents.forEach(std => {
    const marks = batchMarks[std.student_id];
    if (marks && marks.total) {
      const totalNum = Number(marks.total);
      if (totalNum > calculatedHighestMark) calculatedHighestMark = totalNum;
    }
  });

  return (
    <div className="max-w-7xl mx-auto w-full font-sans bg-[#f4f7fc] min-h-screen text-slate-800">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div><h2 className="text-2xl font-black text-slate-800">Admin Portal</h2><p className="text-sm font-medium text-slate-500">Manage Prottoy Academy System</p></div>
        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-6 rounded-xl transition-colors flex items-center gap-2 border border-red-100 shadow-sm active:scale-95 text-sm">🚪 <span className="hidden md:inline">Logout</span></button>
      </div>

      {activeTab !== "dashboard" && (
        <div className="mb-6"><button onClick={() => router.push("?tab=dashboard")} className="px-5 py-2 bg-slate-800 text-white hover:bg-slate-900 font-bold text-sm rounded-xl shadow-sm active:scale-95 transition-all">⬅ Back to Dashboard</button></div>
      )}

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="animate-fade-in">
          <div className="relative bg-[#0f172a] text-white rounded-[2rem] p-8 md:p-12 mb-8 shadow-xl border border-slate-800">
            <div className="relative z-10"><p className="text-blue-400 font-bold tracking-widest mb-2 text-xs uppercase">Overview</p><h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight text-white">Welcome, Admin!</h1><p className="text-slate-400 text-sm md:text-base max-w-xl font-medium">Manage students, faculties, payments, and exam results securely from this portal.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push("/admin?tab=studentsList")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Total Students</h3><p className="text-3xl font-black text-slate-800">{students.length}</p></div>
            <div onClick={() => router.push("/admin?tab=facultyList")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Total Faculty</h3><p className="text-3xl font-black text-slate-800">{faculties.length}</p></div>
            <div onClick={() => router.push("/admin?tab=examResults")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Exam Results</h3><p className="text-lg font-black text-indigo-600 mt-1">Publish & View</p></div>
            <div onClick={() => router.push("/admin?tab=payments")} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"><h3 className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Payments</h3><p className="text-lg font-black text-amber-600 mt-1">{payments.length} Records</p></div>
          </div>
        </div>
      )}

      {/* STUDENTS LIST */}
      {activeTab === "studentsList" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageStudent ? (
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative">
               <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                 <div><h2 className="text-xl font-black text-slate-800">⚙️ Manage Student</h2></div>
                 <button onClick={() => setManageStudent(null)} className="px-5 py-2 bg-slate-100 font-bold text-sm rounded-lg hover:bg-slate-200">Close</button>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                   <h3 className="text-sm font-black tracking-wider text-slate-500 uppercase mb-4">Student Details</h3>
                   <div className="text-sm"><strong>Name:</strong> {manageStudent.full_name}</div>
                   <div className="text-sm"><strong>ID:</strong> {manageStudent.student_id}</div>
                   <div className="text-sm">
                     <strong>Class:</strong> {manageStudent.class_name} 
                     {manageStudent.student_group && <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{manageStudent.student_group}</span>}
                   </div>
                   <div className="text-sm"><strong>Phone:</strong> {manageStudent.phone_number || manageStudent.phone}</div>
                 </div>
                 <div className="space-y-6">
                   <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                     <h3 className="text-sm font-black text-blue-800 mb-3 uppercase">📷 Update Picture</h3>
                     <div className="flex items-center gap-4">
                       {updateStudentImage ? <img src={updateStudentImage} className="w-14 h-14 rounded-full object-cover" /> : manageStudent.profile_image ? <img src={manageStudent.profile_image} className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 bg-blue-100 text-blue-400 rounded-full flex items-center justify-center text-xl">👤</div>}
                       <div className="flex-1 w-full">
                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setUpdateStudentImage)} className="text-xs w-full mb-2" />
                         <button onClick={handleUpdateStudentImageAPI} disabled={isUpdatingImage || !updateStudentImage} className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-bold hover:bg-blue-700">Upload Image</button>
                       </div>
                     </div>
                   </div>
                   <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                     <h3 className="text-sm font-black text-emerald-800 mb-3 uppercase">🔑 Reset Password</h3>
                     <div className="flex gap-3">
                       <input type="text" value={adminResetPass} onChange={(e) => setAdminResetPass(e.target.value)} placeholder="New password..." className="w-full px-4 py-2 rounded-lg border border-emerald-200 text-sm font-medium outline-none" />
                       <button onClick={handleAdminPasswordReset} disabled={isResetting} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">Update</button>
                     </div>
                   </div>
                   <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                     <h3 className="text-sm font-black text-red-800 mb-3 uppercase">🗑️ Danger Zone</h3>
                     <button onClick={() => setShowDeleteModal(true)} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm shadow-sm">Remove Student</button>
                   </div>
                 </div>
               </div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-slate-800">Students List</h1>
                {archivedStudents.length > 0 && (
                  <button onClick={() => setActiveTab("archivedStudents")} className="px-4 py-2 bg-amber-500 text-white font-bold text-sm rounded-lg shadow-sm">♻️ Archive ({archivedStudents.length})</button>
                )}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filter by Class</label>
                    <select value={studentListClassFilter} onChange={(e) => setStudentListClassFilter(e.target.value)} className={inputClass}>
                      <option value="">All Classes</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Search Name / ID</label>
                    <input type="text" value={studentListSearch} onChange={(e) => setStudentListSearch(e.target.value)} placeholder="Type name or ID..." className={inputClass} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr><th className="p-4 font-bold text-slate-500 text-sm">ID</th><th className="p-4 font-bold text-slate-500 text-sm">Name</th><th className="p-4 font-bold text-slate-500 text-sm">Class & Group</th><th className="p-4 font-bold text-slate-500 text-sm text-center">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredStudentsForList.map((student) => (
                      <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-600">{student.student_id}</td>
                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                           {student.profile_image ? <img src={student.profile_image} className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200" /> : <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs">👤</div>}
                           {student.full_name}
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">{student.class_name}</span>
                          {student.student_group && <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold ml-2">{student.student_group}</span>}
                        </td>
                        <td className="p-4 text-center"><button onClick={() => setManageStudent(student)} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs active:scale-95 transition-transform">⚙️ Manage</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ARCHIVED STUDENTS */}
      {activeTab === "archivedStudents" && (
        <div className="animate-fade-in max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-slate-800 mb-1">♻️ Student Archive</h1>
            <button onClick={() => setActiveTab("studentsList")} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-300">⬅ Back to List</button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr><th className="p-4 font-bold text-slate-500">ID</th><th className="p-4 font-bold text-slate-500">Name</th><th className="p-4 font-bold text-slate-500 text-center">Restore</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {archivedStudents.map((student) => (
                  <tr key={student.student_id}>
                    <td className="p-4 font-medium text-slate-500">{student.student_id}</td>
                    <td className="p-4 font-bold text-slate-700">{student.full_name}</td>
                    <td className="p-4 text-center"><button onClick={() => handleRecoverStudent(student.student_id)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs">♻️ Recover</button></td>
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
          <h1 className="text-2xl font-black text-slate-800 mb-6">Register New Student</h1>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-6 rounded-2xl bg-slate-50">
                <p className="text-xs font-bold text-slate-500 mb-4 text-center uppercase tracking-wider">Profile Image</p>
                {studentImage ? <img src={studentImage} className="w-28 h-28 object-cover rounded-full shadow-sm mb-4 border-2 border-white" /> : <div className="w-28 h-28 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">📷</div>}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setStudentImage)} className="text-xs w-full" />
              </div>
              <div className="md:col-span-2 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Student Name" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Father's Name</label><input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" className={inputClass} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mother's Name</label><input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" className={inputClass} /></div>
                </div>
                
                {/* 🔴 UPDATE: Added Group Field (Conditional) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className={["Class 9", "Class 10", "SSC 2026"].includes(className) ? "md:col-span-1" : "md:col-span-2"}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class *</label>
                    <select value={className} onChange={(e) => { setClassName(e.target.value); setStudentGroup(""); }} className={inputClass}>
                      <option value="">Select Class</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                    </select>
                  </div>
                  {["Class 9", "Class 10", "SSC 2026"].includes(className) && (
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Group *</label>
                      <select value={studentGroup} onChange={(e) => setStudentGroup(e.target.value)} className={inputClass}>
                        <option value="">Select Group</option>
                        {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  )}
                  <div className={["Class 9", "Class 10", "SSC 2026"].includes(className) ? "md:col-span-1" : "md:col-span-1"}>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number *</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXXX" className={inputClass} />
                  </div>
                </div>

                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address details" className={inputClass} /></div>
                <button onClick={handleRegisterStudent} disabled={!!loadingMsg} className="w-full py-3 mt-2 bg-slate-800 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-slate-900 transition-colors">
                  {loadingMsg ? loadingMsg : "Register Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 BATCH EXAM RESULTS ENTRY */}
      {activeTab === "examResults" && (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-black text-slate-800 mb-6">Exam Results Management</h1>
          <div className="flex flex-wrap gap-3 mb-6 bg-white p-2 rounded-xl shadow-sm border border-slate-200 inline-flex">
            <button onClick={() => {setResultTab("publish"); setManageResult(null);}} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${resultTab === "publish" ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>📝 Class Wise Entry</button>
            <button onClick={() => {setResultTab("manage"); setManageResult(null);}} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${resultTab === "manage" ? 'bg-slate-800 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-50'}`}>📋 Manage Results</button>
          </div>

          {/* 🟢 PUBLISH TAB */}
          {resultTab === "publish" && (
            <div className="bg-[#f8fafc] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Exam Name *</label><select value={batchExamName} onChange={(e) => setBatchExamName(e.target.value)} className={inputClass}><option value="">-- Select Exam --</option>{EXAM_NAMES.map(ex => <option key={ex} value={ex}>{ex}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Class *</label><select value={batchClass} onChange={(e) => { setBatchClass(e.target.value); setBatchSubject(""); setBatchGroup(""); }} className={inputClass}><option value="">-- Select Class --</option>{CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}</select></div>
                {isSeniorClass && (<div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Group *</label><select value={batchGroup} onChange={(e) => { setBatchGroup(e.target.value); setBatchSubject(""); }} className={inputClass}><option value="">-- Select Group --</option>{GROUPS.map(grp => <option key={grp} value={grp}>{grp}</option>)}</select></div>)}
                
                <div className={isSeniorClass ? "md:col-span-3 lg:col-span-3" : "md:col-span-1"}>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subject *</label>
                  <select 
                    value={batchSubject} 
                    onChange={(e) => setBatchSubject(e.target.value)} 
                    className={inputClass} 
                  >
                    <option value="">
                      {!batchClass 
                        ? "-- Select Class First --" 
                        : (isSeniorClass && !batchGroup) 
                          ? "-- Select Group First --" 
                          : "-- Select Subject --"}
                    </option>
                    {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-slate-200">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center">
                  <label className="block text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider">Total Full Marks *</label>
                  <input type="number" value={batchFullMarks} onChange={(e) => { let val = Number(e.target.value); if (val < 0) val = 0; if (val > 1000) val = 1000; setBatchFullMarks(val); }} className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/30 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-blue-700 font-bold text-xl shadow-inner" />
                </div>
                <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-center">
                  <label className="block text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">Highest Marks (Auto)</label>
                  <input type="text" readOnly value={calculatedHighestMark > 0 ? calculatedHighestMark : ""} placeholder="Auto Calculated" className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-100/30 outline-none text-emerald-700 font-bold text-xl shadow-inner placeholder:text-emerald-400" />
                </div>
              </div>

              {batchClass && batchSubject && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm bg-white">
                  <div className="bg-slate-800 text-white p-5 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg tracking-wide">{batchClass} {batchGroup && `- ${batchGroup}`}</h3>
                      <p className="text-xs text-slate-300 font-medium mt-1">Provide marks for {batchSubject}</p>
                    </div>
                    <div className="bg-slate-700/50 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-600">
                      Students: {classStudents.length}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Student Info</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">CQ</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">MCQ</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">PR</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-28 text-center">Total</th>
                          <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider w-24 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {classStudents.map((std) => {
                          const marks = batchMarks[std.student_id] || { cq: "", mcq: "", pr: "", total: "" };
                          const totalNum = Number(marks.total) || 0;
                          const { grade } = calculateGradeInfo(totalNum, batchFullMarks);

                          return (
                            <tr key={std.student_id} className={`hover:bg-slate-50 transition-colors`}>
                              <td className="p-4">
                                <div className="font-bold text-slate-800 text-sm">{std.full_name}</div>
                                <div className="text-xs font-medium text-slate-500 mt-0.5">ID: {std.student_id}</div>
                              </td>
                              <td className="p-4"><input type="number" value={marks.cq} onChange={(e) => handleBatchMarkChange(std.student_id, "cq", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><input type="number" value={marks.mcq} onChange={(e) => handleBatchMarkChange(std.student_id, "mcq", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4"><input type="number" value={marks.pr} onChange={(e) => handleBatchMarkChange(std.student_id, "pr", e.target.value)} placeholder="0" className={tableNumberBoxClass} /></td>
                              <td className="p-4">
                                <div className={`w-full py-2 text-center rounded-lg font-bold text-sm border bg-slate-50 text-slate-700 border-slate-200`}>{marks.total || "-"}</div>
                              </td>
                              <td className="p-4">
                                <div className={`w-full py-2 text-center rounded-lg font-bold text-sm border ${marks.total === "" ? 'bg-transparent text-slate-300 border-transparent' : grade === 'F' ? 'text-red-600 border-red-100 bg-red-50/50' : 'text-emerald-600 border-emerald-100 bg-emerald-50/50'}`}>{marks.total ? grade : "-"}</div>
                              </td>
                            </tr>
                          );
                        })}
                        {classStudents.length === 0 && <tr><td colSpan={6} className="p-12 text-center font-bold text-sm text-slate-400">No students found in this group.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button onClick={handlePublishBatchResult} disabled={!!resultLoading || classStudents.length === 0} className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md text-base transition-all disabled:opacity-50">
                {resultLoading ? resultLoading : "🏆 Save & Publish Batch Result"}
              </button>
            </div>
          )}

          {/* 🟢 MANAGE TAB */}
          {resultTab === "manage" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6">
              
              {manageResult ? (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                    <h3 className="text-xl font-black text-slate-800">⚙️ Edit Result</h3>
                    <button onClick={() => setManageResult(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg text-sm hover:bg-slate-300">Close</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Student</p>
                      <p className="text-lg font-black text-slate-800">{manageResult.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subject & Exam</p>
                      <p className="text-lg font-black text-slate-800">{manageResult.subject_name} <span className="text-sm font-medium text-slate-500">({manageResult.exam_name})</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">CQ</label><input type="number" value={editResultData.cq} onChange={(e) => handleEditResultMarkChange('cq', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">MCQ</label><input type="number" value={editResultData.mcq} onChange={(e) => handleEditResultMarkChange('mcq', e.target.value)} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 mb-2">PR</label><input type="number" value={editResultData.pr} onChange={(e) => handleEditResultMarkChange('pr', e.target.value)} className={inputClass} /></div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2">Total / {manageResult.full_marks}</label>
                      <input type="text" readOnly value={editResultData.total} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 font-bold text-center text-slate-700 outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleUpdateSingleResult} disabled={isUpdatingResult} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-sm hover:bg-blue-700">{isUpdatingResult ? "Saving..." : "💾 Save Changes"}</button>
                    <button onClick={() => handleDeleteResult(manageResult.id)} className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-colors">🗑️ Delete</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <input type="text" value={resultSearchQuery} onChange={(e) => setResultSearchQuery(e.target.value)} placeholder="🔍 Search by student name, exam or subject..." className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium" />
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full text-left border-collapse text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Student</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Exam Details</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Marks</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Grade</th>
                          <th className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredResults.map((resItem: any) => (
                          <tr key={resItem.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-800">{resItem.full_name}</div>
                              <div className="text-xs text-slate-500 mt-1">ID: {resItem.student_id} | {resItem.class_name}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-slate-700">{resItem.subject_name}</div>
                              <div className="text-xs text-blue-600 font-medium mt-1">{resItem.exam_name}</div>
                            </td>
                            <td className="p-4 text-center font-black text-slate-700">{resItem.total} <span className="text-xs text-slate-400 font-normal">/ {resItem.full_marks}</span></td>
                            <td className="p-4 text-center"><span className={`px-3 py-1 rounded-md text-xs font-bold ${resItem.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{resItem.grade}</span></td>
                            <td className="p-4 text-center">
                              <button onClick={() => openManageResultModal(resItem)} className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-900 active:scale-95 transition-transform">⚙️ Manage</button>
                            </td>
                          </tr>
                        ))}
                        {filteredResults.length === 0 && <tr><td colSpan={5} className="p-10 text-center font-bold text-slate-400">No results found!</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* FACULTY MANAGEMENT */}
      {activeTab === "facultyList" && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          {manageFaculty ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 relative">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div><h2 className="text-xl font-black text-slate-800">⚙️ Manage Faculty</h2></div>
                <button onClick={() => setManageFaculty(null)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-sm rounded-lg">Close</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Profile Image</h3>
                  {manageFaculty.image ? <img src={manageFaculty.image} className="w-32 h-32 object-cover rounded-full shadow-sm mb-4 border-2 border-white" /> : <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">👨‍🏫</div>}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, handleUpdateFacultyImageAPI)} className="text-xs w-full text-center" />
                </div>

                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label><input type="text" value={manageFaculty.name} onChange={(e) => setManageFaculty({...manageFaculty, name: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Designation</label><input type="text" value={manageFaculty.designation} onChange={(e) => setManageFaculty({...manageFaculty, designation: e.target.value})} className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Education</label><input type="text" value={manageFaculty.education} onChange={(e) => setManageFaculty({...manageFaculty, education: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subjects</label><input type="text" value={manageFaculty.subjects} onChange={(e) => setManageFaculty({...manageFaculty, subjects: e.target.value})} className={inputClass} /></div>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Experience</label><input type="text" value={manageFaculty.experience} onChange={(e) => setManageFaculty({...manageFaculty, experience: e.target.value})} className={inputClass} /></div>
                  
                  <div className="flex gap-4 pt-4 border-t border-slate-100 mt-2">
                    <button onClick={handleUpdateFacultyDetails} disabled={isUpdatingFaculty} className="flex-1 py-3 bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm hover:bg-slate-900">{isUpdatingFaculty ? "Saving..." : "💾 Save Changes"}</button>
                    <button onClick={() => handleDeleteFaculty(manageFaculty.id)} className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-bold text-sm rounded-xl">🗑️ Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-slate-800 mb-6">Faculty Management</h1>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8 max-w-4xl">
                <h3 className="text-lg font-black text-slate-700 mb-6 border-b border-slate-100 pb-4">+ Add New Teacher</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">Profile Image</p>
                    {fImage ? <img src={fImage} className="w-24 h-24 object-cover rounded-full shadow-sm mb-4 border-2 border-white" /> : <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-3xl mb-4">👨‍🏫</div>}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setFImage)} className="text-xs w-full" />
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
                    <button onClick={handleRegisterFaculty} disabled={!!loadingMsg} className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm">{loadingMsg ? loadingMsg : "Register Teacher"}</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {faculties.map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                    <div className="w-full aspect-square bg-slate-50 relative p-4">
                      <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-200" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col bg-white">
                      <h3 className="text-lg font-black text-slate-800 mb-1">{teacher.name}</h3>
                      <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-4">{teacher.designation}</p>
                      <div className="text-xs text-slate-500 space-y-2 mb-6 font-medium">
                        <p>🎓 {teacher.education}</p>
                        <p>⏳ {teacher.experience}</p>
                        <p>📚 <span className="text-slate-700 font-bold">{teacher.subjects}</span></p>
                      </div>
                      <button onClick={() => setManageFaculty(teacher)} className="mt-auto w-full py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors">
                        ⚙️ Manage
                      </button>
                    </div>
                  </div>
                ))}
                {faculties.length === 0 && <p className="col-span-full text-center text-slate-400 font-bold p-10 text-sm">No teachers found in the database.</p>}
              </div>
            </>
          )}
        </div>
      )}

      {/* PAYMENTS SECTION */}
      {activeTab === "payments" && (
        <div className="animate-fade-in max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-slate-800 mb-6">Student Payments Management</h1>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-black text-slate-700 border-b border-slate-100 pb-4 mb-5">+ Record Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student *</label>
                <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} className={inputClass}>
                  <option value="">-- Choose --</option>
                  {filteredStudentsForPayment.map(std => (<option key={std.student_id} value={std.student_id}>{std.full_name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount (৳) *</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Purpose *</label>
                <input type="text" value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} placeholder="Fee / Fine" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status *</label>
                <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className={inputClass}>
                  <option value="Paid">Paid</option><option value="Pending">Pending</option>
                </select>
              </div>
              <div className="lg:col-span-4 mt-2"><button type="button" onClick={handleRecordPayment} disabled={!!payLoading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors w-full md:w-auto">💾 Record Payment</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[#f4f7fc] text-blue-600 font-bold text-lg animate-pulse">Loading Admin Portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}