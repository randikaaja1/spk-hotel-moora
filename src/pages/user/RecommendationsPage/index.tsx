import { useEffect, useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { RecommendationChart } from "../../../components/domain/RecommendationChart";
import { RecommendationTable } from "../../../components/domain/RecommendationTable";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import {
  calculateRecommendation,
  getLatestRecommendation
} from "../../../services/recommendationService";
import type { RecommendationItem } from "../../../types/recommendation";

// UserRecommendationsPage menampilkan ranking hotel berdasarkan preferensi user.
export function UserRecommendationsPage() {
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadLatest();
  }, []);

  // loadLatest mengambil hasil rekomendasi user terakhir.
  async function loadLatest() {
    setLoading(true);
    setError("");

    try {
      const latest = await getLatestRecommendation();
      setResults(latest.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // handleCalculate meminta backend menghitung ranking dengan preferensi tersimpan.
  async function handleCalculate() {
    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const result = await calculateRecommendation();
      setResults(result.results);
      setMessage("Rekomendasi berhasil dihitung.");
    } catch {
      setError("Rekomendasi belum berhasil dihitung.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="stack">
      <PageHeader
        action={
          <div className="button-row">
            <Button icon={<RotateCcw size={18} />} onClick={() => void loadLatest()} variant="secondary">
              Latest
            </Button>
            <Button disabled={processing} icon={<Calculator size={18} />} onClick={() => void handleCalculate()}>
              {processing ? "Menghitung" : "Hitung"}
            </Button>
          </div>
        }
        title="Rekomendasi"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      {loading ? (
        <LoadingState />
      ) : results.length === 0 ? (
        <EmptyState title="Belum ada hasil rekomendasi." />
      ) : (
        <>
          <Card>
            <h2>Grafik Ranking</h2>
            <RecommendationChart results={results} />
          </Card>
          <Card>
            <h2>Tabel Ranking</h2>
            <RecommendationTable results={results} />
          </Card>
        </>
      )}
    </div>
  );
}
