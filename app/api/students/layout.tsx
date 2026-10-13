"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// মোবাইলের জন্য মেনু আইকন
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

  // স্টুডেন্টদের জন্য মেনু লিস্ট (আপনার পেজ অনুযায়ী লিংকগুলো পরিবর্তন করতে পারেন)
  const menuItems = [
    { name: "My Dashboard", href: "/student", icon: "📊" },
    { name: "Class Lectures", href: "/student/lectures", icon: "🎥" },
    { name: "My Results", href: "/student/results", icon: "🏆" },
    { name: "Payment History", href: "/student/payments", icon: "💳" },
    { name: "Notices", href: "/student/notices", icon: "📢" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay (কালো শ্যাডো) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (কালো অংশ) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
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

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          {menuItems.map((item) => {
            // স্টুডেন্ট পেজের আইডিতে থাকলেও যেন মেনু অ্যাক্টিভ দেখায়
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)} // মোবাইলে ক্লিক করলে মেনু বন্ধ হবে
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area (ডানদিকের সাদা অংশ) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header (শুধু মোবাইলে দেখাবে) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-30 border-b">
          <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">PA</span> Student
          </div>
          <button
            className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-blue-50 active:bg-blue-100 transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
        </header>

        {/* Dynamic Page Content (স্টুডেন্টের ফর্ম বা ড্যাশবোর্ড এখানে বসবে) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}