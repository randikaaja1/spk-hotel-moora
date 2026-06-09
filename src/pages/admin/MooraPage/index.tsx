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

// AdminMooraPage menjalankan perhitungan MOORA umum untuk semua hotel.
export function AdminMooraPage() {
  const [results, setResults] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadLatest();
  }, []);

  // loadLatest mengambil hasil perhitungan admin terakhir jika tersedia.
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

  // handleCalculate meminta backend menjalankan ulang perhitungan MOORA.
  async function handleCalculate() {
    setProcessing(true);
    setMessage("");
    setError("");

    try {
      const result = await calculateRecommendation();
      setResults(result.results);
      setMessage("Perhitungan MOORA berhasil dijalankan.");
    } catch {
      setError("Perhitungan MOORA belum berhasil dijalankan.");
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
              {processing ? "Menghitung" : "Generate"}
            </Button>
          </div>
        }
        title="Perhitungan MOORA"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      {loading ? (
        <LoadingState />
      ) : results.length === 0 ? (
        <EmptyState title="Belum ada hasil ranking." />
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
