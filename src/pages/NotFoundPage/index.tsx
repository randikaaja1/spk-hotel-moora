import { Link } from "react-router-dom";

// NotFoundPage menampilkan fallback ketika route tidak tersedia.
export function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Halaman tidak ditemukan.</p>
      <Link className="button button-primary" to="/">
        <span>Kembali</span>
      </Link>
    </main>
  );
}
