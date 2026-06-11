import {
  BarChart3,
  Calculator,
  Grid2X2,
  LockKeyhole,
  LogIn,
  Mountain,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import heroImage from "../../assets/hero-kintamani.png";
import { useAuth } from "../../context/AuthContext";

// LandingPage menjadi pintu awal sebelum user login atau register.
export function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
  }

  return (
    <main className="h-screen overflow-hidden bg-white">
      {/* Navigation */}
      <header className="relative z-20 flex h-[82px] items-center justify-between border-b border-slate-900/10 bg-white/95 px-6 md:h-[86px] md:px-[5vw]">
        <Link
          className="flex min-w-0 items-center gap-3 font-serif text-[22px] font-bold tracking-normal text-[#0a2a55] md:gap-4 md:text-[clamp(25px,2.4vw,34px)]"
          to="/"
        >
          <Mountain className="h-9 w-9 shrink-0 text-[#c7902e] md:h-10 md:w-10" strokeWidth={1.8} />
          <span className="truncate">SPK Hotel Kintamani</span>
        </Link>

        <nav className="flex items-center gap-8 md:gap-14" aria-label="Navigasi awal">
          <a className="relative hidden text-[17px] font-bold text-[#0a2a55] md:block" href="#beranda">
            Beranda
            <span className="absolute -bottom-[18px] left-0 h-0.5 w-full rounded-full bg-[#c7902e]" />
          </a>

          <Link
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-lg bg-[#0a2a55] px-4 font-bold text-white shadow-[0_12px_24px_rgba(10,42,85,0.2)] md:min-h-12 md:min-w-[120px] md:px-5"
            to="/login"
          >
            <LockKeyhole className="h-5 w-5" />
            <span className="hidden md:inline">Login</span>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-[calc(100vh-82px)] overflow-hidden bg-cover bg-center md:h-[calc(100vh-86px)]"
        id="beranda"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0.96)_23%,rgba(255,255,255,0.64)_43%,rgba(255,255,255,0.08)_72%),linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.7)_100%)]" />

        {/* Hero Copy */}
        <div className="relative z-10 grid max-w-[520px] gap-2 px-6 pt-5 md:px-0 md:pl-[5vw] md:pt-8 lg:pt-10">
          <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#c7902e] md:text-[15px]">
            Sistem Pendukung Keputusan
          </span>

          <h1 className="m-0 font-serif text-[38px] font-bold leading-[1.04] tracking-normal text-[#0a2a55] md:text-[clamp(46px,5vw,62px)]">
            Temukan Hotel
            <br />
            Terbaik di
            <br />
            <em className="not-italic text-[#c7902e]">Kintamani</em>
          </h1>

          <span className="h-[3px] w-14 rounded-full bg-[#c7902e]" />

          <p className="m-0 max-w-[500px] text-sm leading-[1.65] text-[#17345f] md:text-base">
            SPK Hotel Kintamani membantu Anda mendapatkan rekomendasi hotel secara
            objektif dengan metode <strong className="text-[#c7902e]">MOORA.</strong>
          </p>

          {/* Login Action */}
          <div className="mt-2 flex flex-wrap gap-5">
            <Link
              className="inline-flex min-h-11 min-w-36 items-center justify-center gap-3 rounded-lg bg-[#0a2a55] px-5 text-sm font-extrabold text-white shadow-[0_18px_34px_rgba(10,42,85,0.22)] transition-all hover:-translate-y-0.5 md:min-h-[50px] md:min-w-[170px] md:px-6 md:text-base"
              to="/login"
            >
              <LogIn className="h-5 w-5 md:h-[23px] md:w-[23px]" />
              <span>Login</span>
            </Link>
          </div>

          {/* Benefit Pills */}
          <div className="mt-2 flex flex-wrap gap-2 md:mt-4 md:gap-3" aria-label="Keunggulan sistem">
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#d7e0ec] bg-white/85 px-3 text-xs font-bold text-[#0a2a55] shadow-[0_8px_18px_rgba(15,23,42,0.05)] md:min-h-10 md:gap-3 md:px-4 md:text-sm">
              <Target className="h-[17px] w-[17px] text-blue-600 md:h-5 md:w-5" />
              Objektif
            </span>
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#d7e0ec] bg-white/85 px-3 text-xs font-bold text-[#0a2a55] shadow-[0_8px_18px_rgba(15,23,42,0.05)] md:min-h-10 md:gap-3 md:px-4 md:text-sm">
              <Zap className="h-[17px] w-[17px] text-[#c7902e] md:h-5 md:w-5" />
              Cepat
            </span>
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#d7e0ec] bg-white/85 px-3 text-xs font-bold text-[#0a2a55] shadow-[0_8px_18px_rgba(15,23,42,0.05)] md:min-h-10 md:gap-3 md:px-4 md:text-sm">
              <Grid2X2 className="h-[17px] w-[17px] text-blue-600 md:h-5 md:w-5" />
              Berbasis Kriteria
            </span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="absolute right-4 top-[48%] z-10 grid w-[calc(100%-32px)] gap-2 md:right-8 md:top-[43%] md:w-[min(42vw,470px)] md:gap-3 lg:right-[clamp(28px,4vw,72px)] lg:top-[38%] lg:w-[min(38vw,470px)] lg:gap-4">
          <FeatureCard
            description="Temukan hotel terbaik"
            icon={<Trophy className="h-5 w-5 md:h-[26px] md:w-[26px]" />}
            iconClassName="bg-[#fff5df] text-[#c7902e]"
            title="Rekomendasi"
          />
          <FeatureCard
            description="Metode keputusan objektif"
            icon={<Calculator className="h-5 w-5 md:h-[26px] md:w-[26px]" />}
            iconClassName="bg-[#eaf8ec] text-[#2f9e44]"
            title="MOORA"
          />
          <FeatureCard
            description="Urutan hasil rekomendasi"
            icon={<BarChart3 className="h-5 w-5 md:h-[26px] md:w-[26px]" />}
            iconClassName="bg-[#f2eafe] text-[#6d28d9]"
            title="Ranking"
          />
        </div>
      </section>
    </main>
  );
}

// FeatureCard menampilkan ringkasan fitur utama di sisi kanan hero.
function FeatureCard({
  description,
  icon,
  iconClassName,
  title
}: {
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
}) {
  return (
    <div className="relative flex min-h-[58px] min-w-0 items-center gap-3 rounded-lg border border-[#d7e0ec] bg-white/80 p-3 shadow-[0_18px_34px_rgba(15,23,42,0.09)] backdrop-blur-md md:min-h-[72px] md:gap-4 md:p-4 lg:min-h-[92px] lg:px-6 lg:py-4">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full md:h-[42px] md:w-[42px] lg:h-14 lg:w-14 ${iconClassName}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <strong className="block text-sm font-extrabold text-[#0a2a55] md:text-base lg:text-[17px]">
          {title}
        </strong>
        <small className="mt-1 block text-xs leading-snug text-[#5d6f8a] md:text-[13px] lg:text-sm">
          {description}
        </small>
      </div>
      <span
        aria-hidden="true"
        className="absolute right-7 top-1/2 hidden -translate-y-1/2 text-4xl font-extrabold tracking-normal text-[#0a2a55]/20 lg:block"
      >
        //
      </span>
    </div>
  );
}
