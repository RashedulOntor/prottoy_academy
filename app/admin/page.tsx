"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
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

  // Fetch functions
  const fetchStudents = () => {
    fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStudents(data.data); });
  };

  const fetchFaculties = () => {
    fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setFaculties(data.data); });
  };

  useEffect(() => {
    fetchStudents();
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (activeTab === "studentsList" || activeTab === "dashboard") fetchStudents();
    if (activeTab === "facultyList" || activeTab === "dashboard") fetchFaculties();
  }, [activeTab]);

  const handleLogout = () => {
    window.location.href = "/";
  };

  // Student Actions
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

  // Faculty Actions
  const handleRegisterFaculty = async () => {
    if (!fName || !fDesignation || !fSubjects) return alert("❌ Name, Designation and Subjects are required!");
    setLoadingMsg("Adding Teacher...");
    try {
      const res = await fetch("/api/faculty", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fName, designation: fDesignation, education: fEducation, subjects: fSubjects, experience: fExperience }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        setFName(""); setFDesignation(""); setFEducation(""); setFSubjects(""); setFExperience("");
        fetchFaculties(); setActiveTab("facultyList");
      } else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to add teacher!"); } 
    finally { setLoadingMsg(""); }
  };

  const handleDeleteFaculty = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      const res = await fetch(`/api/faculty?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) { alert("✅ " + result.message); fetchFaculties(); } 
      else alert("❌ Error: " + result.message);
    } catch (err) { alert("❌ Failed to delete teacher."); }
  };

  const switchTab = (tabName: string) => { setActiveTab(tabName); };

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
          <li onClick={() => switchTab("addNewFaculty")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "addNewFaculty" ? '#374151' : 'transparent', borderRadius: '5px' }}>➕ Add Teacher</li>
          
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              <div onClick={() => switchTab("studentsList")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>📚 Total Students</h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827' }}>{students.length}</p>
              </div>

              <div onClick={() => switchTab("facultyList")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>👨‍🏫 Total Faculty</h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827' }}>{faculties.length}</p>
              </div>
            </div>
          </>
        )}

        {/* FACULTY LIST TAB */}
        {activeTab === "facultyList" && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '32px', color: '#111827', fontWeight: 'bold' }}>Faculty Members</h1>
              <button onClick={() => switchTab("addNewFaculty")} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add New Teacher</button>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '1000px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '15px', color: '#374151' }}>Name</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Designation</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Education</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Subjects</th>
                    <th style={{ padding: '15px', color: '#374151' }}>Experience</th>
                    <th style={{ padding: '15px', color: '#374151', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map((teacher) => (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#111827' }}>{teacher.name}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{teacher.designation}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{teacher.education}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>
                        <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>{teacher.subjects}</span>
                      </td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{teacher.experience}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button onClick={() => handleDeleteFaculty(teacher.id)} style={{ padding: '8px 15px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {faculties.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No teachers found. Please add a new teacher.</p>}
            </div>
          </>
        )}

        {/* ADD NEW FACULTY TAB */}
        {activeTab === "addNewFaculty" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Register New Teacher</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '600px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Teacher Name *</label>
                  <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Md. Rashedul Islam" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Designation *</label>
                    <input type="text" value={fDesignation} onChange={(e) => setFDesignation(e.target.value)} placeholder="e.g. Founder & CEO" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Experience</label>
                    <input type="text" value={fExperience} onChange={(e) => setFExperience(e.target.value)} placeholder="e.g. 6+ Years" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Educational Details</label>
                  <input type="text" value={fEducation} onChange={(e) => setFEducation(e.target.value)} placeholder="e.g. B.Sc in CSE at BRIU" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Teaching Subjects *</label>
                  <input type="text" value={fSubjects} onChange={(e) => setFSubjects(e.target.value)} placeholder="e.g. Math, Science" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                </div>
                <button type="button" onClick={handleRegisterFaculty} disabled={!!loadingMsg} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loadingMsg ? loadingMsg : "Save Teacher Info"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ADD NEW STUDENT TAB */}
        {activeTab === "addNewStudent" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Register New Student</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '600px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Student Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Class *</label>
                    <select value={className} onChange={(e) => setClassName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}>
                      <option value="">Select Class</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="SSC 2026">SSC 2026</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Phone Number *</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="017XXXXXXX" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                  </div>
                </div>
                <button type="button" onClick={handleRegisterStudent} disabled={!!loadingMsg} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loadingMsg ? loadingMsg : "Register Student"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* STUDENTS LIST TAB */}
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

        {/* Placeholders for Other Tabs */}
        {(activeTab === "examResults" || activeTab === "payments" || activeTab === "classLecture") && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', color: '#111827', fontWeight: 'bold' }}>{activeTab.toUpperCase()} Module</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '10px' }}>This feature is coming soon to Prottoy Academy!</p>
          </div>
        )}

      </div>
    </div>
  );
}