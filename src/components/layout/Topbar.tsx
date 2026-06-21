import { Mountain } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Topbar menampilkan profil singkat user di sisi kanan halaman.
export function Topbar() {
  const { user } = useAuth();
  const name = user?.name || "Pengguna";
  const roleLabel = user?.role === "admin" ? "Administrator" : "Pengguna";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:h-[88px] lg:justify-end lg:px-8">
      <div className="flex min-w-0 items-center gap-2 lg:hidden">
        <Mountain className="h-8 w-8 shrink-0 text-[#c7902e]" strokeWidth={1.7} />
        <div className="min-w-0">
          <p className="truncate font-serif text-lg font-bold text-[#0a2a55]">SPK Hotel</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c7902e]">
            Kintamani
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a2a55] text-base font-bold text-white shadow-[0_10px_20px_rgba(10,42,85,0.18)] sm:h-11 sm:w-11 sm:text-lg">
          {getInitial(name)}
        </div>
        <div className="hidden min-w-0 text-left leading-tight sm:block">
          <p className="max-w-[180px] truncate text-sm font-bold text-[#0a2a55]">{name}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{roleLabel}</p>
        </div>
      </div>
    </header>
  );
}

// getInitial mengambil huruf pertama nama untuk avatar topbar.
function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "U";
}
