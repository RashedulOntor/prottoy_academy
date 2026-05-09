"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

// Core Founding Members (CEO & MD only)
const coreMembers = [
  { id: 901, name: "Md. Rashedul Islam", designation: "Founder and CEO", education: "B.Sc in CSE (studying) at Brahmaputra International University", subjects: "Math, Science, ICT", experience: "6+ Years", image: "/faculty/rashedul.jpg" },
  { id: 902, name: "Md. Shohel Islam", designation: "Founder and MD", education: "B.A in Bangla at Govt. Asheq Mahmud College", subjects: "Bangla", experience: "12+ Years", image: "/faculty/shohel.jpg" }
];

// Other Founding Teachers
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

  const fetchStudents = () => {
    fetch(`/api/students?t=${new Date().getTime()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStudents(data.data); });
  };

  const fetchFaculties = () => {
    fetch(`/api/faculty?t=${new Date().getTime()}`, { 
      cache: "no-store",
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' }
    })
      .then((res) => res.json())
      .then((data) => { 
        if (data.success && Array.isArray(data.data)) {
          setFaculties([...coreMembers, ...otherFoundingTeachers, ...data.data]); 
        } else {
          setFaculties([...coreMembers, ...otherFoundingTeachers]);
        }
      })
      .catch(() => setFaculties([...coreMembers, ...otherFoundingTeachers]));
  };

  useEffect(() => {
    fetchStudents();
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (activeTab === "studentsList" || activeTab === "dashboard") fetchStudents();
    if (activeTab === "facultyList" || activeTab === "dashboard") fetchFaculties();
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

  // ✅ Student Registration (Re-added to fix your error)
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

  // ✅ Faculty Registration (With Instant UI Update)
  const handleRegisterFaculty = async () => {
    if (!fName || !fDesignation || !fSubjects) return alert("❌ Required: Name, Designation, and Subjects!");
    setLoadingMsg("Adding Teacher...");
    try {
      const newTeacherData = { name: fName, designation: fDesignation, education: fEducation, subjects: fSubjects, experience: fExperience, image: fImage };

      const res = await fetch("/api/faculty", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacherData),
      });
      const result = await res.json();
      
      if (result.success) {
        alert("✅ Teacher added successfully!");
        setFaculties(prevFaculties => [...prevFaculties, { id: Date.now(), ...newTeacherData }]);
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

  const switchTab = (tabName: string) => { setActiveTab(tabName); };

  const inputStyle = {
    width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px',
    color: '#000000', fontWeight: '500', backgroundColor: '#ffffff', outline: 'none'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar */}
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

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px', overflowX: 'auto' }}>
        
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
            </div>
          </>
        )}

        {/* FACULTY LIST */}
        {activeTab === "facultyList" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#111827', fontWeight: 'bold', marginBottom: '10px' }}>Faculty Management</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              {faculties.map((teacher) => (
                <div key={teacher.id} style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f3f4f6', position: 'relative' }}>
                    <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '20px', flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{teacher.name}</h3>
                    <p style={{ color: '#6366f1', fontSize: '14px' }}>{teacher.designation}</p>
                    <button onClick={() => handleDeleteFaculty(teacher.id)} style={{ marginTop: '15px', width: '100%', padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Faculty Form */}
            <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '2px dashed #cbd5e1' }}>
              <h3>+ Add New Teacher</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Teacher Name *" style={inputStyle} />
                <input type="text" value={fDesignation} onChange={(e) => setFDesignation(e.target.value)} placeholder="Designation *" style={inputStyle} />
                <input type="text" value={fEducation} onChange={(e) => setFEducation(e.target.value)} placeholder="Education" style={inputStyle} />
                <input type="text" value={fSubjects} onChange={(e) => setFSubjects(e.target.value)} placeholder="Subjects *" style={inputStyle} />
                <button onClick={handleRegisterFaculty} disabled={!!loadingMsg} style={{ gridColumn: '1 / -1', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{loadingMsg ? loadingMsg : "Save Teacher"}</button>
              </div>
            </div>
          </>
        )}

        {/* ADD STUDENT */}
        {activeTab === "addNewStudent" && (
          <>
            <h1>Register New Student</h1>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name *" style={inputStyle} />
                <input type="text" value={fathersName} onChange={(e) => setFathersName(e.target.value)} placeholder="Father's Name" style={inputStyle} />
                <input type="text" value={mothersName} onChange={(e) => setMothersName(e.target.value)} placeholder="Mother's Name" style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <select value={className} onChange={(e) => setClassName(e.target.value)} style={inputStyle}>
                    <option value="">Select Class *</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="SSC 2026">SSC 2026</option>
                  </select>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number *" style={inputStyle} />
                </div>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" style={inputStyle} />
                <button onClick={handleRegisterStudent} disabled={!!loadingMsg} style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>{loadingMsg ? loadingMsg : "Register"}</button>
              </div>
            </div>
          </>
        )}

        {/* STUDENT LIST */}
        {activeTab === "studentsList" && (
          <>
            <h1>Students List</h1>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', minWidth: '800px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '15px' }}>Name</th>
                    <th style={{ padding: '15px' }}>Class</th>
                    <th style={{ padding: '15px' }}>Phone</th>
                    <th style={{ padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.student_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px' }}>{student.full_name}</td>
                      <td style={{ padding: '15px' }}>{student.class_name}</td>
                      <td style={{ padding: '15px' }}>{student.phone_number}</td>
                      <td style={{ padding: '15px' }}>
                        <button onClick={() => handleDeleteStudent(student.student_id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CLASS LECTURE */}
        {activeTab === "classLecture" && (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '12px' }}>
            <h1>🎥 Class Lectures</h1>
            <a href="https://www.youtube.com/@dreamupacademy" target="_blank" style={{ color: '#ef4444', fontWeight: 'bold' }}>Visit YouTube Channel</a>
          </div>
        )}

      </div>
    </div>
  );
}