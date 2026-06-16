import { Link } from "react-router-dom";

// NotFoundPage menampilkan fallback ketika route tidak tersedia.
export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7faff] px-5 text-center">
      <div>
        <h1 className="text-7xl font-bold text-[#0a2a55]">404</h1>
        <p className="mt-3 text-sm font-medium text-slate-500">Halaman tidak ditemukan.</p>
        <Link
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#0a2a55] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(10,42,85,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0f3f78]"
          to="/"
        >
        <span>Kembali</span>
      </Link>
      </div>
    </main>
  );
}
