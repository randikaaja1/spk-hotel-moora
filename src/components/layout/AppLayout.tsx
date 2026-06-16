import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// AppLayout menyusun sidebar, topbar, dan area konten untuk halaman setelah login.
export function AppLayout() {
  return (
    <div className="grid h-screen overflow-hidden bg-[#f7faff] text-[#0a2a55] lg:grid-cols-[296px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
