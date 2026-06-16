import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CriterionForm } from "../../../components/domain/CriterionForm";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import {
  createCriterion,
  deleteCriterion,
  getCriteria,
  updateCriterion
} from "../../../services/criterionService";
import type { Criterion, SaveCriterionPayload } from "../../../types/criterion";
import { formatNumber } from "../../../utils/formatters";

// AdminCriteriaPage mengelola CRUD kriteria dan bobot MOORA.
export function AdminCriteriaPage() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadCriteria();
  }, []);

  // loadCriteria mengambil daftar kriteria terbaru dari backend.
  async function loadCriteria() {
    setLoading(true);
    setError("");

    try {
      setCriteria(await getCriteria());
    } catch {
      setError("Data kriteria belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  // handleSubmit menyimpan kriteria baru atau perubahan kriteria.
  async function handleSubmit(payload: SaveCriterionPayload) {
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      if (editingCriterion) {
        await updateCriterion(editingCriterion.id, payload);
        setMessage("Kriteria berhasil diperbarui.");
      } else {
        await createCriterion(payload);
        setMessage("Kriteria berhasil ditambahkan.");
      }

      setEditingCriterion(null);
      await loadCriteria();
    } catch {
      setError("Data kriteria belum berhasil disimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  // handleDelete menghapus kriteria setelah konfirmasi browser.
  async function handleDelete(id: number) {
    if (!window.confirm("Hapus kriteria ini?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteCriterion(id);
      setMessage("Kriteria berhasil dihapus.");
      await loadCriteria();
    } catch {
      setError("Kriteria belum berhasil dihapus.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button icon={<Plus size={18} />} onClick={() => setEditingCriterion(null)}>
            Data baru
          </Button>
        }
        title="Kelola Kriteria"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.35fr)]">
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#0a2a55]">
              {editingCriterion ? "Ubah Kriteria" : "Tambah Kriteria"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atur kode, atribut, dan bobot kriteria untuk metode MOORA.
            </p>
          </div>
          <CriterionForm
            initialData={editingCriterion}
            onCancel={editingCriterion ? () => setEditingCriterion(null) : undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Card>

        <Card className="min-w-0">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#0a2a55]">Daftar Kriteria</h2>
            <p className="mt-1 text-sm text-slate-500">{criteria.length} kriteria aktif</p>
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
                    <th>Nama</th>
                    <th>Atribut</th>
                    <th>Bobot</th>
                    <th>Normalisasi</th>
                    <th>Aksi</th>
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
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                            onClick={() => setEditingCriterion(criterion)}
                            title="Ubah"
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-red-50 text-red-600 transition hover:bg-red-100"
                            onClick={() => void handleDelete(criterion.id)}
                            title="Hapus"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>
      </div>
    </div>
  );
}
