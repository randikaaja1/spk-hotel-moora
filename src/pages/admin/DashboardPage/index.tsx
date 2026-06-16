import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { LoadingState } from "../../../components/ui/LoadingState";
import { useAuth } from "../../../context/AuthContext";
import { getDashboardSummary } from "../../../services/dashboardService";
import {
  calculateRecommendation,
  getLatestRecommendation
} from "../../../services/recommendationService";
import type { DashboardSummary } from "../../../types/dashboard";
import type { RecommendationItem } from "../../../types/recommendation";
import {
  DashboardHero,
  DashboardMooraPanel,
  DashboardRecommendationGrid,
  DashboardStats
} from "./components";

// AdminDashboardPage menampilkan ringkasan utama untuk admin.
export function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [latestCreatedAt, setLatestCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, []);

  // loadDashboard mengambil ringkasan admin dan hasil ranking terbaru.
  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const dashboardSummary = await getDashboardSummary();
      setSummary(dashboardSummary);
    } catch {
      setError("Ringkasan dashboard belum dapat dimuat.");
    }

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

  // handleCalculate menjalankan ulang MOORA dan memperbarui isi dashboard.
  async function handleCalculate() {
    setProcessing(true);
    setError("");

    try {
      const calculation = await calculateRecommendation();
      setResults(calculation.results);
      setLatestCreatedAt(new Date().toISOString());
      setSummary(await getDashboardSummary());
    } catch {
      setError("Perhitungan MOORA belum berhasil dijalankan.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return <LoadingState label="Memuat dashboard" />;
  }

  return (
    <div className="space-y-5">
      <DashboardHero name={user?.name || "Admin"} />
      {error ? (
        <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : null}
      <DashboardStats results={results} summary={summary} />
      <DashboardRecommendationGrid results={results} />
      <DashboardMooraPanel
        latestCreatedAt={latestCreatedAt}
        onCalculate={() => void handleCalculate()}
        processing={processing}
      />
    </div>
  );
}
