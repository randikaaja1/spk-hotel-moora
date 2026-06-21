import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  Trophy,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../../assets/hero-kintamani.png";
import type { Criterion } from "../../../types/criterion";
import type { DashboardSummary } from "../../../types/dashboard";
import type { Hotel } from "../../../types/hotel";
import type { RecommendationItem } from "../../../types/recommendation";
import { formatDateTime, formatNumber } from "../../../utils/formatters";

interface DashboardHeroProps {
  name: string;
}

interface DashboardStatsProps {
  results: RecommendationItem[];
  summary: DashboardSummary | null;
}

interface DashboardRankingTableProps {
  results: RecommendationItem[];
}

interface DashboardInsightGridProps {
  criteria: Criterion[];
  hotels: Hotel[];
  latestCreatedAt: string;
  results: RecommendationItem[];
}

const rankColors = ["bg-amber-100", "bg-slate-100", "bg-orange-100", "bg-blue-50", "bg-indigo-50"];

// DashboardHero menampilkan sapaan admin dan kartu tanggal hari ini.
export function DashboardHero({ name }: DashboardHeroProps) {
  const today = new Date();
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(today);
  const dayLabel = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(today);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold tracking-tight text-[#0a2a55] sm:text-2xl">
          Selamat datang, {name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Berikut ringkasan sistem pendukung keputusan hotel di Kintamani.
        </p>
      </div>

      <div className="flex h-14 w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm sm:h-16 sm:min-w-[220px] sm:w-auto sm:gap-4 sm:px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0a2a55] sm:h-11 sm:w-11">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0a2a55]">{dateLabel}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{dayLabel}</p>
        </div>
      </div>
    </div>
  );
}

// DashboardStats menampilkan empat kartu metrik utama pada dashboard.
export function DashboardStats({ results, summary }: DashboardStatsProps) {
  const topHotel = summary?.top_recommendation?.hotel_name || results[0]?.hotel.name || "Belum ada";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        description="Hotel terdaftar"
        icon={<Building2 className="h-5 w-5" />}
        iconTone="bg-blue-50 text-blue-700"
        label="Total Hotel"
        value={summary?.total_hotels ?? 0}
      />
      <MetricCard
        description="Kriteria penilaian"
        icon={<ClipboardList className="h-5 w-5" />}
        iconTone="bg-emerald-50 text-emerald-700"
        label="Total Kriteria"
        value={summary?.total_criteria ?? 0}
      />
      <MetricCard
        description="User terdaftar"
        icon={<Users className="h-5 w-5" />}
        iconTone="bg-amber-50 text-amber-700"
        label="Total Pengguna"
        value={summary?.total_users ?? 0}
      />
      <MetricCard
        actionLabel="Lihat detail"
        description="Ranking tertinggi"
        icon={<Trophy className="h-5 w-5" />}
        iconTone="bg-violet-50 text-violet-700"
        label="Rekomendasi Terbaik"
        to="/admin/moora?view=ranking"
        value={topHotel}
      />
    </div>
  );
}

// DashboardRecommendationGrid menyusun tabel Top 5 rekomendasi terbaru.
export function DashboardRecommendationGrid({ results }: { results: RecommendationItem[] }) {
  return (
    <div className="grid gap-4">
      <DashboardRankingTable results={results} />
    </div>
  );
}

// DashboardInsightGrid menampilkan insight hasil MOORA dan kesiapan data hotel.
export function DashboardInsightGrid({
  criteria,
  hotels,
  latestCreatedAt,
  results
}: DashboardInsightGridProps) {
  const distribution = buildDistribution(results);
  const completeness = buildCompleteness(hotels, criteria);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0a2a55]">Distribusi Nilai MOORA</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {latestCreatedAt
                ? `Hasil terakhir: ${formatDateTime(latestCreatedAt)}`
                : "Belum ada hasil perhitungan tersimpan."}
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <EmptyRecommendation compact label="Distribusi akan tampil setelah ranking tersedia." />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InsightMetric label="Nilai Tertinggi" value={formatNumber(distribution.highest, 5)} />
            <InsightMetric label="Rata-rata Yi" value={formatNumber(distribution.average, 5)} />
            <InsightMetric label="Nilai Terendah" value={formatNumber(distribution.lowest, 5)} />
            <InsightMetric label="Selisih Rank 1-2" value={formatNumber(distribution.gapTopTwo, 5)} />
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
              completeness.reviewHotels > 0
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {completeness.reviewHotels > 0 ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Activity className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0a2a55]">Status Kelengkapan Data</h2>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              Mengecek nilai hotel terhadap {criteria.length} kriteria aktif.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InsightMetric label="Hotel Lengkap" value={`${completeness.completeHotels}/${hotels.length}`} />
          <InsightMetric label="Perlu Dicek" value={`${completeness.reviewHotels} Hotel`} />
          <InsightMetric label="Nilai Kosong" value={String(completeness.missingValues)} />
          <InsightMetric label="Nilai 0" value={String(completeness.zeroValues)} />
        </div>
      </section>
    </div>
  );
}

// MetricCard membuat kartu statistik kecil dengan ikon, nilai, dan aksi opsional.
function MetricCard({
  actionLabel,
  description,
  icon,
  iconTone,
  label,
  to,
  value
}: {
  actionLabel?: string;
  description: string;
  icon: ReactNode;
  iconTone: string;
  label: string;
  to?: string;
  value: number | string;
}) {
  return (
    <div className="flex min-h-[112px] items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[126px] sm:gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${iconTone}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 line-clamp-2 break-words text-xl font-bold leading-tight tracking-tight text-[#0a2a55] sm:text-2xl">
          {value}
        </p>
        {actionLabel && to ? (
          <Link className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700" to={to}>
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

// DashboardRankingTable menampilkan Top 5 hasil rekomendasi terbaru.
function DashboardRankingTable({ results }: DashboardRankingTableProps) {
  const topResults = results.slice(0, 5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-bold text-[#0a2a55]">Top 5 Rekomendasi Hotel</h2>
      {topResults.length === 0 ? (
        <EmptyRecommendation label="Belum ada ranking. Jalankan perhitungan MOORA terlebih dahulu." />
      ) : (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-100">
          <div className="grid grid-cols-[44px_minmax(0,1fr)_90px] bg-slate-50 px-3 py-3 text-[10px] font-bold uppercase text-slate-500 sm:grid-cols-[60px_minmax(0,1fr)_150px] sm:px-4 sm:text-[11px]">
            <span>Rank</span>
            <span>Hotel</span>
            <span className="text-right">Nilai Preferensi</span>
          </div>
          <div className="divide-y divide-slate-100">
            {topResults.map((item, index) => (
              <div
                className="grid grid-cols-[44px_minmax(0,1fr)_90px] items-center px-3 py-3 sm:grid-cols-[60px_minmax(0,1fr)_150px] sm:px-4"
                key={`${item.rank}-${item.hotel.id}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-[#0a2a55] ${
                    rankColors[index] ?? "bg-slate-100"
                  }`}
                >
                  {item.rank}
                </span>
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <img
                    alt=""
                    className="hidden h-10 w-16 rounded-md object-cover sm:block"
                    src={heroImage}
                  />
                  <span className="truncate text-sm font-bold text-[#0a2a55]">{item.hotel.name}</span>
                </div>
                <span className="text-right text-xs font-bold text-[#0a2a55] sm:text-sm">
                  {formatNumber(item.preference_value, 5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Link
        className="mt-5 flex h-12 items-center justify-between rounded-lg border border-slate-200 px-4 text-sm font-semibold text-[#0a2a55] transition hover:bg-blue-50"
        to="/admin/moora?view=ranking"
      >
        Lihat semua ranking
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </Link>
    </section>
  );
}

// EmptyRecommendation menampilkan pesan kosong yang konsisten untuk tabel dan grafik.
function EmptyRecommendation({ compact = false, label }: { compact?: boolean; label: string }) {
  return (
    <div
      className={`mt-5 flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center text-sm font-medium text-slate-500 ${
        compact ? "min-h-[132px]" : "min-h-[260px]"
      }`}
    >
      {label}
    </div>
  );
}

// InsightMetric menampilkan angka ringkas untuk panel insight dashboard.
function InsightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-[#0a2a55]">{value}</p>
    </div>
  );
}

// buildDistribution menghitung sebaran nilai preferensi hasil MOORA terbaru.
function buildDistribution(results: RecommendationItem[]) {
  const values = results.map((item) => item.preference_value);
  const highest = values.length > 0 ? Math.max(...values) : 0;
  const lowest = values.length > 0 ? Math.min(...values) : 0;
  const average = values.length > 0 ? values.reduce((total, value) => total + value, 0) / values.length : 0;
  const gapTopTwo = results.length > 1 ? results[0].preference_value - results[1].preference_value : 0;

  return { average, gapTopTwo, highest, lowest };
}

// buildCompleteness menghitung kelengkapan nilai kriteria untuk seluruh hotel.
function buildCompleteness(hotels: Hotel[], criteria: Criterion[]) {
  const criterionIDs = criteria.map((criterion) => criterion.id);
  let completeHotels = 0;
  let missingValues = 0;
  let reviewHotels = 0;
  let zeroValues = 0;

  for (const hotel of hotels) {
    let needsReview = false;

    for (const criterionID of criterionIDs) {
      const value = hotel.criterion_values?.find((item) => item.criterion_id === criterionID);
      if (!value) {
        missingValues += 1;
        needsReview = true;
        continue;
      }

      if (value.value === 0) {
        zeroValues += 1;
        needsReview = true;
      }
    }

    if (needsReview) {
      reviewHotels += 1;
    } else {
      completeHotels += 1;
    }
  }

  return { completeHotels, missingValues, reviewHotels, zeroValues };
}
