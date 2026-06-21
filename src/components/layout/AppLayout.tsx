import { Outlet } from "react-router-dom";
import { MobileNav, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// AppLayout menyusun sidebar, topbar, dan area konten untuk halaman setelah login.
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-[#f7faff] text-[#0a2a55] lg:grid lg:grid-cols-[296px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <Topbar />
        <main className="px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
