import { useEffect, useState } from "react";
import { BarChart3, Building2, ListChecks, Users } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard";
import { getDashboardSummary } from "../../../services/dashboardService";
import type { DashboardSummary } from "../../../types/dashboard";
import { formatDateTime, formatNumber } from "../../../utils/formatters";

// AdminDashboardPage menampilkan ringkasan utama untuk admin.
export function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSummary();
  }, []);

  // loadSummary mengambil data ringkasan dari backend dashboard.
  async function loadSummary() {
    setLoading(true);
    setError("");

    try {
      setSummary(await getDashboardSummary());
    } catch {
      setError("Ringkasan dashboard belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="stack">
      <PageHeader title="Dashboard Admin" description={error || undefined} />
      <div className="stats-grid">
        <StatCard icon={<Building2 size={22} />} label="Total hotel" value={summary?.total_hotels ?? 0} />
        <StatCard icon={<ListChecks size={22} />} label="Total kriteria" value={summary?.total_criteria ?? 0} />
        <StatCard icon={<Users size={22} />} label="Total user" value={summary?.total_users ?? 0} />
        <StatCard icon={<BarChart3 size={22} />} label="Rekomendasi" value={summary?.top_recommendation ? "Ada" : "Kosong"} />
      </div>

      <Card>
        <h2>Rekomendasi Tertinggi</h2>
        {summary?.top_recommendation ? (
          <div className="top-result">
            <strong>{summary.top_recommendation.hotel_name}</strong>
            <span>Yi {formatNumber(summary.top_recommendation.preference_value, 5)}</span>
            <span>{formatDateTime(summary.top_recommendation.created_at)}</span>
          </div>
        ) : (
          <p className="muted">Belum ada hasil rekomendasi tersimpan.</p>
        )}
      </Card>
    </div>
  );
}
