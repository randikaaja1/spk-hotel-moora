import {
  BarChart3,
  Building2,
  Calculator,
  ClipboardList,
  Gauge,
  Hotel,
  ListChecks,
  LogOut,
  Mountain,
  Settings2,
  SlidersHorizontal
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types/api";

type SidebarItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

const adminSections: SidebarSection[] = [
  {
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: Gauge }]
  },
  {
    title: "Data Master",
    items: [
      { to: "/admin/hotels", label: "Hotel", icon: Building2 },
      { to: "/admin/criteria", label: "Kriteria", icon: ClipboardList }
    ]
  },
  {
    title: "Proses",
    items: [{ to: "/admin/moora", label: "Perhitungan MOORA", icon: Calculator }]
  },
  {
    title: "Hasil",
    items: [{ to: "/admin/moora?view=ranking", label: "Hasil Ranking", icon: BarChart3 }]
  }
];

const userSections: SidebarSection[] = [
  {
    items: [{ to: "/hotels", label: "Hotel", icon: Hotel }]
  },
  {
    title: "Preferensi",
    items: [{ to: "/preferences", label: "Bobot Kriteria", icon: SlidersHorizontal }]
  },
  {
    title: "Hasil",
    items: [{ to: "/recommendations", label: "Hasil Ranking", icon: ListChecks }]
  }
];

// Sidebar menampilkan navigasi utama sesuai role user.
export function Sidebar() {
  const { user, logout } = useAuth();
  const sections = user?.role === "admin" ? adminSections : userSections;

  return (
    <aside className="hidden h-screen min-h-0 flex-col border-r border-slate-200/80 bg-white/95 px-5 py-7 shadow-[18px_0_50px_rgba(10,42,85,0.04)] lg:flex">
      <NavLink className="flex items-center gap-3 px-3" to={getHomePath(user?.role)}>
        <Mountain className="h-9 w-9 text-[#c7902e]" strokeWidth={1.7} />
        <span className="flex flex-col">
          <strong className="font-serif text-[22px] font-bold uppercase tracking-[0.12em] text-[#0a2a55]">
            SPK Hotel
          </strong>
          <small className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#c7902e]">
            Kintamani
          </small>
        </span>
      </NavLink>

      <nav className="mt-12 flex min-h-0 flex-1 flex-col gap-8 overflow-hidden">
        {sections.map((section, index) => (
          <SidebarSectionGroup key={`${section.title ?? "main"}-${index}`} section={section} />
        ))}
      </nav>

      <button
        className="mt-6 flex h-12 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
        onClick={logout}
        type="button"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

// SidebarSectionGroup mengelompokkan link agar struktur menu mudah dipindah.
function SidebarSectionGroup({ section }: { section: SidebarSection }) {
  return (
    <div>
      {section.title ? (
        <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {section.title}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {section.items.map((item) => (
          <SidebarNavLink item={item} key={item.label} />
        ))}
      </div>
    </div>
  );
}

// SidebarNavLink memberi gaya aktif pada link menu yang sedang dibuka.
function SidebarNavLink({ item }: { item: SidebarItem }) {
  const Icon = item.icon;
  const location = useLocation();
  const currentTarget = `${location.pathname}${location.search}`;
  const isActive = currentTarget === item.to;

  return (
    <Link
      className={`flex h-12 items-center gap-3 rounded-lg px-4 text-[15px] font-semibold transition ${
        isActive
          ? "bg-[#0a2a55] text-white shadow-[0_14px_28px_rgba(10,42,85,0.22)]"
          : "text-slate-600 hover:bg-blue-50 hover:text-[#0a2a55]"
      }`}
      to={item.to}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

// getHomePath menentukan halaman awal berdasarkan role yang sedang aktif.
function getHomePath(role?: Role) {
  return role === "admin" ? "/admin/dashboard" : "/hotels";
}
