import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDownUp,
  BarChart3,
  Calculator,
  CheckCircle2,
  Clock,
  Database,
  ListChecks,
  RotateCcw,
  Sigma,
  Table2,
  Trophy
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { RecommendationChart } from "../../../components/domain/RecommendationChart";
import { RecommendationTable } from "../../../components/domain/RecommendationTable";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import { getCriteria } from "../../../services/criterionService";
import { getHotels } from "../../../services/hotelService";
import {
  calculateRecommendation,
  getLatestRecommendation
} from "../../../services/recommendationService";
import type { Criterion } from "../../../types/criterion";
import type {
  CalculateRecommendationResponse,
  CriterionScore,
  RecommendationItem
} from "../../../types/recommendation";
import { formatCurrency, formatDateTime, formatNumber } from "../../../utils/formatters";

// AdminMooraPage memisahkan tampilan proses perhitungan dan hasil ranking MOORA.
export function AdminMooraPage() {
  const [searchParams] = useSearchParams();
  const isResultView = searchParams.get("view") === "ranking";

  return isResultView ? <MooraResultView /> : <MooraProcessView />;
}

// MooraProcessView menampilkan tahapan, matriks, dan detail perhitungan MOORA.
function MooraProcessView() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [hotelCount, setHotelCount] = useState(0);
  const [calculation, setCalculation] = useState<CalculateRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadReadiness();
  }, []);

  const processRows = useMemo(() => buildProcessRows(calculation?.results ?? []), [calculation]);
  const bestResult = calculation?.results[0];

  // loadReadiness mengambil jumlah hotel dan kriteria untuk validasi sebelum hitung.
  async function loadReadiness() {
    setLoading(true);
    setError("");

    try {
      const [hotels, criteriaItems] = await Promise.all([getHotels(), getCriteria()]);
      setHotelCount(hotels.length);
      setCriteria(criteriaItems);
    } catch {
      setError("Data awal proses MOORA belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  // handleCalculate menjalankan ulang MOORA dan menampilkan detail prosesnya.
  async function handleCalculate() {
    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const result = await calculateRecommendation();
      setCalculation(result);
      setMessage("Perhitungan MOORA berhasil dijalankan dan detail proses siap ditinjau.");
      await loadReadiness();
    } catch {
      setError("Perhitungan MOORA belum berhasil dijalankan.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <LoadingState label="Memuat data proses" />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button disabled={processing} icon={<Calculator size={18} />} onClick={() => void handleCalculate()}>
            {processing ? "Menghitung" : "Hitung MOORA"}
          </Button>
        }
        description="Periksa kesiapan data, jalankan perhitungan, lalu lihat matriks keputusan, normalisasi, pembobotan, dan nilai Yi."
        title="Proses Perhitungan MOORA"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <div className="grid gap-4 md:grid-cols-3">
        <ProcessStatCard
          description="Alternatif yang akan dinilai."
          icon={<Database className="h-6 w-6" />}
          label="Total Hotel"
          tone="blue"
          value={hotelCount}
        />
        <ProcessStatCard
          description="Kriteria dan bobot penilaian."
          icon={<Table2 className="h-6 w-6" />}
          label="Total Kriteria"
          tone="emerald"
          value={criteria.length}
        />
        <ProcessStatCard
          description="Hotel yang ikut dihitung setelah filter."
          icon={<CheckCircle2 className="h-6 w-6" />}
          label="Hotel Dihitung"
          tone="amber"
          value={calculation?.filtered_hotels ?? "-"}
        />
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0a2a55]">Alur Proses</h2>
          <p className="mt-1 text-sm text-slate-500">
            Status langkah perhitungan berdasarkan data yang tersedia dan hasil proses terakhir.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <ProcessStep done={hotelCount > 0} index="01" label="Data Hotel" />
          <ProcessStep done={criteria.length > 0} index="02" label="Data Kriteria" />
          <ProcessStep done={Boolean(calculation)} index="03" label="Normalisasi" />
          <ProcessStep done={Boolean(calculation)} index="04" label="Pembobotan" />
          <ProcessStep done={Boolean(calculation)} index="05" label="Ranking Yi" />
        </div>
      </Card>

      {!calculation ? (
        <EmptyState title="Jalankan Hitung MOORA untuk melihat detail matriks proses." />
      ) : (
        <>
          <Card>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#0a2a55]">Ringkasan Hasil Proses</h2>
              <p className="mt-1 text-sm text-slate-500">
                Nilai terbaik sementara: {bestResult?.hotel.name ?? "-"} dengan Yi{" "}
                {bestResult ? formatNumber(bestResult.preference_value, 5) : "-"}.
              </p>
            </div>
            <TableShell>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Hotel</th>
                    <th>Total Benefit</th>
                    <th>Total Cost</th>
                    <th>Yi</th>
                  </tr>
                </thead>
                <tbody>
                  {processRows.map((row) => (
                    <tr key={row.hotelId}>
                      <td>#{row.rank}</td>
                      <td>
                        <strong className="font-bold text-[#0a2a55]">{row.hotelName}</strong>
                      </td>
                      <td>{formatNumber(row.totalBenefit, 6)}</td>
                      <td>{formatNumber(row.totalCost, 6)}</td>
                      <td>{formatNumber(row.preferenceValue, 6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </Card>

          <MooraMatrixCard
            description="Nilai asli setiap hotel sebelum normalisasi."
            mode="raw"
            results={calculation.results}
            title="Matriks Keputusan"
          />
          <MooraMatrixCard
            description="Nilai setiap kolom dibagi akar jumlah kuadrat pada kriteria yang sama."
            mode="normalized"
            results={calculation.results}
            title="Matriks Normalisasi"
          />
          <MooraMatrixCard
            description="Nilai normalisasi dikalikan bobot normalisasi kriteria."
            mode="weighted"
            results={calculation.results}
            title="Matriks Terbobot"
          />
        </>
      )}
    </div>
  );
}

// MooraResultView menampilkan output akhir ranking yang tersimpan atau baru dihitung.
function MooraResultView() {
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [latestCreatedAt, setLatestCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadLatest();
  }, []);

  const bestResult = results[0];
  const scoreRows = useMemo(() => buildProcessRows(results), [results]);
  const hasScoreDetail = results.some((item) => (item.scores?.length ?? 0) > 0);
  const averagePreference =
    results.length > 0
      ? results.reduce((total, item) => total + item.preference_value, 0) / results.length
      : 0;

  // loadLatest mengambil hasil perhitungan admin terakhir jika tersedia.
  async function loadLatest() {
    setLoading(true);
    setError("");

    try {
      const latest = await getLatestRecommendation();
      setResults(latest.results);
      setLatestCreatedAt(latest.created_at);
    } catch {
      setResults([]);
      setLatestCreatedAt("");
    } finally {
      setLoading(false);
    }
  }

  // handleCalculate meminta backend menjalankan ulang perhitungan MOORA.
  async function handleCalculate() {
    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const result = await calculateRecommendation();
      setResults(result.results);
      setLatestCreatedAt(new Date().toISOString());
      setMessage("Perhitungan MOORA berhasil dijalankan.");
    } catch {
      setError("Perhitungan MOORA belum berhasil dijalankan.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <div className="flex flex-wrap gap-3">
            <Button icon={<RotateCcw size={18} />} onClick={() => void loadLatest()} variant="secondary">
              Latest
            </Button>
            <Button disabled={processing} icon={<BarChart3 size={18} />} onClick={() => void handleCalculate()}>
              {processing ? "Menghitung" : "Hitung Ulang"}
            </Button>
          </div>
        }
        description="Output akhir ranking hotel berdasarkan nilai Yi terbesar."
        title="Hasil Ranking MOORA"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      {loading ? (
        <LoadingState />
      ) : results.length === 0 ? (
        <EmptyState title="Belum ada hasil ranking." />
      ) : (
        <div className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-3 md:grid-cols-4">
            <ResultSummaryCard
              description={
                bestResult ? `Yi ${formatNumber(bestResult.preference_value, 5)}` : "Belum tersedia."
              }
              icon={<Trophy className="h-6 w-6" />}
              label="Rekomendasi Terbaik"
              tone="amber"
              value={bestResult?.hotel.name ?? "-"}
            />
            <ResultSummaryCard
              description="Alternatif yang masuk hasil akhir."
              icon={<ListChecks className="h-6 w-6" />}
              label="Total Ranking"
              tone="blue"
              value={`${results.length} Hotel`}
            />
            <ResultSummaryCard
              description="Rata-rata nilai Yi seluruh hotel."
              icon={<BarChart3 className="h-6 w-6" />}
              label="Rata-rata Yi"
              tone="amber"
              value={formatNumber(averagePreference, 5)}
            />
            <ResultSummaryCard
              description="Waktu hasil terakhir dimuat."
              icon={<Clock className="h-6 w-6" />}
              label="Terakhir Hitung"
              tone="purple"
              value={latestCreatedAt ? formatDateTime(latestCreatedAt) : "-"}
            />
          </div>

          <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Card className="min-w-0 self-start">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#0a2a55]">Ringkasan Ranking</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lima hotel teratas dari hasil perhitungan MOORA terbaru.
                </p>
              </div>
              <div className="space-y-3">
                {results.slice(0, 5).map((item) => (
                  <div
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                    key={`${item.rank}-${item.hotel.id}-summary`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black ${
                          item.rank === 1
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        #{item.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[#0a2a55]">{item.hotel.name}</p>
                        <p className="text-xs text-slate-500">
                          Harga {formatCurrency(item.hotel.price)} | Rating{" "}
                          {formatNumber(item.hotel.rating_facility, 1)}
                        </p>
                      </div>
                    </div>
                    <strong className="text-sm text-[#0a2a55] sm:text-right">
                      {formatNumber(item.preference_value, 5)}
                    </strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="min-w-0 self-start overflow-hidden">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#0a2a55]">Grafik Ranking</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Visualisasi nilai preferensi hotel berdasarkan hasil MOORA terbaru.
                </p>
              </div>
              <RecommendationChart results={results} />
            </Card>
          </div>

          {hasScoreDetail ? (
            <Card className="min-w-0">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#0a2a55]">Detail Nilai Akhir</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pembentuk nilai Yi dari total benefit dikurangi total cost.
                </p>
              </div>
              <TableShell>
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Hotel</th>
                      <th>Total Benefit</th>
                      <th>Total Cost</th>
                      <th>Yi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreRows.map((row) => (
                      <tr key={`${row.hotelId}-result-detail`}>
                        <td>#{row.rank}</td>
                        <td>
                          <strong className="font-bold text-[#0a2a55]">{row.hotelName}</strong>
                        </td>
                        <td>{formatNumber(row.totalBenefit, 6)}</td>
                        <td>{formatNumber(row.totalCost, 6)}</td>
                        <td>{formatNumber(row.preferenceValue, 6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>
            </Card>
          ) : null}

          <Card className="min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#0a2a55]">Tabel Ranking</h2>
              <p className="mt-1 text-sm text-slate-500">
                Urutan lengkap hotel dari nilai preferensi tertinggi.
              </p>
            </div>
            <RecommendationTable results={results} />
          </Card>
        </div>
      )}
    </div>
  );
}

// ResultSummaryCard menampilkan angka penting dari hasil ranking MOORA.
function ResultSummaryCard({
  description,
  icon,
  label,
  tone,
  value
}: {
  description: string;
  icon: ReactNode;
  label: string;
  tone: "blue" | "emerald" | "amber" | "purple";
  value: string;
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-violet-50 text-violet-700"
  }[tone];

  return (
    <Card className="flex items-center gap-3 sm:gap-4">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full sm:h-14 sm:w-14 ${toneClass}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 line-clamp-2 break-words text-lg font-bold leading-tight text-[#0a2a55] sm:text-xl">
          {value}
        </p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

// ProcessStatCard menampilkan ringkasan kesiapan data proses MOORA.
function ProcessStatCard({
  description,
  icon,
  label,
  tone,
  value
}: {
  description: string;
  icon: ReactNode;
  label: string;
  tone: "blue" | "emerald" | "amber";
  value: number | string;
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700"
  }[tone];

  return (
    <Card className="flex items-center gap-3 sm:gap-4">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full sm:h-14 sm:w-14 ${toneClass}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-[#0a2a55] sm:text-3xl">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

// ProcessStep menampilkan status langkah proses MOORA.
function ProcessStep({ done, index, label }: { done: boolean; index: string; label: string }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        done ? "border-emerald-100 bg-emerald-50/70" : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{index}</p>
      <div className="mt-3 flex items-center gap-2">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
        ) : (
          <ArrowDownUp className="h-5 w-5 text-slate-400" />
        )}
        <strong className="text-sm text-[#0a2a55]">{label}</strong>
      </div>
    </div>
  );
}

// MooraMatrixCard menampilkan tabel matriks keputusan, normalisasi, atau terbobot.
function MooraMatrixCard({
  description,
  mode,
  results,
  title
}: {
  description: string;
  mode: "raw" | "normalized" | "weighted";
  results: RecommendationItem[];
  title: string;
}) {
  const criteria = getScoreHeaders(results);

  return (
    <Card>
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
          <Sigma className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0a2a55]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <TableShell>
        <table>
          <thead>
            <tr>
              <th>Hotel</th>
              {criteria.map((criterion) => (
                <th key={`${mode}-${criterion.code}`}>
                  {criterion.name}
                  <span className="mt-1 block text-[10px] normal-case text-slate-400">
                    {criterion.attribute}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr key={`${mode}-${item.hotel.id}`}>
                <td>
                  <strong className="font-bold text-[#0a2a55]">{item.hotel.name}</strong>
                </td>
                {criteria.map((criterion) => {
                  const score = item.scores?.find((entry) => entry.code === criterion.code);
                  return (
                    <td key={`${mode}-${item.hotel.id}-${criterion.code}`}>
                      {formatScoreValue(score, mode)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </Card>
  );
}

// buildProcessRows menghitung total benefit dan cost dari skor hasil calculate.
function buildProcessRows(results: RecommendationItem[]) {
  return results.map((item) => {
    const totals = (item.scores ?? []).reduce(
      (current, score) => {
        if (score.attribute === "cost") {
          current.totalCost += score.weighted_value;
        } else {
          current.totalBenefit += score.weighted_value;
        }

        return current;
      },
      { totalBenefit: 0, totalCost: 0 }
    );

    return {
      hotelId: item.hotel.id,
      hotelName: item.hotel.name,
      preferenceValue: item.preference_value,
      rank: item.rank,
      ...totals
    };
  });
}

// getScoreHeaders mengambil daftar kriteria dari hasil skor pertama yang tersedia.
function getScoreHeaders(results: RecommendationItem[]): CriterionScore[] {
  return results.find((item) => item.scores && item.scores.length > 0)?.scores ?? [];
}

// formatScoreValue memformat nilai matriks sesuai mode yang sedang ditampilkan.
function formatScoreValue(score: CriterionScore | undefined, mode: "raw" | "normalized" | "weighted") {
  if (!score) {
    return "-";
  }

  if (mode === "raw" && score.code === "C1") {
    return formatCurrency(score.raw_value);
  }

  if (
    mode === "raw" &&
    (score.code.trim().toUpperCase() === "C4" || score.name.trim().toLowerCase().includes("jarak"))
  ) {
    return `${formatNumber(score.raw_value, 2)} km`;
  }

  const value =
    mode === "raw"
      ? score.raw_value
      : mode === "normalized"
        ? score.normalized_value
        : score.weighted_value;

  return formatNumber(value, mode === "raw" ? 2 : 6);
}
