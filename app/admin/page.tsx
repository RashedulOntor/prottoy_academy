"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function AdminDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingMsg, setLoadingMsg] = useState("");

  // Student registration states
  const [fullName, setFullName] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Fetch student data from the database
  const fetchStudents = () => {
    fetch(`/api/students?t=${new Date().getTime()}`, { 
      cache: "no-store",
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.data);
        }
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeTab === "studentsList" || activeTab === "dashboard") {
      fetchStudents();
    }
  }, [activeTab]);

  const handleLogout = () => {
    window.location.href = "/";
  };

  // Delete student functionality
  const handleDeleteStudent = async (id: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this student?");
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        alert("✅ " + result.message);
        fetchStudents(); 
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Failed to delete student.");
    }
  };

  // Register student functionality
  const handleRegisterStudent = async () => {
    if (!fullName || !phone || !className) {
      alert("❌ Required: Full Name, Phone, and Class!");
      return;
    }

    setLoadingMsg("Registering...");
    const data = { fullName, fathersName, mothersName, className, phone, address };

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (result.success) {
        alert("✅ " + result.message);
        setFullName(""); setFathersName(""); setMothersName(""); 
        setClassName(""); setPhone(""); setAddress("");
        fetchStudents(); 
        setActiveTab("studentsList"); 
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (err) {
      alert("❌ Registration failed!");
    } finally {
      setLoadingMsg("");
    }
  };

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Section */}
      <div style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #374151', paddingBottom: '15px' }}>
          <Image 
            src="/prottoy academy logo.png" 
            alt="Logo"
            width={45} 
            height={45} 
            style={{ borderRadius: '6px', objectFit: 'cover' }}
          />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            Prottoy Academy
          </h2>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li onClick={() => switchTab("dashboard")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "dashboard" ? '#374151' : 'transparent', borderRadius: '5px' }}>📊 Dashboard</li>
          <li onClick={() => switchTab("studentsList")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "studentsList" ? '#374151' : 'transparent', borderRadius: '5px' }}>👨‍🎓 Students List</li>
          <li onClick={() => switchTab("addNewStudent")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "addNewStudent" ? '#374151' : 'transparent', borderRadius: '5px' }}>📝 Add New Student</li>
          {/* NEW: Class Lecture Tab */}
          <li onClick={() => switchTab("classLecture")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "classLecture" ? '#374151' : 'transparent', borderRadius: '5px' }}>🎥 Class Lecture</li>
          <li onClick={() => switchTab("facultyList")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "facultyList" ? '#374151' : 'transparent', borderRadius: '5px' }}>👨‍🏫 Faculty List</li>
          <li onClick={() => switchTab("examResults")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "examResults" ? '#374151' : 'transparent', borderRadius: '5px' }}>🏆 Exam Results</li>
          <li onClick={() => switchTab("payments")} style={{ cursor: 'pointer', padding: '12px', backgroundColor: activeTab === "payments" ? '#374151' : 'transparent', borderRadius: '5px' }}>💳 Payments</li>
        </ul>

        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowX: 'auto' }}>
        
        {/* ================= DASHBOARD TAB WITH BIG EMOJI CARDS ================= */}
        {activeTab === "dashboard" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '5px', fontWeight: 'bold' }}>Welcome, Admin!</h1>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>Here You Can Manage all of Prottoy Academy </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
              <div onClick={() => switchTab("studentsList")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>📚 Total Enrolled Students</h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827' }}>{students.length}</p>
              </div>

              <div onClick={() => switchTab("facultyList")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #10b981', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>👨‍🏫 Total Faculty</h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827' }}>12</p>
              </div>

              <div onClick={() => switchTab("payments")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #ef4444', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>💳 Pending Payments</h3>
                <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827' }}>0</p>
              </div>

              <div onClick={() => switchTab("addNewStudent")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #8b5cf6', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>✨ Quick Action</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginTop: '10px' }}>+ Add Student</p>
              </div>

              <div onClick={() => switchTab("examResults")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #f59e0b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>🏆 Exam Reports</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginTop: '10px' }}>View Results</p>
              </div>

              {/* NEW: Class Lecture Card in Dashboard */}
              <div onClick={() => switchTab("classLecture")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: '8px solid #dc2626', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <h3 style={{ color: '#6b7280', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>🎥 Class Lectures</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginTop: '10px' }}>Watch on YouTube</p>
              </div>
            </div>
          </>
        )}

        {/* ================= STUDENTS LIST WITH FIXED CLASS DESIGN ================= */}
        {activeTab === "studentsList" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Detailed Students List</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minWidth: '1000px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>ID</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>Name</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>Father's Name</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>Mother's Name</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>Class</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>Phone</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px' }}>Address</th>
                    <th style={{ padding: '15px', color: '#374151', fontSize: '14px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id} style={{ borderBottom: '1px solid #e5e7eb', transition: '0.2s' }}>
                      <td style={{ padding: '15px', color: '#6b7280' }}>{student.student_id}</td>
                      <td style={{ padding: '15px', fontWeight: '600', color: '#111827' }}>{student.full_name}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{student.fathers_name || "N/A"}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{student.mothers_name || "N/A"}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {student.class_name}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{student.phone_number}</td>
                      <td style={{ padding: '15px', color: '#4b5563' }}>{student.address}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteStudent(student.student_id)}
                          style={{ padding: '8px 15px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= ADD NEW STUDENT TAB ================= */}
        {activeTab === "addNewStudent" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Register New Student</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', maxWidth: '600px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '4px' }}>
                <p style={{ color: '#1e3a8a', fontSize: '14px', margin: 0 }}>
                  <strong>Note:</strong> Phone Number will be the Login ID. Default password is <b>password123</b>.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Student Full Name *</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Father's Name</label>
                    <input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Mother's Name</label>
                    <input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                  </div>
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

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Current Address" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }} />
                </div>

                <button type="button" onClick={handleRegisterStudent} disabled={!!loadingMsg} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loadingMsg ? loadingMsg : "Register Student"}
                </button>
              </div>

            </div>
          </>
        )}

        {/* ================= NEW: CLASS LECTURE TAB ================= */}
        {activeTab === "classLecture" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', marginBottom: '20px', fontWeight: 'bold' }}>Class Lectures</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '700px', margin: '0 auto' }}>
              <p style={{ fontSize: '60px', marginBottom: '15px' }}>📺</p>
              <h2 style={{ fontSize: '28px', color: '#111827', fontWeight: 'bold', marginBottom: '15px' }}>Watch Our Free Classes Online</h2>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '30px', lineHeight: '1.6' }}>
                All our latest class lectures, tutorials, and educational contents are available on our official YouTube channel. Click the button below to start learning!
              </p>
              
              <a 
                href="https://youtube.com/@dreamupacademy?si=PjsH4cciulcflI-Q" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-block', 
                  padding: '14px 30px', 
                  backgroundColor: '#dc2626', // YouTube Red
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '18px', 
                  boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)',
                  transition: '0.3s' 
                }}
              >
                ▶ Visit Dream Up Academy
              </a>
            </div>
          </>
        )}

        {/* Placeholders for Other Tabs */}
        {(activeTab === "facultyList" || activeTab === "examResults" || activeTab === "payments") && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', color: '#111827', fontWeight: 'bold' }}>{activeTab.toUpperCase()} Module</h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '10px' }}>This feature is coming soon to Prottoy Academy!</p>
          </div>
        )}

      </div>
    </div>
  );
}