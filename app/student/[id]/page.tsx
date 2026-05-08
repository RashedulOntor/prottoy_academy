"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function StudentDashboard() {
  const { id } = useParams(); 
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      if (data.success) {
        const myInfo = data.data.find((s: any) => s.student_id === Number(id));
        if (myInfo) {
          setStudentData(myInfo);
          setEditForm({
            fullName: myInfo.full_name || "",
            fathersName: myInfo.fathers_name || "",
            mothersName: myInfo.mothers_name || "",
            className: myInfo.class_name || "",
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

  useEffect(() => {
    fetchMyData();
  }, [id]);

  const handleLogout = () => {
    router.push("/");
  };

  // Handle Profile Update (General Info)
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

  // Handle Password Update
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
        alert("✅ Password updated successfully! Use this for next login.");
        setNewPassword("");
      } else {
        alert("❌ Failed to update password.");
      }
    } catch (err) {
      alert("❌ Something went wrong while updating password.");
    } finally {
      setPassUpdateLoading(false);
    }
  };

  // Common Style for Inputs to ensure black text
  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    outline: 'none',
    color: '#000000', // Deep Black Text
    fontWeight: '500',
    backgroundColor: '#ffffff'
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Loading your portal...</h2></div>;
  }

  if (!studentData) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><h2>Student profile not found!</h2></div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f9ff', fontFamily: 'sans-serif' }}>
      
      {/* Sidebar Section */}
      <div style={{ width: '260px', backgroundColor: '#0369a1', color: 'white', padding: '25px 20px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #38bdf8', paddingBottom: '20px' }}>
          <Image src="/prottoy academy logo.png" alt="Logo" width={60} height={60} style={{ borderRadius: '10px', marginBottom: '10px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Prottoy Academy</h2>
          <span style={{ fontSize: '12px', backgroundColor: '#0284c7', padding: '3px 8px', borderRadius: '10px', marginTop: '8px' }}>Student Portal</span>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li onClick={() => setActiveTab("dashboard")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "dashboard" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>📊 Dashboard</li>
          <li onClick={() => setActiveTab("profile")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "profile" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>👤 My Profile</li>
          <li onClick={() => setActiveTab("classes")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "classes" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>🎥 Class Lectures</li>
          <li onClick={() => setActiveTab("results")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "results" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>🏆 Exam Results</li>
          <li onClick={() => setActiveTab("payments")} style={{ cursor: 'pointer', padding: '12px 15px', backgroundColor: activeTab === "payments" ? '#0284c7' : 'transparent', borderRadius: '8px', fontWeight: '500', transition: '0.2s' }}>💳 My Payments</li>
        </ul>

        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🚪 Logout</button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {activeTab === "dashboard" && (
          <>
            <h1 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '8px', fontWeight: 'bold' }}>Welcome, {studentData.full_name}!</h1>
            <p style={{ color: '#020202', marginBottom: '35px' }}>Academic Overview</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #f59e0b', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>Your Class</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{studentData.class_name}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #ef4444', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>Due Payments</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>৳ 0.00</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: '6px solid #10b981', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#64748b', fontSize: '16px', marginBottom: '10px' }}>Recent Exam</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '10px' }}>Result Pending</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "profile" && (
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
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Full Name:</span>
                    <span style={{ color: '#0f172a', fontWeight: '500' }}>{studentData.full_name}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Father's Name:</span>
                    <span style={{ color: '#0f172a' }}>{studentData.fathers_name || "Not provided"}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Mother's Name:</span>
                    <span style={{ color: '#0f172a' }}>{studentData.mothers_name || "Not provided"}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Class:</span>
                    <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>{studentData.class_name}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Phone (Login ID):</span>
                    <span style={{ color: '#0f172a' }}>{studentData.phone_number}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr' }}>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>Address:</span>
                    <span style={{ color: '#0f172a' }}>{studentData.address || "Not provided"}</span>
                  </div>

                  {/* SECURITY SECTION */}
                  <div style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '25px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '15px' }}>🛡️ Security Settings</h3>
                    <div style={{ maxWidth: '450px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Change Login Password</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Type new password"
                          style={inputStyle}
                        />
                        <button 
                          onClick={handlePasswordChange}
                          disabled={passUpdateLoading}
                          style={{ padding: '12px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
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
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Full Name</label>
                    <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} required style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Father's Name</label>
                      <input type="text" value={editForm.fathersName} onChange={e => setEditForm({...editForm, fathersName: e.target.value})} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Mother's Name</label>
                      <input type="text" value={editForm.mothersName} onChange={e => setEditForm({...editForm, mothersName: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Class</label>
                      <select value={editForm.className} onChange={e => setEditForm({...editForm, className: e.target.value})} required style={inputStyle}>
                        <option value="Class 6">Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                        <option value="SSC 2026">SSC 2026</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Address</label>
                      <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="submit" disabled={!!updateMsg} style={{ flex: 1, padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {updateMsg ? updateMsg : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '14px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
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

        {(activeTab === "results" || activeTab === "payments") && (
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '50px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', color: '#0f172a', fontWeight: 'bold' }}>Coming Soon</h2>
            <p style={{ color: '#64748b', marginTop: '10px' }}>This feature is currently being updated for the student portal.</p>
          </div>
        )}

      </div>
    </div>
  );
}