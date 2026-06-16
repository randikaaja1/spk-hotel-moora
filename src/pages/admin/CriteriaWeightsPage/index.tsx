import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import { getCriteria } from "../../../services/criterionService";
import type { Criterion } from "../../../types/criterion";
import { formatNumber } from "../../../utils/formatters";

// AdminCriteriaWeightsPage menampilkan fokus bobot kriteria MOORA.
export function AdminCriteriaWeightsPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCriteria();
  }, []);

  const totalWeight = useMemo(
    () => criteria.reduce((total, criterion) => total + criterion.weight, 0),
    [criteria]
  );

  // loadCriteria mengambil daftar kriteria beserta bobot normalisasinya.
  async function loadCriteria() {
    setLoading(true);
    setError("");

    try {
      setCriteria(await getCriteria());
    } catch {
      setError("Bobot kriteria belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0a2a55] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(10,42,85,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0f3f78]"
            to="/admin/criteria"
          >
            Kelola Kriteria
          </Link>
        }
        description={error || "Pantau bobot dan normalisasi yang dipakai dalam perhitungan MOORA."}
        title="Bobot Kriteria"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-700">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Bobot</p>
            <p className="mt-2 text-3xl font-bold text-[#0a2a55]">{formatNumber(totalWeight, 2)}</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Jumlah Kriteria</p>
          <p className="mt-2 text-3xl font-bold text-[#0a2a55]">{criteria.length}</p>
          <p className="mt-2 text-sm text-slate-500">Kriteria aktif untuk evaluasi hotel.</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-500">Normalisasi</p>
          <p className="mt-2 text-3xl font-bold text-[#0a2a55]">Otomatis</p>
          <p className="mt-2 text-sm text-slate-500">Dihitung ulang dari total bobot tersimpan.</p>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0a2a55]">Distribusi Bobot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Perubahan nilai bobot dilakukan melalui halaman Kelola Kriteria.
          </p>
        </div>
        {loading ? (
          <LoadingState />
        ) : criteria.length === 0 ? (
          <EmptyState title="Belum ada kriteria." />
        ) : (
          <TableShell>
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Kriteria</th>
                  <th>Atribut</th>
                  <th>Bobot</th>
                  <th>Normalisasi</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((criterion) => (
                  <tr key={criterion.id}>
                    <td>
                      <strong className="font-bold text-[#0a2a55]">{criterion.code}</strong>
                    </td>
                    <td>{criterion.name}</td>
                    <td>
                      <Badge tone={criterion.attribute === "benefit" ? "green" : "amber"}>
                        {criterion.attribute}
                      </Badge>
                    </td>
                    <td>{formatNumber(criterion.weight, 2)}</td>
                    <td>{formatNumber(criterion.normalized_weight, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
