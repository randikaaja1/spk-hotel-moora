import {
  BarChart3,
  Building2,
  Gauge,
  Home,
  Hotel,
  ListChecks,
  LogOut,
  Settings2,
  SlidersHorizontal
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../types/api";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/admin/hotels", label: "Hotel", icon: Building2 },
  { to: "/admin/criteria", label: "Kriteria", icon: Settings2 },
  { to: "/admin/moora", label: "MOORA", icon: BarChart3 }
];

const userLinks = [
  { to: "/hotels", label: "Hotel", icon: Hotel },
  { to: "/preferences", label: "Preferensi", icon: SlidersHorizontal },
  { to: "/recommendations", label: "Rekomendasi", icon: ListChecks }
];

// Sidebar menampilkan navigasi utama sesuai role user.
export function Sidebar() {
  const { user, logout } = useAuth();
  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <aside className="sidebar">
      <NavLink className="brand" to={getHomePath(user?.role)}>
        <span className="brand-mark">
          <Home size={18} />
        </span>
        <span>
          <strong>SPK Hotel</strong>
          <small>MOORA</small>
        </span>
      </NavLink>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink key={link.to} className="sidebar-link" to={link.to}>
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={logout} type="button">
        <LogOut size={18} />
        <span>Keluar</span>
      </button>
    </aside>
  );
}

// getHomePath menentukan halaman awal berdasarkan role yang sedang aktif.
function getHomePath(role?: Role) {
  return role === "admin" ? "/admin/dashboard" : "/hotels";
}
