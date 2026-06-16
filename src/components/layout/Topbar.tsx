import { Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Topbar menampilkan tombol menu, notifikasi, dan profil singkat user.
export function Topbar() {
  const { user } = useAuth();
  const name = user?.name || "Pengguna";
  const roleLabel = user?.role === "admin" ? "Administrator" : "Pengguna";

  return (
    <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 shadow-sm sm:px-7 lg:px-8">
      <button
        aria-label="Buka menu"
        className="flex h-11 w-11 items-center justify-center rounded-lg border-0 bg-transparent text-[#0a2a55] transition hover:bg-blue-50"
        type="button"
      >
        <Menu className="h-7 w-7" />
      </button>

      <div className="flex items-center gap-5">
        <button
          aria-label="Notifikasi"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-[#0a2a55] transition hover:bg-blue-50"
          type="button"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0a2a55] text-lg font-bold text-white shadow-[0_10px_20px_rgba(10,42,85,0.18)]">
            {getInitial(name)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-bold text-[#0a2a55]">{name}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{roleLabel}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
        </div>
      </div>
    </header>
  );
}

// getInitial mengambil huruf pertama nama untuk avatar topbar.
function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}
