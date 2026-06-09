import { ArrowRight, BarChart3, Building2, ShieldCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// LandingPage menjadi pintu awal sebelum user login atau register.
export function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
  }

  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">SPK Hotel Kintamani</span>
          <h1>MOORA</h1>
          <p>
            Rekomendasi hotel berbasis kriteria biaya, fasilitas, aksesibilitas,
            lokasi, dan view.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" to="/login">
              <ArrowRight size={18} />
              <span>Masuk</span>
            </Link>
            <Link className="text-link" to="/register">
              Daftar akun
            </Link>
          </div>
        </div>

        <div className="landing-visual" aria-hidden="true">
          <div className="mock-window">
            <div className="mock-toolbar">
              <span />
              <span />
              <span />
            </div>
            <div className="mock-grid">
              <div className="mock-sidebar" />
              <div className="mock-content">
                <div className="mock-card wide" />
                <div className="mock-bars">
                  <span style={{ height: "76%" }} />
                  <span style={{ height: "52%" }} />
                  <span style={{ height: "88%" }} />
                  <span style={{ height: "64%" }} />
                </div>
                <div className="mock-row" />
                <div className="mock-row short" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-strip">
        <div>
          <Building2 size={20} />
          <span>Data hotel</span>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>Role access</span>
        </div>
        <div>
          <BarChart3 size={20} />
          <span>Ranking MOORA</span>
        </div>
      </section>
    </main>
  );
}
