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
    <div className="stack">
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

      <div className="split-grid">
        <Card>
          <h2>{editingCriterion ? "Ubah Kriteria" : "Tambah Kriteria"}</h2>
          <CriterionForm
            initialData={editingCriterion}
            onCancel={editingCriterion ? () => setEditingCriterion(null) : undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Card>

        <Card className="wide-card">
          <h2>Daftar Kriteria</h2>
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
                        <strong>{criterion.code}</strong>
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
                        <div className="row-actions">
                          <button onClick={() => setEditingCriterion(criterion)} title="Ubah" type="button">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => void handleDelete(criterion.id)} title="Hapus" type="button">
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
