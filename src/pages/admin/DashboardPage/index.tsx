import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { LoadingState } from "../../../components/ui/LoadingState";
import { useAuth } from "../../../context/AuthContext";
import { getCriteria } from "../../../services/criterionService";
import { getDashboardSummary } from "../../../services/dashboardService";
import { getHotels } from "../../../services/hotelService";
import { getLatestRecommendation } from "../../../services/recommendationService";
import type { Criterion } from "../../../types/criterion";
import type { DashboardSummary } from "../../../types/dashboard";
import type { Hotel } from "../../../types/hotel";
import type { RecommendationItem } from "../../../types/recommendation";
import {
  DashboardHero,
  DashboardInsightGrid,
  DashboardRecommendationGrid,
  DashboardStats
} from "./components";

// AdminDashboardPage menampilkan ringkasan utama untuk admin.
export function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [latestCreatedAt, setLatestCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, []);

  // loadDashboard mengambil ringkasan admin dan hasil ranking terbaru.
  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [dashboardSummary, hotelItems, criterionItems] = await Promise.all([
        getDashboardSummary(),
        getHotels(),
        getCriteria()
      ]);
      setSummary(dashboardSummary);
      setHotels(hotelItems);
      setCriteria(criterionItems);
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
      <DashboardInsightGrid
        criteria={criteria}
        hotels={hotels}
        latestCreatedAt={latestCreatedAt}
        results={results}
      />
    </div>
  );
}
