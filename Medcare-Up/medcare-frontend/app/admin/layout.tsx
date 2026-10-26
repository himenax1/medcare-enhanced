"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Receipt, 
  CalendarClock, 
  Users, 
  Fingerprint, 
  UserCog, 
  LogOut, 
  Activity 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("medcare_token");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navItems = [
    { name: "Command Center", href: "/admin", icon: LayoutDashboard },
    { name: "Automated Billing", href: "/admin/billing", icon: Receipt },
    { name: "Schedule & Ops", href: "/admin/schedule", icon: CalendarClock },
    { name: "Employee Management", href: "/admin/employees", icon: Users },
    { name: "Digital Forensics", href: "/admin/forensics", icon: Fingerprint },
    { name: "Clinical Control", href: "/admin/clinical", icon: Activity },
    { name: "Profile & Security", href: "/admin/security", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans overflow-hidden">
      {/* PERSISTENT SIDEBAR */}
      <div className="w-72 h-screen sticky top-0 shrink-0 bg-slate-950 border-r border-slate-800/60 flex flex-col justify-between hidden md:flex z-20 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800/60 flex items-center gap-3 bg-slate-900/20">
            <ShieldCheck className="w-10 h-10 text-indigo-500 shrink-0 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div>
              <h1 className="text-sm font-extrabold tracking-widest uppercase text-white leading-tight">
                MedCare<br />
                <span className="text-indigo-400 text-[10px]">Admin Console</span>
              </h1>
            </div>
          </div>

          {/* Nav Links */}
          <div className="p-4 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors ${
                    isActive
                      ? "bg-indigo-900/30 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 border border-transparent"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sticky Logout Button */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/20">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
          >
            <LogOut size={16} /> Secure Logout
          </button>
        </div>
      </div>

      {/* PAGE CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-scroll">
        {children}
      </div>
    </div>
  );
}