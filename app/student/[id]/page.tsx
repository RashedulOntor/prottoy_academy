"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function StudentDashboard() {
  const { id } = useParams(); 
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Faculty state
  const [faculties, setFaculties] = useState<any[]>([]);
  
  // Payments state
  const [myPayments, setMyPayments] = useState<any[]>([]);

  // Profile Update States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "", fathersName: "", mothersName: "", className: "", address: ""
  });
  const [updateMsg, setUpdateMsg] = useState("");

  // New Password State
  const [newPassword, setNewPassword] = useState("");
  const [passUpdateLoading, setPassUpdateLoading] = useState(false);

  // Fetch Student Data
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
    } catch (err) {
      console.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Faculty Data
  const fetchFaculties = async () => {
    try {
      const res = await fetch(`/api/faculty?t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFaculties([...coreMembers, ...otherFoundingTeachers, ...data.data]); 
      } else {
        setFaculties([...coreMembers, ...otherFoundingTeachers]);
      }
    } catch (err) {
      setFaculties([...coreMembers, ...otherFoundingTeachers]);
    }
  };

  // Fetch My Payments Data
  const fetchMyPayments = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/payments?studentId=${id}&t=${new Date().getTime()}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMyPayments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch payments", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMyData();
      fetchFaculties();
      fetchMyPayments();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "payments" || activeTab === "dashboard") {
      fetchMyPayments();
    }
  }, [activeTab]);

  const handleLogout = () => {
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMsg("Updating...");
    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), ...editForm }),
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Profile Updated Successfully!");
        setIsEditing(false);
        fetchMyData(); 
      } else {
        alert("❌ Error updating profile.");
      }
    } catch (error) {
      alert("❌ Something went wrong.");
    } finally {
      setUpdateMsg("");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      alert("⚠️ Please type a new password!");
      return;
    }
    
    setPassUpdateLoading(true);
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'update_password', 
          id: Number(id), 
          newPassword: newPassword 
        })
      });
      const result = await res.json();
      if (result.success) {
        alert("✅ Password updated successfully! Old password will no longer work.");
        setNewPassword("");
      } else {
        alert("❌ Failed to update password. Admin may need to configure the backend API.");
      }
    } catch (err) {
      alert("❌ Something went wrong while updating password.");
    } finally {
      setPassUpdateLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', color: '#000000', fontWeight: '500', backgroundColor: '#ffffff'
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Loading your portal...</h2></div>;
  }

  const safeName = studentData?.full_name || studentData?.fullName || studentData?.name || "Student";
  const safeClass = studentData?.class_name || studentData?.className || studentData?.class || "Your Class";

  // Name correction logic for Frontend
  let displaySafeName = safeName;
  if (safeName.toUpperCase() === "MD. RASHEDUL ISLAM") {
    displaySafeName = "Rashedul Ontor";
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f9ff', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Section */}
      <div style={{ width: '260px', backgroundColor: '#0369a1', color: 'white', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>
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
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === "dashboard" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', fontWeight: 'bold' }}>Welcome, {displaySafeName}!</h1>
            <p style={{ color: '#020202', marginBottom: '35px' }}>Academic Overview</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
              
              {/* Card 1: My Profile (NEW Clickable) */}
              <div 
                onClick={() => setActiveTab("profile")} 
                style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #f59e0b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>👤 My Profile</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginTop: '10px' }}>View Details ➔</p>
              </div>

              {/* Card 2: Payments (Clickable) */}
              <div 
                onClick={() => setActiveTab("payments")} 
                style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #ef4444', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>💳 My Payments</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '10px' }}>View History ➔</p>
              </div>

              {/* Card 3: Class Lectures (Clickable) */}
              <div 
                onClick={() => window.open("https://youtube.com/@dreamupacademy?si=TS7c8-VM9lTf5Zxr", "_blank")} 
                style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #3b82f6', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>🎥 Class Lectures</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginTop: '10px' }}>Watch Now ➔</p>
              </div>

              {/* Card 4: Exam Results (NEW Clickable) */}
              <div 
                onClick={() => setActiveTab("results")} 
                style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #10b981', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>🏆 Exam Results</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>Check Now ➔</p>
              </div>
              
            </div>
          </>
        )}

        {/* FACULTY LIST SECTION (VIEW ONLY) */}
        {activeTab === "faculty" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', fontWeight: 'bold', marginBottom: '10px' }}>Our Honorable Faculty</h1>
            <p style={{ color: '#64748b', marginBottom: '35px' }}>Meet the experienced and dedicated teachers of Prottoy Academy who are committed to building your bright future.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '50px' }}>
              {faculties.map((teacher) => (
                <div key={teacher.id} style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    <img src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                    {(teacher.id === 901 || teacher.id === 902) && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: '#f59e0b', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>★ Core Member</span>
                    )}
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
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ✏️ Edit Details
                </button>
              )}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '750px' }}>
              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Full Name:</span><span style={{ color: '#0f172a', fontWeight: '500' }}>{displaySafeName}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Father's Name:</span><span style={{ color: '#0f172a' }}>{studentData.fathers_name || "Not provided"}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Mother's Name:</span><span style={{ color: '#0f172a' }}>{studentData.mothers_name || "Not provided"}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Class:</span><span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>{safeClass}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Phone (Login ID):</span><span style={{ color: '#0f172a' }}>{studentData.phone_number || studentData.phone || "N/A"}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}><span style={{ color: '#64748b', fontWeight: '600' }}>Address:</span><span style={{ color: '#0f172a' }}>{studentData.address || "Not provided"}</span></div>

                  {/* SECURITY SECTION */}
                  <div style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '25px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' }}>🛡️ Security Settings</h3>
                    <div style={{ maxWidth: '450px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Change Login Password</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Type new password" style={inputStyle} />
                        <button onClick={handlePasswordChange} disabled={passUpdateLoading} style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {passUpdateLoading ? "..." : "Update"}
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>* Make sure to remember your new password for the next login.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ margin: 0, color: '#b45309', fontSize: '14px' }}>Note: Contact Admin to change your Phone/Login ID.</p>
                  </div>
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
                          <td style={{ padding: '15px', color: '#475569', fontWeight: '500' }}>
                            {payment.payment_date ? payment.payment_date.substring(0, 10) : ''}
                          </td>
                          <td style={{ padding: '15px', color: '#0f172a', fontWeight: '600' }}>
                            {payment.payment_purpose}
                          </td>
                          <td style={{ padding: '15px', fontWeight: 'bold', color: '#10b981' }}>
                            {payment.amount} ৳
                          </td>
                          <td style={{ padding: '15px', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '13px', 
                              fontWeight: 'bold',
                              backgroundColor: payment.payment_status === 'Paid' ? '#d1fae5' : '#fef3c7',
                              color: payment.payment_status === 'Paid' ? '#047857' : '#d97706'
                            }}>
                              {payment.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                          No payment records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "classes" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>Class Lectures</h1>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '50px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', maxWidth: '700px' }}>
              <p style={{ fontSize: '50px', marginBottom: '15px' }}>📺</p>
              <h2 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 'bold', marginBottom: '15px' }}>Watch Your Classes Online totally FREE!</h2>
              <a href="https://youtube.com/@dreamupacademy?si=TS7c8-VM9lTf5Zxr" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '14px 30px', backgroundColor: '#dc2626', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)' }}>
                ▶ Open Dream Up Academy
              </a>
            </div>
          </>
        )}

        {/* EXAM RESULTS */}
        {activeTab === "results" && (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '50px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 'bold' }}>Coming Soon</h2>
            <p style={{ color: '#64748b', marginTop: '10px' }}>This feature is currently being updated for the student portal.</p>
          </div>
        )}

      </div>
    </div>
  );
}