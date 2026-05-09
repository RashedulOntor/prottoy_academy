"use client";

import Image from "next/image";

 
const faculties = [
  {
    id: 1,
    name: "Rashedul Ontor",
    designation: "Founder and CEO",
    education: "B.Sc in CSE (Studying at Brahmaputra International University)",
    subjects: "Math, ICT and Science",
    experience: "6+ Years",
    photo: "/faculty/rashedul.jpg", 
  },
  {
    id: 2,
    name: "Md. Shohel Rana",
    designation: "Founder and MD",
    education: "BA Hons in Bangla (Govt. Ashek Mahmud College)",
    subjects: "Bangla",
    experience: "12+ Years",
    photo: "/faculty/shohel.jpg",
  },
  {
    id: 3,
    name: "Ratan Mahmud",
    designation: "Instructor",
    education: "B.Sc in Math (Studying at Govt. Ashek Mahmud College)",
    subjects: "Math and Science",
    experience: "3+ Years",
    photo: "/faculty/ratan.jpg",
  },
  {
    id: 4,
    name: "Md. Maruf Hasan",
    designation: "Instructor",
    education: "BA Hons in English (Studying at Govt. Ashek Mahmud College)",
    subjects: "English",
    experience: "3+ Years",
    photo: "/faculty/maruf.jpg",
  },
  {
    id: 5,
    name: "Sayan Mahmud Mahi",
    designation: "Instructor",
    education: "B.Sc in Textile Engineering (Jamalpur Textile Engineering College)",
    subjects: "Science",
    experience: "3+ Years",
    photo: "/faculty/sayan.jpg",
  }
];

export default function FacultyPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '50px 20px', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1e293b', margin: '0 0 10px 0' }}>Our Honorable Faculty</h1>
        <p style={{ color: '#64748b', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Meet the experienced and dedicated teachers of Prottoy Academy who are committed to building your bright future.
        </p>
      </div>

      {/* Grid Container for Faculty Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {faculties.map((teacher) => (
          <div key={teacher.id} style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'transform 0.3s ease', cursor: 'pointer' }}
               onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            
            {/* Image Section */}
            <div style={{ height: '280px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {/* যদি ছবি না থাকে, তবে একটি ডামি আইকন দেখাবে */}
              <span style={{ fontSize: '50px', color: '#94a3b8', position: 'absolute' }}>👨‍🏫</span>
              
              {/* রিয়েল ছবি শো করার কোড */}
              <Image 
                src={teacher.photo} 
                alt={teacher.name} 
                fill 
                style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                // ছবি লোড না হলে এরর যেন পুরো সাইট ক্র্যাশ না করে, তার ব্যবস্থা
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Teacher Details */}
            <div style={{ padding: '25px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 5px 0' }}>{teacher.name}</h2>
              <p style={{ color: '#0284c7', fontSize: '14px', fontWeight: '600', margin: '0 0 15px 0' }}>{teacher.designation}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>🎓</span>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Education</span>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{teacher.education}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>📚</span>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subjects</span>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{teacher.subjects}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>⏳</span>
                  <div>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</span>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{teacher.experience}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}