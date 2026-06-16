import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// AppLayout menyusun sidebar, topbar, dan area konten untuk halaman setelah login.
export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f7faff] text-[#0a2a55] lg:grid lg:grid-cols-[296px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <Topbar />
        <main className="px-5 py-6 pb-10 sm:px-7 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
