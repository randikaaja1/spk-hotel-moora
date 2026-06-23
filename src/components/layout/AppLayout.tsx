import { Outlet } from "react-router-dom";
import { MobileNav, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// AppLayout menyusun sidebar, topbar, dan area konten untuk halaman setelah login.
export function AppLayout() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f7faff] text-[#0a2a55]">
      <Sidebar />
      <div className="min-w-0 overflow-x-hidden lg:pl-[296px]">
        <Topbar />
        <main className="min-w-0 px-3 py-4 pb-28 sm:px-5 sm:py-5 lg:px-6 lg:pb-10 xl:px-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
