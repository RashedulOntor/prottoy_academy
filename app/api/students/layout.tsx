"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "My Dashboard", href: "?tab=dashboard", icon: "📊" },
    { name: "My Profile", href: "?tab=profile", icon: "👤" },
    { name: "Class Lectures", href: "?tab=classes", icon: "🎥" },
    { name: "Faculty List", href: "?tab=faculty", icon: "👨‍🏫" },
    { name: "Exam Results", href: "?tab=results", icon: "🏆" },
    { name: "Payment History", href: "?tab=payments", icon: "💳" },
  ];

  return (
    <div className="flex h-screen print:h-auto bg-gray-50 print:bg-white overflow-hidden print:overflow-visible font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden print:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden when printing */}
      <aside
        className={`no-print print:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">PA</div>
            <span className="text-lg font-bold tracking-wide">Student Portal</span>
          </div>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block">
        <header className="no-print print:hidden md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-30 border-b">
          <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">PA</span> Student
          </div>
          <button
            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-blue-50"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible bg-slate-50 print:bg-white p-4 md:p-8 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}