import { useAuth } from "../../context/AuthContext";

// Topbar menampilkan profil singkat user di sisi kanan halaman.
export function Topbar() {
  const { user } = useAuth();
  const name = user?.name || "Pengguna";
  const roleLabel = user?.role === "admin" ? "Administrator" : "Pengguna";

  return (
    <header className="sticky top-0 z-20 flex h-[88px] shrink-0 items-center justify-end border-b border-slate-200/80 bg-white/95 px-5 shadow-sm backdrop-blur sm:px-7 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0a2a55] text-lg font-bold text-white shadow-[0_10px_20px_rgba(10,42,85,0.18)]">
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
