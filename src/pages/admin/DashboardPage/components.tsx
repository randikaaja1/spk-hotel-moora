import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ReactNode } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  RotateCw,
  Trophy,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../../assets/hero-kintamani.png";
import type { DashboardSummary } from "../../../types/dashboard";
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

interface DashboardRankingChartProps {
  results: RecommendationItem[];
}

interface DashboardMooraPanelProps {
  latestCreatedAt: string;
  onCalculate: () => void;
  processing: boolean;
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0a2a55]">
          Selamat datang, {name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Berikut ringkasan sistem pendukung keputusan hotel di Kintamani.
        </p>
      </div>

      <div className="flex h-16 min-w-[220px] items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0a2a55]">
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
        icon={<Building2 className="h-7 w-7" />}
        iconTone="bg-blue-50 text-blue-700"
        label="Total Hotel"
        value={summary?.total_hotels ?? 0}
      />
      <MetricCard
        description="Kriteria penilaian"
        icon={<ClipboardList className="h-7 w-7" />}
        iconTone="bg-emerald-50 text-emerald-700"
        label="Total Kriteria"
        value={summary?.total_criteria ?? 0}
      />
      <MetricCard
        description="User terdaftar"
        icon={<Users className="h-7 w-7" />}
        iconTone="bg-amber-50 text-amber-700"
        label="Total Pengguna"
        value={summary?.total_users ?? 0}
      />
      <MetricCard
        actionLabel="Lihat detail"
        description="Ranking tertinggi"
        icon={<Trophy className="h-7 w-7" />}
        iconTone="bg-violet-50 text-violet-700"
        label="Rekomendasi Terbaik"
        to="/admin/moora"
        value={topHotel}
      />
    </div>
  );
}

// DashboardRecommendationGrid menyusun tabel dan grafik Top 5 rekomendasi.
export function DashboardRecommendationGrid({ results }: { results: RecommendationItem[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1fr]">
      <DashboardRankingTable results={results} />
      <DashboardRankingChart results={results} />
    </div>
  );
}

// DashboardMooraPanel menampilkan status perhitungan dan tombol hitung ulang.
export function DashboardMooraPanel({
  latestCreatedAt,
  onCalculate,
  processing
}: DashboardMooraPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0a2a55]">Perhitungan MOORA</h2>
          <p className="mt-1 text-sm text-slate-500">
            {latestCreatedAt
              ? `Terakhir dihitung pada ${formatDateTime(latestCreatedAt)}`
              : "Belum ada hasil perhitungan tersimpan."}
          </p>
        </div>
      </div>

      <button
        className="flex h-11 items-center justify-center gap-2 rounded-lg border-0 bg-[#0a2a55] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(10,42,85,0.18)] transition hover:bg-[#0f3f78] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={processing}
        onClick={onCalculate}
        type="button"
      >
        {processing ? "Menghitung" : "Hitung Ulang"}
        <RotateCw className={`h-4 w-4 ${processing ? "animate-spin" : ""}`} />
      </button>
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
    <div className="flex min-h-[156px] items-center gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-3 truncate text-3xl font-bold tracking-tight text-black">{value}</p>
        {actionLabel && to ? (
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700" to={to}>
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <p className="mt-4 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

// DashboardRankingTable menampilkan Top 5 hasil rekomendasi terbaru.
function DashboardRankingTable({ results }: DashboardRankingTableProps) {
  const topResults = results.slice(0, 5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#0a2a55]">Top 5 Rekomendasi Hotel</h2>
      {topResults.length === 0 ? (
        <EmptyRecommendation label="Belum ada ranking. Jalankan perhitungan MOORA terlebih dahulu." />
      ) : (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-100">
          <div className="grid grid-cols-[60px_minmax(0,1fr)_150px] bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase text-slate-500">
            <span>Rank</span>
            <span>Hotel</span>
            <span className="text-right">Nilai Preferensi</span>
          </div>
          <div className="divide-y divide-slate-100">
            {topResults.map((item, index) => (
              <div
                className="grid grid-cols-[60px_minmax(0,1fr)_150px] items-center px-4 py-3"
                key={`${item.rank}-${item.hotel.id}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-[#0a2a55] ${
                    rankColors[index] ?? "bg-slate-100"
                  }`}
                >
                  {item.rank}
                </span>
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    alt=""
                    className="h-10 w-16 rounded-md object-cover"
                    src={heroImage}
                  />
                  <span className="truncate text-sm font-bold text-[#0a2a55]">{item.hotel.name}</span>
                </div>
                <span className="text-right text-sm font-bold text-[#0a2a55]">
                  {formatNumber(item.preference_value, 5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Link
        className="mt-5 flex h-12 items-center justify-between rounded-lg border border-slate-200 px-4 text-sm font-semibold text-[#0a2a55] transition hover:bg-blue-50"
        to="/admin/moora"
      >
        Lihat semua ranking
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </Link>
    </section>
  );
}

// DashboardRankingChart menampilkan grafik batang Top 5 rekomendasi terbaru.
function DashboardRankingChart({ results }: DashboardRankingChartProps) {
  const data = results.slice(0, 5).map((item) => ({
    name: item.hotel.name,
    value: item.preference_value
  }));

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#0a2a55]">Grafik Top 5 Rekomendasi</h2>
      {data.length === 0 ? (
        <EmptyRecommendation label="Grafik akan tampil setelah ranking tersedia." />
      ) : (
        <div className="mt-6 h-[330px]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} margin={{ top: 24, right: 12, left: -18, bottom: 12 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis
                axisLine={{ stroke: "#cbd5e1" }}
                dataKey="name"
                fontSize={12}
                interval={0}
                tickFormatter={(value) => truncateLabel(String(value))}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => formatNumber(Number(value), 2)}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatNumber(Number(value), 5), "Nilai"]}
                labelStyle={{ color: "#0a2a55", fontWeight: 700 }}
              />
              <Bar dataKey="value" fill="#0a2a55" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="value"
                  fill="#0a2a55"
                  fontSize={12}
                  fontWeight={700}
                  formatter={(value: number) => formatNumber(value, 4)}
                  position="top"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// EmptyRecommendation menampilkan pesan kosong yang konsisten untuk tabel dan grafik.
function EmptyRecommendation({ label }: { label: string }) {
  return (
    <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center text-sm font-medium text-slate-500">
      {label}
    </div>
  );
}

// truncateLabel memendekkan nama hotel agar label grafik tetap rapi.
function truncateLabel(value: string) {
  return value.length > 16 ? `${value.slice(0, 15)}...` : value;
}
