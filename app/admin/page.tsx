"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
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

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState(urlTab || "dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]); 
  const [loadingMsg, setLoadingMsg] = useState("");

  // URL চেঞ্জ হলে ট্যাব অটোমেটিক চেঞ্জ হবে
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

  // Faculty states
  const [fName, setFName] = useState("");
  const [fDesignation, setFDesignation] = useState("");
  const [fEducation, setFEducation] = useState("");
  const [fSubjects, setFSubjects] = useState("");
  const [fExperience, setFExperience] = useState("");
  const [fImage, setFImage] = useState("");

  // Payment states
  const [payClassFilter, setPayClassFilter] = useState("");
  const [paySearchQuery, setPaySearchQuery] = useState("");
  const [payStudentId, setPayStudentId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payPurpose, setPayPurpose] = useState("");
  const [payStatus, setPayStatus] = useState("Paid");
  const [payLoading, setPayLoading] = useState("");

  // Exam Result States
  const [resultTab, setResultTab] = useState("publish");
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [resultStudentId, setResultStudentId] = useState("");
  const [examName, setExamName] = useState("");
  const [subjects, setSubjects] = useState([{ name: "", fullMarks: 100, obtained: "" }]);
  const [resultLoading, setResultLoading] = useState("");
  const [editResultData, setEditResultData] = useState<any>(null);

  const handleAddSubject = () => setSubjects([...subjects, { name: "", fullMarks: 100, obtained: "" }]);
  const handleRemoveSubject = (index: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects.splice(index, 1);
    setSubjects(updatedSubjects);
  };

  const handleEditAddSubject = () => {
    if(!editResultData) return;
    setEditResultData({
      ...editResultData,
      subjects: [...editResultData.subjects, { name: "", fullMarks: 100, obtained: "" }]
    });
  };

  const handleEditRemoveSubject = (index: number) => {
    if(!editResultData) return;
    const updatedSubjects = [...editResultData.subjects];
    updatedSubjects.splice(index, 1);
    setEditResultData({ ...editResultData, subjects: updatedSubjects });
  };

  const handlePublishResult = async () => {
    if (!resultStudentId || !examName || subjects.length === 0) return alert("❌ Required: Student, Exam Name, and at least one Subject!");
    setResultLoading("Publishing...");
    try {
      const res = await fetch("/api/results", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: resultStudentId, exam_name: examName, subjects: JSON.stringify(subjects) }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Result Published Successfully!");
        setResultStudentId(""); setExamName(""); setSubjects([{ name: "", fullMarks: 100, obtained: "" }]);
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

  const handleUpdateResult = async () => {
    if (!editResultData.exam_name || editResultData.subjects.length === 0) return alert("❌ Required: Exam Name, and at least one Subject!");
    try {
      const res = await fetch("/api/results", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editResultData.id || editResultData.result_id, exam_name: editResultData.exam_name, subjects: JSON.stringify(editResultData.subjects) }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Result Updated Successfully!");
        setEditResultData(null); fetchResults();
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to update result!"); }
  };

  const fetchStudents = () => {
    fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStudents(data.data); });
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

  useEffect(() => { fetchStudents(); fetchFaculties(); fetchPayments(); fetchResults(); }, []);

  const handleLogout = () => { window.location.href = "/"; };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ " + result.message); fetchStudents(); } 
      else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to delete student."); }
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

  const getStudentInfo = (id: any) => {
    const s = students.find(st => st.student_id == id);
    return s ? `${s.full_name} (${s.class_name})` : `ID: ${id}`;
  };

  const parseSubjectsSafe = (data: any) => {
    if (!data) return [];
    let parsedData = data;
    try {
      if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
      if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
    } catch (e) {}
    if (typeof parsedData === 'string' && parsedData.includes('[object Object]')) return []; 
    if (Array.isArray(parsedData)) {
      return parsedData.map(item => {
        if (typeof item === 'string') {
          try { return JSON.parse(item); } catch(e) { return null; }
        }
        return item;
      }).filter(Boolean);
    }
    if (typeof parsedData === 'object' && parsedData !== null) return Object.values(parsedData);
    return [];
  };

  // Tailwind Input Class Reusable
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 text-gray-800 font-medium";

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Top Header with Logout */}
      <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-sm text-gray-500">Manage Prottoy Academy System</p>
        </div>
        <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2">
          🚪 <span className="hidden md:inline">Logout</span>
        </button>
      </div>

      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, Admin!</h1>
          <p className="text-gray-500 mb-8">Overview of your academy</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => router.push("/admin?tab=studentsList")} className="bg-white p-6 rounded-2xl border-l-8 border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <h3 className="text-gray-500 font-semibold mb-2 flex items-center gap-2">📚 Total Students</h3>
              <p className="text-4xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div onClick={() => router.push("/admin?tab=facultyList")} className="bg-white p-6 rounded-2xl border-l-8 border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <h3 className="text-gray-500 font-semibold mb-2 flex items-center gap-2">👨‍🏫 Total Faculty</h3>
              <p className="text-4xl font-bold text-gray-900">{faculties.length}</p>
            </div>
            <div onClick={() => router.push("/admin?tab=classLecture")} className="bg-white p-6 rounded-2xl border-l-8 border-red-500 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <h3 className="text-gray-500 font-semibold mb-2 flex items-center gap-2">🎥 Class Lectures</h3>
              <p className="text-xl font-bold text-red-500 mt-2">Prottoy Academy</p>
            </div>
            <div onClick={() => router.push("/admin?tab=payments")} className="bg-white p-6 rounded-2xl border-l-8 border-amber-500 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <h3 className="text-gray-500 font-semibold mb-2 flex items-center gap-2">💳 Payments</h3>
              <p className="text-xl font-bold text-amber-500 mt-2">{payments.length} Records</p>
            </div>
          </div>
        </div>
      )}

      {/* FACULTY MANAGEMENT */}
      {activeTab === "facultyList" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Management</h1>
          <p className="text-gray-500 mb-8">View and register teachers.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {faculties.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 flex flex-col transition-all">
                <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
                  <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} className="w-full h-full object-cover" />
                  {(teacher.id === 901 || teacher.id === 902) && (
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">★ Core Member</span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h3>
                  <p className="text-indigo-600 font-semibold text-sm mb-4">{teacher.designation}</p>
                  <div className="text-sm text-gray-600 space-y-2 mb-6">
                    <p>🎓 <span className="font-medium">Edu:</span> {teacher.education}</p>
                    <p>⏳ <span className="font-medium">Exp:</span> {teacher.experience}</p>
                    <p>📚 <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold text-xs">{teacher.subjects}</span></p>
                  </div>
                  {(teacher.id === 901 || teacher.id === 902) ? (
                    <button disabled className="mt-auto w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed">Protected</button>
                  ) : (
                    <button onClick={() => handleDeleteFaculty(teacher.id)} className="mt-auto w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors">🗑️ Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-4xl">
            <h3 className="text-xl font-bold text-emerald-600 border-b border-gray-100 pb-4 mb-6">+ Register New Teacher</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Teacher Name *</label><input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Md. Rashedul Islam" className={inputClass} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Designation *</label><input type="text" value={fDesignation} onChange={(e) => setFDesignation(e.target.value)} placeholder="e.g. Guest Lecturer" className={inputClass} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Educational Details</label><input type="text" value={fEducation} onChange={(e) => setFEducation(e.target.value)} placeholder="e.g. B.Sc in CSE" className={inputClass} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Teaching Subjects *</label><input type="text" value={fSubjects} onChange={(e) => setFSubjects(e.target.value)} placeholder="e.g. Higher Math" className={inputClass} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label><input type="text" value={fExperience} onChange={(e) => setFExperience(e.target.value)} placeholder="e.g. 2+ Years" className={inputClass} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Image Link (Optional)</label><input type="text" value={fImage} onChange={(e) => setFImage(e.target.value)} placeholder="https://..." className={inputClass} /></div>
              <div className="md:col-span-2 mt-2">
                <button type="button" onClick={handleRegisterFaculty} disabled={!!loadingMsg} className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                  {loadingMsg ? loadingMsg : "💾 Save Teacher Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT */}
      {activeTab === "addNewStudent" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Register New Student</h1>
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-2xl">
            <div className="space-y-6">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Student Full Name *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className={inputClass} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label><input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" className={inputClass} /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label><input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                  <select value={className} onChange={(e) => setClassName(e.target.value)} className={inputClass}>
                    <option value="">Select Class</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Login ID) *</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXX" className={inputClass} /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, Thana, District" className={inputClass} /></div>
              <button type="button" onClick={handleRegisterStudent} disabled={!!loadingMsg} className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                {loadingMsg ? loadingMsg : "Register Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS LIST */}
      {activeTab === "studentsList" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Detailed Students List</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Name</th>
                    <th className="p-4 font-semibold text-gray-600">Class</th>
                    <th className="p-4 font-semibold text-gray-600">Phone</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => (
                    <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">{student.full_name}</td>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">{student.class_name}</span></td>
                      <td className="p-4 text-gray-600">{student.phone_number}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeleteStudent(student.student_id)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {students.length === 0 && <p className="text-center text-gray-500 p-8">No students found.</p>}
          </div>
        </div>
      )}

      {/* EXAM RESULTS */}
      {activeTab === "examResults" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-blue-700 mb-6">Exam Results Management</h1>
          <div className="flex flex-wrap gap-4 mb-8">
            <button onClick={() => { setResultTab("publish"); setEditResultData(null); }} className={`px-6 py-3 rounded-xl font-bold transition-all ${resultTab === "publish" ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>+ Publish New Result</button>
            <button onClick={() => { setResultTab("manage"); setEditResultData(null); }} className={`px-6 py-3 rounded-xl font-bold transition-all ${resultTab === "manage" ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>📋 View & Manage Results</button>
          </div>

          {resultTab === "publish" && !editResultData && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class *</label>
                  <select className={inputClass} onChange={(e) => setPayClassFilter(e.target.value)}>
                    <option value="">All Classes</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student *</label>
                  <select value={resultStudentId} onChange={(e) => setResultStudentId(e.target.value)} className={inputClass}>
                    <option value="">-- Choose Student --</option>
                    {students.filter(std => payClassFilter ? std.class_name === payClassFilter : true).map(std => (
                      <option key={std.student_id} value={std.student_id}>{std.full_name} ({std.class_name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Name *</label>
                  <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Model Test 1" className={inputClass} />
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-blue-600">Subject Marks</h3>
                  <button onClick={handleAddSubject} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors">+ Add Subject</button>
                </div>
                {subjects.map((sub, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 mb-4 items-end">
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Subject Name</label>
                      <input type="text" value={sub.name} onChange={(e) => { const newSubs = [...subjects]; newSubs[index].name = e.target.value; setSubjects(newSubs); }} placeholder="e.g. বাংলা ১ম পত্র" className={inputClass} />
                    </div>
                    <div className="w-full md:w-1/4">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Full Marks</label>
                      <input type="number" value={sub.fullMarks} onChange={(e) => { const newSubs = [...subjects]; newSubs[index].fullMarks = Number(e.target.value); setSubjects(newSubs); }} className={inputClass} />
                    </div>
                    <div className="w-full md:w-1/4">
                      <label className="block text-xs font-bold text-red-500 mb-1">Obtained</label>
                      <input type="number" value={sub.obtained} onChange={(e) => { const newSubs = [...subjects]; newSubs[index].obtained = e.target.value; setSubjects(newSubs); }} placeholder="Marks" className={inputClass} />
                    </div>
                    {subjects.length > 1 && (
                      <button onClick={() => handleRemoveSubject(index)} className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200">X</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handlePublishResult} disabled={!!resultLoading} className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                {resultLoading ? resultLoading : "🏆 Publish Result to Database"}
              </button>
            </div>
          )}

          {resultTab === "manage" && !editResultData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-semibold text-gray-600">Student</th>
                      <th className="p-4 font-semibold text-gray-600">Exam Name</th>
                      <th className="p-4 font-semibold text-gray-600">Subjects & Marks</th>
                      <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resultsList.map((resItem: any, index: number) => {
                      const resId = resItem.id || resItem.result_id;
                      const subs = parseSubjectsSafe(resItem.subjects);
                      const totalMarks = subs.reduce((acc: number, curr: any) => acc + Number(curr.fullMarks || 0), 0);
                      const obtainedMarks = subs.reduce((acc: number, curr: any) => acc + Number(curr.obtained || 0), 0);
                      const studentInfo = resItem.full_name ? `${resItem.full_name} (${resItem.class_name})` : getStudentInfo(resItem.student_id);

                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-semibold text-gray-900">{studentInfo}</td>
                          <td className="p-4 font-bold text-gray-600">{resItem.exam_name}</td>
                          <td className="p-4 text-gray-600">
                            {subs.length > 0 ? (
                              <ul className="list-disc pl-5 mb-2 text-sm space-y-1">
                                {subs.map((s: any, i: number) => (
                                  <li key={i}><strong>{s.name || 'Unknown'}:</strong> {s.obtained || 0} / {s.fullMarks || 100}</li>
                                ))}
                              </ul>
                            ) : <span className="text-red-500 text-sm">Data format error</span>}
                            {subs.length > 0 && <span className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-sm font-bold border border-emerald-100 mt-2">Total: {obtainedMarks} / {totalMarks}</span>}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => setEditResultData({ ...resItem, subjects: subs.length > 0 ? subs : [{ name: "", fullMarks: 100, obtained: "" }] })} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100">Edit</button>
                              <button onClick={() => handleDeleteResult(resId)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100">Delete</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {resultsList.length === 0 && <p className="text-center text-gray-500 p-8">No results published yet.</p>}
            </div>
          )}

          {editResultData && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 max-w-4xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-500">✏️ Edit Exam Result</h2>
                <button onClick={() => setEditResultData(null)} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
              <div className="mb-6">
                <p className="font-bold text-gray-500 mb-4">Student: <span className="text-gray-900">{editResultData.full_name || getStudentInfo(editResultData.student_id)}</span></p>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Name *</label>
                <input type="text" value={editResultData.exam_name} onChange={(e) => setEditResultData({...editResultData, exam_name: e.target.value})} className={inputClass} />
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-blue-600">Subject Marks</h3>
                  <button onClick={handleEditAddSubject} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors">+ Add Subject</button>
                </div>
                {editResultData.subjects.map((sub: any, index: number) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 mb-4 items-end">
                    <div className="w-full md:w-1/2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Subject Name</label>
                      <input type="text" value={sub.name} onChange={(e) => { const newSubs = [...editResultData.subjects]; newSubs[index].name = e.target.value; setEditResultData({...editResultData, subjects: newSubs}); }} className={inputClass} />
                    </div>
                    <div className="w-full md:w-1/4">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Full Marks</label>
                      <input type="number" value={sub.fullMarks} onChange={(e) => { const newSubs = [...editResultData.subjects]; newSubs[index].fullMarks = Number(e.target.value); setEditResultData({...editResultData, subjects: newSubs}); }} className={inputClass} />
                    </div>
                    <div className="w-full md:w-1/4">
                      <label className="block text-xs font-bold text-red-500 mb-1">Obtained</label>
                      <input type="number" value={sub.obtained} onChange={(e) => { const newSubs = [...editResultData.subjects]; newSubs[index].obtained = e.target.value; setEditResultData({...editResultData, subjects: newSubs}); }} className={inputClass} />
                    </div>
                    {editResultData.subjects.length > 1 && (
                      <button onClick={() => handleEditRemoveSubject(index)} className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200">X</button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleUpdateResult} className="w-full mt-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all">💾 Save Updated Result</button>
            </div>
          )}
        </div>
      )}

      {/* PAYMENTS SECTION */}
      {activeTab === "payments" && (
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Payments Management</h1>
          
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 max-w-5xl">
            <h3 className="text-xl font-bold text-blue-600 border-b border-gray-100 pb-4 mb-6">+ Record New Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">🔍 1. Filter by Class</label>
                <select value={payClassFilter} onChange={(e) => { setPayClassFilter(e.target.value); setPayStudentId(""); }} className={inputClass}>
                  <option value="">All Classes</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">🔍 2. Search Name / ID</label>
                <input type="text" value={paySearchQuery} onChange={(e) => { setPaySearchQuery(e.target.value); setPayStudentId(""); }} placeholder="Type student name or ID..." className={inputClass} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">3. Select Student *</label>
                <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} className={inputClass}>
                  <option value="">-- Choose Student --</option>
                  {filteredStudentsForPayment.map(std => (
                    <option key={std.student_id} value={std.student_id}>{std.full_name} (ID: {std.student_id})</option>
                  ))}
                </select>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Amount (৳) *</label><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 1500" className={inputClass} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Payment Purpose *</label><input type="text" value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} placeholder="e.g. June Monthly Fee" className={inputClass} /></div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} className={inputClass}>
                  <option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Partial">Partial</option>
                </select>
              </div>
              <div className="lg:col-span-4 mt-2">
                <button type="button" onClick={handleRecordPayment} disabled={!!payLoading} className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                  {payLoading ? payLoading : "💾 Record Payment"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Student Name</th>
                    <th className="p-4 font-semibold text-gray-600">Class</th>
                    <th className="p-4 font-semibold text-gray-600">Amount</th>
                    <th className="p-4 font-semibold text-gray-600">Purpose</th>
                    <th className="p-4 font-semibold text-gray-600">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length > 0 ? payments.map((payment: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">{payment.full_name}</td>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">{payment.class_name}</span></td>
                      <td className="p-4 font-bold text-emerald-600">{payment.amount} ৳</td>
                      <td className="p-4 text-gray-600">{payment.payment_purpose}</td>
                      <td className="p-4 text-gray-600 text-sm">{payment.payment_date ? payment.payment_date.substring(0, 10) : ''}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${payment.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {payment.payment_status}
                        </span>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6} className="p-8 text-center text-gray-500">No payment records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CLASS LECTURES */}
      {activeTab === "classLecture" && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 animate-fade-in max-w-3xl mx-auto mt-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🎥 Class Lectures</h1>
          <p className="text-lg text-gray-500 mb-8">Watch all recorded classes and tutorials from our official channel.</p>
          <a href="https://www.youtube.com/@DreamUpAcademy" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-md">
            ▶️ Go to DreamUp Academy YouTube
          </a>
        </div>
      )}
    </div>
  );
}

// Next.js SearchParams requires Suspense wrapper
export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-blue-600 font-bold text-xl animate-pulse">Loading Admin Portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}