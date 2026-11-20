"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Award,
  Bell,
  CreditCard,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", tab: "dashboard", href: "/admin?tab=dashboard", icon: LayoutDashboard },
  { name: "Students List", tab: "studentsList", href: "/admin?tab=studentsList", icon: Users },
  { name: "Add Student", tab: "addNewStudent", href: "/admin?tab=addNewStudent", icon: UserPlus },
  { name: "Faculty List", tab: "facultyList", href: "/admin?tab=facultyList", icon: GraduationCap },
  { name: "Exam Results", tab: "examResults", href: "/admin?tab=examResults", icon: Award },
  { name: "Notice Board", tab: "notices", href: "/admin?tab=notices", icon: Bell },
  { name: "Payments", tab: "payments", href: "/admin?tab=payments", icon: CreditCard },
];

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";

  return (
    <nav className="p-3.5 space-y-1.5 overflow-y-auto h-[calc(100vh-80px)]">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.tab;

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen print:h-auto bg-[#f8fafc] print:bg-white overflow-hidden print:overflow-visible font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="no-print print:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`no-print print:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src="/prottoy academy logo.png"
              alt="Prottoy Academy"
              className="w-9 h-9 rounded-full object-cover border border-white/20 bg-white"
            />
            <div>
              <span className="block text-sm font-bold tracking-tight text-white leading-tight">
                Prottoy Academy
              </span>
              <span className="block text-[11px] font-medium text-emerald-400">
                Admin Panel
              </span>
            </div>
          </div>
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading menu...</div>}>
          <SidebarNav onNavigate={() => setIsSidebarOpen(false)} />
        </Suspense>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <header className="no-print print:hidden md:hidden flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200 z-30">
          <div className="flex items-center gap-2.5">
            <img
              src="/prottoy academy logo.png"
              alt="PA"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span className="text-base font-bold text-slate-900">Prottoy Admin</span>
          </div>
          <button
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible bg-[#f8fafc] print:bg-white p-4 md:p-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}