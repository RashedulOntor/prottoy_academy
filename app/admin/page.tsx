"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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

export default function AdminDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]); 
  const [loadingMsg, setLoadingMsg] = useState("");

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

  // --- Exam Result States ---
  const [resultTab, setResultTab] = useState("publish"); // 'publish' or 'manage'
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [resultStudentId, setResultStudentId] = useState("");
  const [examName, setExamName] = useState("");
  const [subjects, setSubjects] = useState([{ name: "", fullMarks: 100, obtained: "" }]);
  const [resultLoading, setResultLoading] = useState("");
  const [editResultData, setEditResultData] = useState<any>(null); // For editing

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "", fullMarks: 100, obtained: "" }]);
  };

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
    if (!resultStudentId || !examName || subjects.length === 0) {
      return alert("❌ Required: Student, Exam Name, and at least one Subject!");
    }
    
    setResultLoading("Publishing...");
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: resultStudentId,
          exam_name: examName,
          // 🔴 FIX: JSON.stringify করা হলো যাতে ডেটাবেসে [object Object] সেভ না হয়
          subjects: JSON.stringify(subjects) 
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Result Published Successfully!");
        setResultStudentId(""); setExamName(""); 
        setSubjects([{ name: "", fullMarks: 100, obtained: "" }]);
        fetchResults(); // Refresh list automatically
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Failed to publish result!");
    } finally {
      setResultLoading("");
    }
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
    if (!editResultData.exam_name || editResultData.subjects.length === 0) {
      return alert("❌ Required: Exam Name, and at least one Subject!");
    }
    try {
      const res = await fetch("/api/results", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editResultData.id || editResultData.result_id,
          exam_name: editResultData.exam_name,
          // 🔴 FIX: এখানেও Stringify করা হলো
          subjects: JSON.stringify(editResultData.subjects)
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Result Updated Successfully!");
        setEditResultData(null);
        fetchResults();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Failed to update result!");
    }
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
        if (data.success) {
          setFaculties([...coreMembers, ...otherFoundingTeachers, ...data.data]); 
        } else {
          setFaculties([...coreMembers, ...otherFoundingTeachers]);
        }
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
    fetchFaculties();
    fetchPayments();
    fetchResults();
  }, []);

  useEffect(() => {
    if (activeTab === "studentsList" || activeTab === "dashboard" || activeTab === "examResults") fetchStudents();
    if (activeTab === "facultyList" || activeTab === "dashboard") fetchFaculties();
    if (activeTab === "payments" || activeTab === "dashboard") fetchPayments();
    if (activeTab === "examResults") fetchResults();
  }, [activeTab]);

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
        fetchStudents(); setActiveTab("studentsList");
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
    if (id === 901 || id === 902) {
      alert("⚠️ This is a Core Founding Member (CEO/MD)! You cannot delete them.");
      return;
    }
    
    if (id >= 903 && id <= 905) {
      if (!window.confirm("Are you sure you want to delete this founding teacher?")) return;
      setFaculties(faculties.filter(f => f.id !== id));
      alert("✅ Teacher removed from the list.");
      return;
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
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          student_id: payStudentId, 
          amount: payAmount, 
          payment_purpose: payPurpose, 
          payment_status: payStatus 
        }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Payment recorded successfully!");
        setPayStudentId(""); setPayAmount(""); setPayPurpose(""); setPayStatus("Paid"); setPaySearchQuery("");
        fetchPayments(); 
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to record payment! Make sure your server is running properly."); } 
    finally { setPayLoading(""); }
  };

  const switchTab = (tabName: string) => { setActiveTab(tabName); };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px',
    color: '#000000', fontWeight: '500', backgroundColor: '#ffffff', outline: 'none'
  };

  const filteredStudentsForPayment = students.filter(std => {
    const matchClass = payClassFilter ? std.class_name === payClassFilter : true;
    const matchSearch = paySearchQuery ? 
      std.full_name.toLowerCase().includes(paySearchQuery.toLowerCase()) || 
      std.student_id.toString().includes(paySearchQuery) 
      : true;
    return matchClass && matchSearch;
  });

  const getStudentInfo = (id: any) => {
    const s = students.find(st => st.student_id == id);
    return s ? `${s.full_name} (${s.class_name})` : `ID: ${id}`;
  };

  // 🔴 FIX: সহজ এবং শক্তিশালী JSON পার্সার যা সব ধরনের ডেটা রিড করতে পারবে
  const parseSubjectsSafe = (data: any) => {
    if (!data) return [];
    
    let parsedData = data;
    
    // বারবার স্ট্রিং পার্স করার চেষ্টা করবে
    try {
      if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
      if (typeof parsedData === 'string') parsedData = JSON.parse(parsedData);
    } catch (e) {
      // পার্স করতে না পারলে যা আছে তাই থাকবে
    }

    // ডেটাবেসে আগে থেকে নষ্ট হয়ে থাকা ডেটা হলে বাদ দিয়ে দিবে
    if (typeof parsedData === 'string' && parsedData.includes('[object Object]')) {
      return []; 
    }

    // যদি সঠিকভাবে Array হিসেবে ডেটা পায়
    if (Array.isArray(parsedData)) {
      return parsedData.map(item => {
        if (typeof item === 'string') {
          try { return JSON.parse(item); } catch(e) { return null; }
        }
        return item;
      }).filter(Boolean);
    }

    // যদি Object হিসেবে থাকে (যেমন: { "0": {...}, "1": {...} })
    if (typeof parsedData === 'object' && parsedData !== null) {
      return Object.values(parsedData);
    }

    return [];
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Section */}
      <div style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #374151', paddingBottom: '15px' }}>
          <Image src="/prottoy academy logo.png" alt="Logo" width={45} height={45} style={{ borderRadius: '6px', objectFit: 'cover' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Prottoy Academy</h2>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li onClick={() => switchTab("dashboard")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "dashboard" ? '#374151' : 'transparent', borderRadius: '5px' }}>📊 Dashboard</li>
          <li onClick={() => switchTab("studentsList")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "studentsList" ? '#374151' : 'transparent', borderRadius: '5px' }}>👨‍🎓 Students List</li>
          <li onClick={() => switchTab("addNewStudent")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "addNewStudent" ? '#374151' : 'transparent', borderRadius: '5px' }}>📝 Add Student</li>
          <li onClick={() => switchTab("classLecture")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "classLecture" ? '#374151' : 'transparent', borderRadius: '5px' }}>🎥 Class Lecture</li>
          <li onClick={() => switchTab("facultyList")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "facultyList" ? '#374151' : 'transparent', borderRadius: '5px' }}>👨‍🏫 Faculty List</li>
          <li onClick={() => switchTab("examResults")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "examResults" ? '#374151' : 'transparent', borderRadius: '5px' }}>🏆 Exam Results</li>
          <li onClick={() => switchTab("payments")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "payments" ? '#374151' : 'transparent', borderRadius: '5px' }}>💳 Payments</li>
        </ul>
        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowX: 'auto' }}>
        
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '5px', fontWeight: 'bold' }}>Welcome, Admin!</h1>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>Manage Prottoy Academy</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
              <div onClick={() => switchTab("studentsList")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>📚 Total Students</h3>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#111827' }}>{students.length}</p>
              </div>
              <div onClick={() => switchTab("facultyList")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>👨‍🏫 Total Faculty</h3>
                <p style={{ fontSize: '40px', fontWeight: 'bold', color: '#111827' }}>{faculties.length}</p>
              </div>
              <div onClick={() => switchTab("classLecture")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>🎥 Class Lectures</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', marginTop: '10px' }}>Prottoy Academy</p>
              </div>
              <div onClick={() => switchTab("payments")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '16px', marginBottom: '10px', fontWeight: '600' }}>💳 Payments</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', marginTop: '10px' }}>{payments.length} Records</p>
              </div>
            </div>
          </>
        )}

        {/* FACULTY MANAGEMENT */}
        {activeTab === "facultyList" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', fontWeight: 'bold', marginBottom: '10px' }}>Faculty Management</h1>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>View all teachers and register new ones below.</p>

            <h3 style={{ color: '#1e293b', fontSize: '20px', marginBottom: '20px' }}>Current Faculty List ({faculties.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              {faculties.map((teacher) => (
                <div key={teacher.id} style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
                    <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    {(teacher.id === 901 || teacher.id === 902) && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>★ Core Member</span>
                    )}
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#111827', fontWeight: 'bold' }}>{teacher.name}</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#6366f1', fontWeight: '600', fontSize: '14px' }}>{teacher.designation}</p>
                    <div style={{ marginBottom: '20px', fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '8px' }}>🎓 <strong>Edu:</strong> {teacher.education}</div>
                      <div style={{ marginBottom: '8px' }}>⏳ <strong>Exp:</strong> {teacher.experience}</div>
                      <div>📚 <span style={{ backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', color: '#4338ca' }}>{teacher.subjects}</span></div>
                    </div>
                    {(teacher.id === 901 || teacher.id === 902) ? (
                      <button disabled style={{ marginTop: 'auto', width: '100%', padding: '10px', backgroundColor: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '8px', fontWeight: 'bold', cursor: 'not-allowed' }}>Protected Member</button>
                    ) : (
                      <button onClick={() => handleDeleteFaculty(teacher.id)} style={{ marginTop: 'auto', width: '100%', padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Delete Teacher</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '30px', border: '2px dashed #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#10b981', fontSize: '22px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>+ Register New Teacher</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Teacher Name *</label><input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Md. Rashedul Islam" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Designation *</label><input type="text" value={fDesignation} onChange={(e) => setFDesignation(e.target.value)} placeholder="e.g. Guest Lecturer" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Educational Details</label><input type="text" value={fEducation} onChange={(e) => setFEducation(e.target.value)} placeholder="e.g. B.Sc in CSE" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Teaching Subjects *</label><input type="text" value={fSubjects} onChange={(e) => setFSubjects(e.target.value)} placeholder="e.g. Higher Math" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Experience</label><input type="text" value={fExperience} onChange={(e) => setFExperience(e.target.value)} placeholder="e.g. 2+ Years" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Image Link (URL - Optional)</label><input type="text" value={fImage} onChange={(e) => setFImage(e.target.value)} placeholder="https://..." style={inputStyle} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', gridColumn: '1 / -1' }}><button type="button" onClick={handleRegisterFaculty} disabled={!!loadingMsg} style={{ padding: '12px 30px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>{loadingMsg ? loadingMsg : "💾 Save Teacher Data"}</button></div>
              </div>
            </div>
          </>
        )}

        {/* STUDENTS LIST & ADD STUDENT */}
        {activeTab === "addNewStudent" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Register New Student</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '600px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Student Full Name *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" style={inputStyle} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Father's Name</label><input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" style={inputStyle} /></div>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Mother's Name</label><input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" style={inputStyle} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Class *</label>
                    <select value={className} onChange={(e) => setClassName(e.target.value)} style={inputStyle}>
                      <option value="">Select Class</option><option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                    </select>
                  </div>
                  <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Phone Number (Login ID) *</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXX" style={inputStyle} /></div>
                </div>
                <div><label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Address</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, Thana, District" style={inputStyle} /></div>
                <button type="button" onClick={handleRegisterStudent} disabled={!!loadingMsg} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{loadingMsg ? loadingMsg : "Register Student"}</button>
              </div>
            </div>
          </>
        )}

        {activeTab === "studentsList" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Detailed Students List</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '1000px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '15px', color: '#374151' }}>Name</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Class</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Phone</th>
                    <th style={{ padding: '15px', color: '#374151', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#111827' }}>{student.full_name}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}><span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>{student.class_name}</span></td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{student.phone_number}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button onClick={() => handleDeleteStudent(student.student_id)} style={{ padding: '8px 15px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No students found.</p>}
            </div>
          </>
        )}

        {/* EXAM RESULTS MANAGEMENT */}
        {activeTab === "examResults" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#1a50c4', marginBottom: '20px', fontWeight: 'bold' }}>Exam Results Management</h1>

            {/* View Selection Buttons */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <button 
                onClick={() => { setResultTab("publish"); setEditResultData(null); }}
                style={{ padding: '12px 20px', backgroundColor: resultTab === "publish" ? '#2563eb' : '#e5e7eb', color: resultTab === "publish" ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
              >
                + Publish New Result
              </button>
              <button 
                onClick={() => { setResultTab("manage"); setEditResultData(null); }}
                style={{ padding: '12px 20px', backgroundColor: resultTab === "manage" ? '#10b981' : '#e5e7eb', color: resultTab === "manage" ? 'white' : '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
              >
                📋 View & Manage All Results
              </button>
            </div>

            {/* TAB: PUBLISH RESULT */}
            {resultTab === "publish" && !editResultData && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                  {/* 1. Class Filter */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Select Class *</label>
                    <select style={inputStyle} onChange={(e) => setPayClassFilter(e.target.value)}>
                      <option value="">All Classes</option>
                      <option value="Class 6">Class 6</option><option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option><option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                    </select>
                  </div>

                  {/* 2. Student Selection */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Select Student *</label>
                    <select value={resultStudentId} onChange={(e) => setResultStudentId(e.target.value)} style={inputStyle}>
                      <option value="">-- Choose Student --</option>
                      {students
                        .filter(std => payClassFilter ? std.class_name === payClassFilter : true)
                        .map(std => (
                          <option key={std.student_id} value={std.student_id}>{std.full_name} ({std.class_name})</option>
                        ))}
                    </select>
                  </div>

                  {/* 3. Exam Name */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Exam Name *</label>
                    <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. Model Test 1" style={inputStyle} />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '18px' }}>Subject Marks</h3>
                    <button onClick={handleAddSubject} style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                      + Add Subject
                    </button>
                  </div>

                  {subjects.map((sub, index) => (
                    <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Subject Name</label>
                        <input type="text" value={sub.name} onChange={(e) => {
                          const newSubs = [...subjects]; newSubs[index].name = e.target.value; setSubjects(newSubs);
                        }} placeholder="e.g. বাংলা ১ম পত্র" style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Full Marks</label>
                        <input type="number" value={sub.fullMarks} onChange={(e) => {
                          const newSubs = [...subjects]; newSubs[index].fullMarks = Number(e.target.value); setSubjects(newSubs);
                        }} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>Obtained</label>
                        <input type="number" value={sub.obtained} onChange={(e) => {
                          const newSubs = [...subjects]; newSubs[index].obtained = e.target.value; setSubjects(newSubs);
                        }} placeholder="Marks" style={inputStyle} />
                      </div>
                      {subjects.length > 1 && (
                        <button onClick={() => handleRemoveSubject(index)} style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '43px' }}>X</button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handlePublishResult} disabled={!!resultLoading} style={{ width: '100%', marginTop: '25px', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                  {resultLoading ? resultLoading : "🏆 Publish Result to Database"}
                </button>
              </div>
            )}

            {/* TAB: MANAGE/VIEW RESULTS */}
            {resultTab === "manage" && !editResultData && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '1000px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '15px', color: '#374151' }}>Student</th>
                      <th style={{ padding: '15px', color: '#374151' }}>Exam Name</th>
                      <th style={{ padding: '15px', color: '#374151' }}>Subjects & Marks</th>
                      <th style={{ padding: '15px', color: '#374151', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsList.map((resItem: any, index: number) => {
                      const resId = resItem.id || resItem.result_id;
                      
                      // Safely Parse JSON data with our new stronger function
                      const subs = parseSubjectsSafe(resItem.subjects);
                      
                      const totalMarks = subs.reduce((acc: number, curr: any) => acc + Number(curr.fullMarks || 0), 0);
                      const obtainedMarks = subs.reduce((acc: number, curr: any) => acc + Number(curr.obtained || 0), 0);
                      const studentInfo = resItem.full_name ? `${resItem.full_name} (${resItem.class_name})` : getStudentInfo(resItem.student_id);

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '15px', fontWeight: '600', color: '#111827' }}>{studentInfo}</td>
                          <td style={{ padding: '15px', color: '#4b5563', fontWeight: 'bold' }}>{resItem.exam_name}</td>
                          <td style={{ padding: '15px', color: '#4b5563' }}>
                            {subs.length > 0 ? (
                              <ul style={{ margin: 0, paddingLeft: '20px', marginBottom: '8px' }}>
                                {subs.map((s: any, i: number) => (
                                  <li key={i} style={{ fontSize: '14px', marginBottom: '4px' }}>
                                    <strong>{s.name || 'Unknown'}:</strong> {s.obtained || 0} / {s.fullMarks || 100}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span style={{ color: '#ef4444', fontSize: '13px' }}>No subjects found. (Data format error)</span>
                            )}
                            {subs.length > 0 && (
                              <div style={{ padding: '5px 10px', backgroundColor: '#ecfdf5', display: 'inline-block', borderRadius: '5px', marginTop: '5px' }}>
                                <span style={{ fontWeight: 'bold', color: '#047857' }}>Total: {obtainedMarks} / {totalMarks}</span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                              <button 
                                onClick={() => setEditResultData({ ...resItem, subjects: subs.length > 0 ? subs : [{ name: "", fullMarks: 100, obtained: "" }] })} 
                                style={{ padding: '8px 15px', backgroundColor: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteResult(resId)} 
                                style={{ padding: '8px 15px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {resultsList.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No results published yet.</p>}
              </div>
            )}

            {/* EDIT RESULT MODAL/SECTION */}
            {editResultData && (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: '#f59e0b', fontSize: '24px' }}>✏️ Edit Exam Result</h2>
                  <button onClick={() => setEditResultData(null)} style={{ padding: '8px 15px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cancel Editing
                  </button>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0 0 10px 0', color: '#4b5563', fontWeight: 'bold' }}>Student: <span style={{ color: '#111827' }}>{editResultData.full_name || getStudentInfo(editResultData.student_id)}</span></p>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Exam Name *</label>
                  <input type="text" value={editResultData.exam_name} onChange={(e) => setEditResultData({...editResultData, exam_name: e.target.value})} style={inputStyle} />
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '18px' }}>Subject Marks</h3>
                    <button onClick={handleEditAddSubject} style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Subject</button>
                  </div>

                  {editResultData.subjects.map((sub: any, index: number) => (
                    <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-end' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Subject Name</label>
                        <input type="text" value={sub.name} onChange={(e) => {
                          const newSubs = [...editResultData.subjects]; newSubs[index].name = e.target.value; setEditResultData({...editResultData, subjects: newSubs});
                        }} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Full Marks</label>
                        <input type="number" value={sub.fullMarks} onChange={(e) => {
                          const newSubs = [...editResultData.subjects]; newSubs[index].fullMarks = Number(e.target.value); setEditResultData({...editResultData, subjects: newSubs});
                        }} style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>Obtained</label>
                        <input type="number" value={sub.obtained} onChange={(e) => {
                          const newSubs = [...editResultData.subjects]; newSubs[index].obtained = e.target.value; setEditResultData({...editResultData, subjects: newSubs});
                        }} style={inputStyle} />
                      </div>
                      {editResultData.subjects.length > 1 && (
                        <button onClick={() => handleEditRemoveSubject(index)} style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '43px' }}>X</button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={handleUpdateResult} style={{ width: '100%', marginTop: '25px', padding: '15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                  💾 Save Updated Result
                </button>
              </div>
            )}
          </>
        )}


        {/* PAYMENTS SECTION */}
        {activeTab === "payments" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Student Payments Management</h1>
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '30px', border: '2px dashed #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '30px', maxWidth: '1000px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#3b82f6', fontSize: '22px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>+ Record New Payment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e3a8a', fontSize: '14px' }}>🔍 1. Filter by Class</label>
                  <select value={payClassFilter} onChange={(e) => { setPayClassFilter(e.target.value); setPayStudentId(""); }} style={inputStyle}>
                    <option value="">All Classes</option>
                    <option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e3a8a', fontSize: '14px' }}>🔍 2. Search Name / ID</label>
                  <input type="text" value={paySearchQuery} onChange={(e) => { setPaySearchQuery(e.target.value); setPayStudentId(""); }} placeholder="Type student name or ID..." style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>3. Select Student *</label>
                  <select value={payStudentId} onChange={(e) => setPayStudentId(e.target.value)} style={inputStyle}>
                    <option value="">-- Choose Student --</option>
                    {filteredStudentsForPayment.map(std => (
                      <option key={std.student_id} value={std.student_id}>{std.full_name} (ID: {std.student_id})</option>
                    ))}
                  </select>
                </div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Amount (৳) *</label><input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 1500" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Payment Purpose *</label><input type="text" value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} placeholder="e.g. June Monthly Fee" style={inputStyle} /></div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Status *</label>
                  <select value={payStatus} onChange={(e) => setPayStatus(e.target.value)} style={inputStyle}>
                    <option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Partial">Partial</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="button" onClick={handleRecordPayment} disabled={!!payLoading} style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                    {payLoading ? payLoading : "💾 Record Payment"}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '1000px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '15px', color: '#374151' }}>Student Name</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Class</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Amount</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Purpose</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Date</th>
                    <th style={{ padding: '15px', color: '#374151', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((payment: any, index: number) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '15px', fontWeight: '600', color: '#111827' }}>{payment.full_name}</td>
                        <td style={{ padding: '15px', color: '#4b5563' }}><span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>{payment.class_name}</span></td>
                        <td style={{ padding: '15px', fontWeight: 'bold', color: '#10b981' }}>{payment.amount} ৳</td>
                        <td style={{ padding: '15px', color: '#4b5563' }}>{payment.payment_purpose}</td>
                        <td style={{ padding: '15px', color: '#4b5563' }}>{payment.payment_date ? payment.payment_date.substring(0, 10) : ''}</td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold',
                            backgroundColor: payment.payment_status === 'Paid' ? '#d1fae5' : '#fef3c7',
                            color: payment.payment_status === 'Paid' ? '#047857' : '#d97706'
                          }}>
                            {payment.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No payment records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "classLecture" && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h1 style={{ fontSize: '32px', color: '#111827', fontWeight: 'bold', marginBottom: '15px' }}>🎥 Class Lectures</h1>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>Watch all recorded classes and tutorials from our official channel.</p>
            <a href="https://www.youtube.com/@prottoyacademy" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 30px', backgroundColor: '#ef4444', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold' }}>Go to Prottoy Academy</a>
          </div>
        )}

      </div>
    </div>
  );
}