"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogIn,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  Award,
  Bell,
  Users,
  MapPin,
  ShieldCheck,
  FileText,
  ClipboardCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  User,
  Sparkles,
  PlayCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useUI } from "./components/UIProvider";

type PortalRoleHint = "student" | "faculty" | "admin";

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useUI();

  // Modals & Navigation
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRoleHint, setLoginRoleHint] = useState<PortalRoleHint>("student");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Live Public Data
  const [notices, setNotices] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [notRes, facRes] = await Promise.all([
          fetch(`/api/notices?t=${Date.now()}`, { cache: "no-store" }),
          fetch(`/api/faculty?t=${Date.now()}`, { cache: "no-store" }),
        ]);

        const notData = await notRes.json();
        if (notData.success && Array.isArray(notData.data)) {
          setNotices(notData.data.slice(0, 6));
        }

        const facData = await facRes.json();
        if (facData.success && Array.isArray(facData.data)) {
          setFaculties(facData.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const openLoginWithRole = (role: PortalRoleHint = "student") => {
    setLoginRoleHint(role);
    setErrorMsg("");
    setShowWelcomeModal(false);
    setShowLoginModal(true);
    setMobileMenuOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("লগইন সফল হয়েছে! পোর্টালে নিয়ে যাওয়া হচ্ছে...", "success");
        if (data.role === "admin") {
          router.push("/admin");
        } else if (data.role === "student") {
          router.push(`/student/${data.id}`);
        } else if (data.role === "faculty") {
          router.push(`/faculty/${data.id}`);
        } else {
          setErrorMsg("অজানা ইউজার রোল!");
          showToast("অজানা ইউজার রোল!", "error");
        }
      } else {
        setErrorMsg(data.message || "ভুল ইউজারনেম অথবা পাসওয়ার্ড।");
        showToast(data.message || "লগইন ব্যর্থ হয়েছে।", "error");
      }
    } catch (error) {
      setErrorMsg("লগইন ফেইল হয়েছে। নেটওয়ার্ক চেক করুন।");
      showToast("নেটওয়ার্ক সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Programs", href: "#programs" },
    { name: "Notices", href: "#notices" },
    { name: "Faculty", href: "#faculty" },
    { name: "Contact", href: "#contact" },
  ];

  const rolePlaceholder: Record<PortalRoleHint, string> = {
    student: "Enter Student ID (e.g. 202610001)",
    faculty: "Enter Faculty Username",
    admin: "Enter Admin Username",
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans scroll-smooth">
      {/* STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Brand */}
            <a href="#home" className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                <Image
                  src="/prottoy academy logo.png"
                  alt="Prottoy Academy"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="block text-base md:text-lg font-black text-slate-900 tracking-tight leading-none">
                  PROTTOY ACADEMY
                </span>
                <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">
                  প্রত্যয় একাডেমি • ভাবকী বাজার
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => openLoginWithRole("student")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" />
                Portal Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => openLoginWithRole("student")}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl"
            >
              <LogIn className="w-4 h-4" />
              Portal Login
            </button>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-[#0a192f] via-slate-900 to-[#0f2942] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                Bhabki Bazar, Melandah, Jamalpur • ESTD 2025
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Shaping Brighter Futures with{" "}
                <span className="text-emerald-400">Smart Education</span>
              </h1>

              <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
                Prottoy Academy combines dedicated academic mentoring for Class 6–10 with a modern digital portal for live results, attendance tracking, class materials, and official payment receipts.
              </p>

              {/* Quick Role Login Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => openLoginWithRole("student")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
                >
                  <GraduationCap className="w-4 h-4" />
                  Student Login
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openLoginWithRole("faculty")}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all"
                >
                  <Users className="w-4 h-4" />
                  Faculty Login
                </button>
                <button
                  onClick={() => openLoginWithRole("admin")}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm rounded-xl transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Portal
                </button>
              </div>
            </div>

            {/* Right Visual Portal Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shrink-0">
                    <Image
                      src="/prottoy academy logo.png"
                      alt="Prottoy Academy"
                      width={56}
                      height={56}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Integrated ERP Portal</h2>
                    <p className="text-xs text-slate-300">One unified login for everyone</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <Award className="w-5 h-5 text-emerald-400 mb-2" />
                    <p className="text-sm font-bold text-white">Digital Marksheet</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Auto GPA &amp; Print PDF</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <ClipboardCheck className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="text-sm font-bold text-white">Live Attendance</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Daily class tracking</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <FileText className="w-5 h-5 text-amber-400 mb-2" />
                    <p className="text-sm font-bold text-white">Money Receipt</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Official fee slips</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                    <BookOpen className="w-5 h-5 text-purple-400 mb-2" />
                    <p className="text-sm font-bold text-white">Study Materials</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">Notes, PDFs &amp; HW</p>
                  </div>
                </div>

                <button
                  onClick={() => openLoginWithRole("student")}
                  className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Your Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMIC PROGRAMS SECTION */}
      <section id="programs" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Academic Excellence
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
            Our Academic Programs
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2">
            Structured NCTB-aligned curriculum with regular assessments and personal care for every student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Junior Secondary (Class 6 – 8)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Strong foundation in Mathematics, Science, English, and ICT with interactive classroom guidance and weekly evaluations.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Concept-based Mathematics &amp; Science</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Regular Chapter-wise Class Tests</li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Secondary &amp; SSC (Class 9 – 10)</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Specialized batches for Science, Humanities, and Business Studies designed for top board exam performance.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Physics, Chemistry, Higher Math &amp; Biology</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full-Syllabus Model Tests &amp; CQ/MCQ Care</li>
            </ul>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Model Tests &amp; Digital Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Every exam result, attendance record, and study sheet is published directly to the student&apos;s personal portal.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant Online Marksheet &amp; GPA</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent Guardian Progress Updates</li>
            </ul>
          </div>
        </div>
      </section>

      {/* LIVE NOTICE BOARD SECTION */}
      <section id="notices" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
                <Bell className="w-3.5 h-3.5" /> Live Updates
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Official Notice Board</h2>
            </div>
            <button
              onClick={() => openLoginWithRole("student")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View All in Student Portal <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {dataLoading ? (
            <div className="text-center py-10 text-sm font-medium text-slate-400">Loading latest notices...</div>
          ) : notices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                        {n.target_class === "All" ? "General Notice" : n.target_class}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {n.created_at?.substring(0, 10)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{n.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">{n.content}</p>
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-4 pt-3 border-t border-slate-200/60">
                    Posted by {n.posted_by || "Admin"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-500 text-sm font-medium">
              No public notices published yet.
            </div>
          )}
        </div>
      </section>

      {/* OUR FACULTY SECTION */}
      <section id="faculty" className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Dedicated Mentors
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
            Meet Our Faculty
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-2">
            Experienced and passionate instructors committed to guiding students toward academic excellence.
          </p>
        </div>

        {dataLoading ? (
          <div className="text-center py-10 text-sm font-medium text-slate-400">Loading faculty members...</div>
        ) : faculties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculties.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="w-full aspect-square bg-slate-50 p-4">
                  <img
                    src={teacher.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                    alt={teacher.name}
                    className="w-full h-full object-cover rounded-xl border border-slate-200/60"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                  <p className="text-blue-600 font-semibold text-xs uppercase tracking-wider mt-0.5 mb-3">
                    {teacher.designation}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mt-auto">
                    {teacher.education && (
                      <p className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{teacher.education}</span>
                      </p>
                    )}
                    {teacher.subjects && (
                      <p className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700">{teacher.subjects}</span>
                      </p>
                    )}
                    {teacher.experience && (
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{teacher.experience}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-sm font-medium">
            Faculty profiles will appear here soon.
          </div>
        )}
      </section>

      {/* CONTACT & FOOTER */}
      <footer id="contact" className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white p-0.5">
                  <Image
                    src="/prottoy academy logo.png"
                    alt="Prottoy Academy"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">PROTTOY ACADEMY</h3>
                  <p className="text-xs text-emerald-400 font-medium">প্রত্যয় একাডেমি</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                An integrated academic coaching center and digital education management portal in Bhabki Bazar, Melandah, Jamalpur.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Portals</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => openLoginWithRole("student")} className="hover:text-white transition-colors">
                    Student Portal Login
                  </button>
                </li>
                <li>
                  <button onClick={() => openLoginWithRole("faculty")} className="hover:text-white transition-colors">
                    Faculty Portal Login
                  </button>
                </li>
                <li>
                  <button onClick={() => openLoginWithRole("admin")} className="hover:text-white transition-colors">
                    Admin Dashboard Login
                  </button>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@DreamUpAcademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" /> Free Video Lectures (YouTube)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Campus Address</h4>
              <div className="space-y-2.5 text-sm text-slate-400">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bhabki Bazar, 7 No. Charbani Pakuriya Union, Melandah, Jamalpur</span>
                </p>
                <p className="text-xs text-slate-500 pt-2">
                  For admission or portal login credentials, please contact the academy office.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Prottoy Academy. All rights reserved.</p>
            <p>Integrated Education Management System</p>
          </div>
        </div>
      </footer>

      {/* WELCOME POPUP MODAL (ON INITIAL VISIT) */}
      {showWelcomeModal && (
        <div
          onClick={() => setShowWelcomeModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
          >
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              aria-label="Close welcome popup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-gradient-to-br from-[#0a192f] to-slate-900 text-white p-7 text-center">
              <div className="w-16 h-16 bg-white rounded-full p-1.5 mx-auto mb-4 shadow-lg">
                <Image
                  src="/prottoy academy logo.png"
                  alt="Prottoy Academy"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold mb-2">
                <Sparkles className="w-3 h-3" /> Welcome to Prottoy Academy
              </span>
              <h2 className="text-2xl font-black tracking-tight">প্রত্যয় একাডেমিতে স্বাগতম</h2>
              <p className="text-xs text-slate-300 mt-1.5">
                ভাবকী বাজার, মেলান্দহ, জামালপুর
              </p>
            </div>

            <div className="p-6 text-center space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Access your <span className="font-semibold text-slate-900">Student, Faculty, or Admin Portal</span> for exam marksheets, attendance reports, class notes, and payment receipts.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => openLoginWithRole("student")}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Go to Portal Login
                </button>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
                >
                  Explore Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED PROFESSIONAL LOGIN MODAL */}
      {showLoginModal && (
        <div
          onClick={() => setShowLoginModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200"
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
              aria-label="Close login modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0">
                <Image
                  src="/prottoy academy logo.png"
                  alt="Prottoy Academy"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Portal Sign In</h2>
                <p className="text-xs text-slate-500 font-medium">Prottoy Academy ERP</p>
              </div>
            </div>

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
              {(["student", "faculty", "admin"] as PortalRoleHint[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setLoginRoleHint(role)}
                  className={`py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                    loginRoleHint === role
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="bg-rose-50 text-rose-600 border border-rose-200/70 px-4 py-3 rounded-xl text-xs font-semibold mb-5">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Login ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={rolePlaceholder[loginRoleHint]}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm text-sm transition-all disabled:opacity-50 mt-2 inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Signing in..." : "Secure Login"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}