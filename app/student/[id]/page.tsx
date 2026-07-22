"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Core Founding Members
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

// 🔴 FIX: Strong JSON Parser for Student Dashboard
const parseSubjectsSafe = (data: any) => {
  if (!data) return [];
  
  let parsedData = data;
  let attempts = 0;

  while (typeof parsedData === 'string' && attempts < 3) {
    try {
      if (parsedData.trim() === '') break;
      if (parsedData.includes('[object Object]')) return [];
      parsedData = JSON.parse(parsedData);
    } catch (error) {
      break; 
    }
    attempts++;
  }

  if (typeof parsedData === 'object' && parsedData !== null && !Array.isArray(parsedData)) {
    parsedData = Object.values(parsedData);
  }

  if (Array.isArray(parsedData)) {
    return parsedData.map(item => {
      if (typeof item === 'string') {
        try { return JSON.parse(item); } catch(e) { return null; }
      }
      return item;
    }).filter(Boolean);
  }

  return [];
};

export default function StudentDashboard() {
  const { id } = useParams(); 
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [faculties, setFaculties] = useState<any[]>([]);
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]);

  // View Mode State for Results (Integrated vs Single)
  const [resultViewMode, setResultViewMode] = useState<"integrated" | "single">("integrated");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", fathersName: "", mothersName: "", className: "", address: "" });
  const [updateMsg, setUpdateMsg] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [passUpdateLoading, setPassUpdateLoading] = useState(false);

  const fetchMyData = async () => {
    try {
      const res = await fetch(`/api/students?t=${new Date().getTime()}`);
      const data = await res.json();
      
      let allStudents = [];
      if (data.success && Array.isArray(data.data)) allStudents = data.data;
      else if (Array.isArray(data)) allStudents = data;
      else if (data.students && Array.isArray(data.students)) allStudents = data.students;

      if (allStudents.length > 0) {
        const myInfo = allStudents.find((s: any) => String(s.student_id) === String(id) || String(s.id) === String(id));
        if (myInfo) {
          setStudentData(myInfo);
          setEditForm({
            fullName: myInfo.full_name || myInfo.fullName || myInfo.name || "",
            fathersName: myInfo.fathers_name || "",
            mothersName: myInfo.mothers_name || "",
            className: myInfo.class_name || myInfo.className || myInfo.class || "",
            address: myInfo.address || ""
          });
        }
      }
    } catch (err) { console.error("Failed to load profile."); } finally { setLoading(false); }
  };

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setFaculties([...coreMembers, ...otherFoundingTeachers, ...data.data]); 
      else setFaculties([...coreMembers, ...otherFoundingTeachers]);
    } catch (err) { setFaculties([...coreMembers, ...otherFoundingTeachers]); }
  };

  const fetchMyPayments = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/payments?studentId=${id}&t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setMyPayments(data.data);
    } catch (err) { console.error("Failed to fetch payments", err); }
  };

  const fetchMyResults = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/results?studentId=${id}&t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) setMyResults(data.data);
    } catch (err) { console.error("Failed to fetch results", err); }
  };

  useEffect(() => {
    if (id) { fetchMyData(); fetchFaculties(); fetchMyPayments(); fetchMyResults(); }
  }, [id]);

  useEffect(() => {
    if (activeTab === "payments" || activeTab === "dashboard") fetchMyPayments();
    if (activeTab === "results" || activeTab === "dashboard") fetchMyResults();
  }, [activeTab]);

  const handleLogout = () => { router.push("/"); };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setUpdateMsg("Updating...");
    try {
      const res = await fetch("/api/students", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: Number(id), ...editForm }) });
      const result = await res.json();
      if (result.success) { alert("✅ Profile Updated Successfully!"); setIsEditing(false); fetchMyData(); } 
      else alert("❌ Error updating profile.");
    } catch (error) { alert("❌ Something went wrong."); } finally { setUpdateMsg(""); }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return alert("⚠️ Please type a new password!");
    setPassUpdateLoading(true);
    try {
      const res = await fetch('/api/students', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'update_password', id: Number(id), newPassword: newPassword }) });
      const result = await res.json();
      if (result.success) { alert("✅ Password updated successfully! Old password will no longer work."); setNewPassword(""); } 
      else alert("❌ Failed to update password.");
    } catch (err) { alert("❌ Something went wrong while updating password."); } finally { setPassUpdateLoading(false); }
  };

  // ==========================================
  // SMART GROUPING LOGIC FOR INTEGRATED RESULT
  // ==========================================
  const getIntegratedResults = () => {
    const grouped: Record<string, any> = {};

    myResults.forEach(res => {
      const examNameKey = res.exam_name ? res.exam_name.trim().toUpperCase() : "UNKNOWN EXAM";
      
      // 🔴 FIX: Using our safe parser instead of direct JSON.parse
      let marksArr = parseSubjectsSafe(res.marks_data || res.subjects);

      // Skip empty or invalid arrays
      if (!Array.isArray(marksArr) || marksArr.length === 0) return;

      if (!grouped[examNameKey]) {
        grouped[examNameKey] = {
          exam_name: res.exam_name,
          marks_data: [...marksArr]
        };
      } else {
        // Merge subjects if exam name matches
        grouped[examNameKey].marks_data = [...grouped[examNameKey].marks_data, ...marksArr];
      }
    });

    // Recalculate GPA for integrated views
    return Object.values(grouped).map((group: any) => {
      let totalPoint = 0;
      let isFailed = false;

      group.marks_data.forEach((m: any) => {
        let p = 0;
        if (m.grade === 'A+') p = 5.0;
        else if (m.grade === 'A') p = 4.0;
        else if (m.grade === 'A-') p = 3.5;
        else if (m.grade === 'B') p = 3.0;
        else if (m.grade === 'C') p = 2.0;
        else if (m.grade === 'D') p = 1.0;
        else { p = 0; isFailed = true; }
        totalPoint += p;
      });

      let finalGpa = (totalPoint / group.marks_data.length).toFixed(2);
      let finalGrade = 'F';

      if (isFailed) {
        finalGpa = '0.00';
        finalGrade = 'F';
      } else {
        const gNum = parseFloat(finalGpa);
        if (gNum >= 5.0) finalGrade = 'A+';
        else if (gNum >= 4.0) finalGrade = 'A';
        else if (gNum >= 3.5) finalGrade = 'A-';
        else if (gNum >= 3.0) finalGrade = 'B';
        else if (gNum >= 2.0) finalGrade = 'C';
        else if (gNum >= 1.0) finalGrade = 'D';
      }

      return {
        ...group,
        gpa: finalGpa,
        grade: finalGrade,
        id: group.exam_name // using exam name as unique key for integrated mapping
      };
    });
  };

  const displayResults = resultViewMode === "integrated" ? getIntegratedResults() : myResults.map(res => ({
    ...res, 
    // 🔴 FIX: Using safe parser for single mode as well
    marks_data: parseSubjectsSafe(res.marks_data || res.subjects)
  }));

  const inputStyle = { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', color: '#000000', fontWeight: '500', backgroundColor: '#ffffff' };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Loading your portal...</h2></div>;

  const safeName = studentData?.full_name || studentData?.fullName || studentData?.name || "Student";
  const safeClass = studentData?.class_name || studentData?.className || studentData?.class || "Your Class";
  let displaySafeName = safeName;
  if (safeName.toUpperCase() === "MD. RASHEDUL ISLAM") displaySafeName = "Rashedul Ontor";

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f9ff', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Section */}
      <div className="no-print" style={{ width: '260px', backgroundColor: '#0369a1', color: 'white', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #38bdf8', paddingBottom: '20px' }}>
          <Image src="/prottoy academy logo.png" alt="Logo" width={60} height={60} style={{ borderRadius: '10px', marginBottom: '10px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>Prottoy Academy</h2>
          <span style={{ fontSize: '12px', backgroundColor: '#0284c7', padding: '3px 8px', borderRadius: '10px', marginTop: '8px' }}>Student Portal</span>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li onClick={() => setActiveTab("dashboard")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "dashboard" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>📊 Dashboard</li>
          <li onClick={() => setActiveTab("profile")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "profile" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>👤 My Profile</li>
          <li onClick={() => setActiveTab("classes")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "classes" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>🎥 Class Lectures</li>
          <li onClick={() => setActiveTab("faculty")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "faculty" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>👨‍🏫 Faculty List</li>
          <li onClick={() => setActiveTab("results")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "results" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>🏆 Exam Results</li>
          <li onClick={() => setActiveTab("payments")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "payments" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>💳 My Payments</li>
        </ul>

        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Logout</button>
      </div>

      {/* Main Content Area */}
      <div className="print-full-width" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === "dashboard" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', fontWeight: 'bold' }}>Welcome, {displaySafeName}!</h1>
            <p style={{ color: '#020202', marginBottom: '35px' }}>Academic Overview</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
              <div onClick={() => setActiveTab("profile")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #f59e0b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>👤 My Profile</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginTop: '10px' }}>View Details ➔</p>
              </div>
              <div onClick={() => setActiveTab("payments")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #ef4444', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>💳 My Payments</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '10px' }}>View History ➔</p>
              </div>
              <div onClick={() => window.open("https://youtube.com/@dreamupacademy?si=TS7c8-VM9lTf5Zxr", "_blank")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #3b82f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>🎥 Class Lectures</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginTop: '10px' }}>Watch Now ➔</p>
              </div>
              <div onClick={() => setActiveTab("results")} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #10b981', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>🏆 Exam Results</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>Check Now ➔</p>
              </div>
            </div>
          </>
        )}

        {/* FACULTY LIST SECTION */}
        {activeTab === "faculty" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', fontWeight: 'bold', marginBottom: '10px' }}>Our Honorable Faculty</h1>
            <p style={{ color: '#64748b', marginBottom: '35px' }}>Meet the experienced and dedicated teachers of Prottoy Academy who are committed to building your bright future.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              {faculties.map((teacher) => (
                <div key={teacher.id} style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                  </div>
                  <div style={{ padding: '25px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#0f172a', fontWeight: 'bold' }}>{teacher.name}</h3>
                    <p style={{ margin: '0 0 15px 0', color: '#0284c7', fontWeight: '700', fontSize: '14px' }}>{teacher.designation}</p>
                    <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '8px' }}>🎓 <strong>Edu:</strong> {teacher.education}</div>
                      <div style={{ marginBottom: '12px' }}>⏳ <strong>Exp:</strong> {teacher.experience}</div>
                      <div>📚 <span style={{ backgroundColor: '#f0f9ff', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', color: '#0369a1', border: '1px solid #bae6fd' }}>{teacher.subjects}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && studentData && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h1 style={{ fontSize: '32px', color: '#0f172a', fontWeight: 'bold', margin: 0 }}>My Profile</h1>
              {!isEditing && <button onClick={() => setIsEditing(true)} style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✏️ Edit Details</button>}
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '750px' }}>
              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Full Name:</span><span style={{ color: '#0f172a', fontWeight: 'bold' }}>{displaySafeName}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Father's Name:</span><span style={{ color: '#0f172a', fontWeight: 'bold' }}>{studentData.fathers_name || "Not provided"}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Mother's Name:</span><span style={{ color: '#0f172a', fontWeight: 'bold' }}>{studentData.mothers_name || "Not provided"}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Class:</span><span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>{safeClass}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Phone (Login ID):</span><span style={{ color: '#0f172a', fontWeight: 'bold' }}>{studentData.phone_number || studentData.phone || "N/A"}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Address:</span><span style={{ color: '#0f172a', fontWeight: 'bold' }}>{studentData.address || "Not provided"}</span></div>

                  <div style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '25px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' }}>🛡️ Security Settings</h3>
                    <div style={{ maxWidth: '450px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Change Login Password</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" style={inputStyle} />
                        <button onClick={handlePasswordChange} disabled={passUpdateLoading} style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{passUpdateLoading ? "..." : "Update"}</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Full Name</label><input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required style={inputStyle} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Father's Name</label><input type="text" value={editForm.fathersName} onChange={e => setEditForm({...editForm, fathersName: e.target.value})} style={inputStyle} /></div>
                    <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Mother's Name</label><input type="text" value={editForm.mothersName} onChange={e => setEditForm({...editForm, mothersName: e.target.value})} style={inputStyle} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Class</label>
                      <select value={editForm.className} onChange={e => setEditForm({...editForm, className: e.target.value})} required style={inputStyle}>
                        <option value="Class 6">Class 6</option><option value="Class 7">Class 7</option><option value="Class 8">Class 8</option><option value="Class 9">Class 9</option><option value="Class 10">Class 10</option><option value="SSC 2026">SSC 2026</option>
                      </select>
                    </div>
                    <div><label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Address</label><input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={inputStyle} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="submit" disabled={!!updateMsg} style={{ flex: 1, padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{updateMsg ? updateMsg : "Save Changes"}</button>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '14px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        {/* PAYMENTS SECTION */}
        {activeTab === "payments" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>My Payment History</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '900px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '15px', color: '#334155' }}>Date</th>
                      <th style={{ padding: '15px', color: '#334155' }}>Purpose</th>
                      <th style={{ padding: '15px', color: '#334155' }}>Amount</th>
                      <th style={{ padding: '15px', color: '#334155', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPayments.length > 0 ? (
                      myPayments.map((payment: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px', color: '#475569', fontWeight: '500' }}>{payment.payment_date ? payment.payment_date.substring(0, 10) : ''}</td>
                          <td style={{ padding: '15px', color: '#0f172a', fontWeight: '600' }}>{payment.payment_purpose}</td>
                          <td style={{ padding: '15px', fontWeight: 'bold', color: '#10b981' }}>{payment.amount} ৳</td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', backgroundColor: payment.payment_status === 'Paid' ? '#d1fae5' : '#fef3c7', color: payment.payment_status === 'Paid' ? '#047857' : '#d97706' }}>{payment.payment_status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No payment records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CLASSES SECTION */}
        {activeTab === "classes" && (
           <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '50px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '700px' }}>
              <p style={{ fontSize: '50px', marginBottom: '15px' }}>📺</p>
              <h2 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 'bold', marginBottom: '15px' }}>Watch Your Classes Online totally FREE!</h2>
              <a href="https://youtube.com/@prottoyacademy" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '14px 30px', backgroundColor: '#dc2626', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px' }}>▶ Open Prottoy Academy</a>
           </div>
        )}

        {/* EXAM RESULTS SECTION (SMART INTEGRATED + TOGGLE) */}
        {activeTab === "results" && (
          <>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h1 style={{ fontSize: '32px', color: '#0f172a', fontWeight: 'bold', margin: 0 }}>My Exam Results</h1>
              
              {/* Toggle Buttons for View Mode */}
              <div style={{ display: 'flex', gap: '10px', backgroundColor: '#e2e8f0', padding: '5px', borderRadius: '10px' }}>
                <button 
                  onClick={() => setResultViewMode('integrated')} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', backgroundColor: resultViewMode === 'integrated' ? '#1e3a8a' : 'transparent', color: resultViewMode === 'integrated' ? 'white' : '#475569' }}
                >
                  📑 Integrated Marksheet
                </button>
                <button 
                  onClick={() => setResultViewMode('single')} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', backgroundColor: resultViewMode === 'single' ? '#1e3a8a' : 'transparent', color: resultViewMode === 'single' ? 'white' : '#475569' }}
                >
                  📄 Single Exam View
                </button>
              </div>
            </div>

            {/* Hint Notice */}
            {resultViewMode === "integrated" && displayResults.length > 0 && (
                <div className="no-print" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '15px', borderRadius: '8px', marginBottom: '25px', fontSize: '14px', fontWeight: '500', borderLeft: '4px solid #0284c7' }}>
                  💡 <strong>Smart View:</strong> Exams with the exact same name (e.g. "Half Yearly") are automatically combined into a single transcript with recalculated Final GPA.
                </div>
            )}

            <div style={{ display: 'grid', gap: '40px' }}>
              {displayResults.length > 0 ? (
                displayResults.map((res: any) => (
                  <div key={res.id} className="print-card" style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', position: 'relative', borderTop: '8px solid #1e3a8a', overflow: 'hidden' }}>
                    
                    {/* Background Watermark (CSS only) */}
                    <div className="no-print" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '90px', color: 'rgba(226, 232, 240, 0.4)', fontWeight: '900', whiteSpace: 'nowrap', zIndex: 0, pointerEvents: 'none', userSelect: 'none' }}>
                      PROTTOY ACADEMY
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      
                      {/* --- CENTRALIZED HEADER --- */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '25px', marginBottom: '30px', position: 'relative' }}>
                        
                        {/* Logo Left */}
                        <div style={{ position: 'absolute', left: 0, top: 0 }}>
                          <Image src="/prottoy academy logo.png" alt="Logo" width={90} height={90} style={{ borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} />
                        </div>

                        {/* Center: Title & Address */}
                        <div style={{ textAlign: 'center' }}>
                          <h1 style={{ fontSize: '38px', color: '#1e3a8a', margin: '0 0 5px 0', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            PROTTOY ACADEMY
                          </h1>
                          <p style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#475569', fontWeight: '600' }}>
                            Bhabki Bazar, Melandah, Jamalpur | Estd: 2025
                          </p>
                          
                          {/* Center: Academic Transcript Badge */}
                          <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '10px 40px', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)' }}>
                              ACADEMIC TRANSCRIPT
                          </div>
                        </div>

                        {/* Right Side: Date */}
                        <div style={{ position: 'absolute', right: 0, bottom: '25px' }}>
                          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '700' }}>
                            Date: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* --- PERFECTLY ALIGNED 3-COLUMN INFO SECTION --- */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 240px', gap: '20px', marginBottom: '35px' }}>
                        
                        {/* 1. Student Details */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 15px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#475569', fontWeight: '700', fontSize: '14px' }}>Student Name</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>:</span>
                            <span style={{ color: '#0f172a', fontWeight: '900', fontSize: '15px' }}>{displaySafeName}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 15px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#475569', fontWeight: '700', fontSize: '14px' }}>Student ID</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>:</span>
                            <span style={{ color: '#0f172a', fontWeight: '900', fontSize: '15px' }}>{studentData?.student_id}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 15px 1fr', alignItems: 'center' }}>
                            <span style={{ color: '#475569', fontWeight: '700', fontSize: '14px' }}>Class</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>:</span>
                            <span style={{ color: '#0f172a', fontWeight: '900', fontSize: '15px' }}>{safeClass.replace(/Class\s*/i, '').trim()}</span>
                          </div>
                        </div>

                        {/* 2. Exam Details */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 15px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#475569', fontWeight: '700', fontSize: '14px' }}>Examination</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>:</span>
                            <span style={{ color: '#1e3a8a', fontWeight: '900', fontSize: '15px', textTransform: 'uppercase' }}>{res.exam_name}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 15px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#475569', fontWeight: '700', fontSize: '14px' }}>Result Status</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>:</span>
                            <span style={{ fontWeight: '900', fontSize: '15px', color: res.grade === 'F' ? '#dc2626' : '#16a34a' }}>{res.grade === 'F' ? 'Failed' : 'Passed'}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 15px 1fr', alignItems: 'center' }}>
                            <span style={{ color: '#475569', fontWeight: '700', fontSize: '14px' }}>Overall GPA</span>
                            <span style={{ color: '#0f172a', fontWeight: '700' }}>:</span>
                            <span style={{ color: '#0f172a', fontWeight: '900', fontSize: '15px' }}>{res.gpa} ({res.grade})</span>
                          </div>
                        </div>

                        {/* 3. Grading Scale Box */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '15px 20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', textAlign: 'center' }}>Grading Scale</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '12px', color: '#475569', gap: '6px', fontWeight: '600' }}>
                            <div>80-100 : A+</div>
                            <div>70-79 : A</div>
                            <div>60-69 : A-</div>
                            <div>50-59 : B</div>
                            <div>40-49 : C</div>
                            <div>33-39 : D</div>
                            <div style={{ color: '#dc2626', fontWeight: 'bold', gridColumn: '1 / -1', textAlign: 'center', marginTop: '6px' }}>0-32 : F (Fail)</div>
                          </div>
                        </div>

                      </div>
                      
                      {/* Premium Marksheet Table */}
                      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '40px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                              <th style={{ padding: '16px 20px', fontWeight: 'bold', borderRight: '1px solid #3b82f6', width: '40%' }}>Subject Name</th>
                              <th style={{ padding: '16px 20px', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #3b82f6' }}>Full Marks</th>
                              <th style={{ padding: '16px 20px', fontWeight: 'bold', textAlign: 'center', borderRight: '1px solid #3b82f6' }}>Marks Obtained</th>
                              <th style={{ padding: '16px 20px', fontWeight: 'bold', textAlign: 'center' }}>Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* 🔴 FIX: Now safe mapping over the array */}
                            {(Array.isArray(res.marks_data) ? res.marks_data : []).map((sub: any, i: number) => (
                              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '14px 20px', color: '#0f172a', fontWeight: '700', borderRight: '1px solid #e2e8f0' }}>{sub.subject_name || sub.name}</td>
                                <td style={{ padding: '14px 20px', color: '#475569', textAlign: 'center', fontWeight: '600', borderRight: '1px solid #e2e8f0' }}>{sub.full_marks || sub.fullMarks}</td>
                                <td style={{ padding: '14px 20px', color: '#0f172a', fontWeight: '900', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>{sub.obtained_marks || sub.obtained}</td>
                                <td style={{ padding: '14px 20px', color: sub.grade === 'F' ? '#dc2626' : '#1e3a8a', fontWeight: '900', textAlign: 'center' }}>{sub.grade}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
                              <td colSpan={2} style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>Final Result:</td>
                              <td colSpan={2} style={{ padding: '16px 20px', textAlign: 'center', color: res.grade === 'F' ? '#dc2626' : '#16a34a', fontSize: '20px', fontWeight: '900' }}>
                                GPA {res.gpa} <span style={{ fontSize: '16px', color: '#475569', fontWeight: '700' }}>({res.grade})</span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Signatures */}
                      <div className="print-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
                        <div style={{ textAlign: 'center', width: '180px' }}>
                          <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '8px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>Class Teacher</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', width: '180px' }}>
                          <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '8px' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>Director / CEO</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Prottoy Academy</p>
                          </div>
                        </div>
                      </div>
                      
                    </div>

                    {/* PDF Download Button */}
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '25px' }}>
                      <button 
                        onClick={() => window.print()} 
                        style={{ padding: '14px 30px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)' }}
                      >
                        🖨️ Download / Print Official Marksheet
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '50px', textAlign: 'center', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '50px', margin: '0 0 15px 0' }}>📭</p>
                  <h3 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '10px', fontWeight: 'bold' }}>No Exam Results Found</h3>
                  <p style={{ color: '#64748b', fontSize: '16px' }}>If you missed an exam or your result is pending, it will not appear here. Contact your class teacher for details.</p>
                </div>
              )}
            </div>
            
            {/* CSS for perfect PDF Printing */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                body { background-color: white !important; margin: 0; }
                .no-print { display: none !important; }
                .print-full-width { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                .print-card { 
                  box-shadow: none !important; 
                  border: 2px solid #cbd5e1 !important; 
                  border-radius: 0 !important;
                  margin: 0 !important;
                  padding: 40px !important;
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              }
            `}} />
          </>
        )}

      </div>
    </div>
  );
}