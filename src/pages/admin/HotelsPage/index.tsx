import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { HotelForm } from "../../../components/domain/HotelForm";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import { getCriteria } from "../../../services/criterionService";
import {
  createHotel,
  deleteHotel,
  getHotels,
  updateHotel
} from "../../../services/hotelService";
import type { Criterion } from "../../../types/criterion";
import type { Hotel, SaveHotelPayload } from "../../../types/hotel";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

// AdminHotelsPage mengelola CRUD data hotel sebagai alternatif MOORA.
export function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadPageData();
  }, []);

  // loadPageData mengambil daftar hotel dan kriteria aktif dari backend.
  async function loadPageData() {
    setLoading(true);
    setError("");

    try {
      const [hotelItems, criterionItems] = await Promise.all([getHotels(), getCriteria()]);
      setHotels(hotelItems);
      setCriteria(criterionItems);
    } catch {
      setError("Data hotel belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  // handleSubmit menyimpan hotel baru atau perubahan data hotel.
  async function handleSubmit(payload: SaveHotelPayload) {
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      if (editingHotel) {
        await updateHotel(editingHotel.id, payload);
        setMessage("Hotel berhasil diperbarui.");
      } else {
        await createHotel(payload);
        setMessage("Hotel berhasil ditambahkan.");
      }

      setEditingHotel(null);
      setShowForm(false);
      await loadPageData();
    } catch {
      setError("Data hotel belum berhasil disimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  // handleDelete menghapus hotel setelah konfirmasi browser.
  async function handleDelete(id: number) {
    if (!window.confirm("Hapus hotel ini?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteHotel(id);
      setMessage("Hotel berhasil dihapus.");
      await loadPageData();
    } catch {
      setError("Hotel belum berhasil dihapus.");
    }
  }

  // openCreateForm menampilkan card form untuk menambahkan hotel baru.
  function openCreateForm() {
    setEditingHotel(null);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  // openEditForm menampilkan card form dengan data hotel yang akan diubah.
  function openEditForm(hotel: Hotel) {
    setEditingHotel(hotel);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  // closeForm menyembunyikan card form dan mengembalikan halaman ke daftar hotel.
  function closeForm() {
    setEditingHotel(null);
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button icon={<Plus size={18} />} onClick={openCreateForm}>
            Data baru
          </Button>
        }
        title="Kelola Hotel"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <Card className="min-w-0">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0a2a55]">Daftar Hotel</h2>
            <p className="mt-1 text-sm text-slate-500">{hotels.length} hotel tersimpan</p>
          </div>
        </div>
        {loading ? (
          <LoadingState />
        ) : hotels.length === 0 ? (
          <EmptyState title="Belum ada hotel." />
        ) : (
          <TableShell>
            <table>
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Lokasi</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id}>{criterion.name}</th>
                  ))}
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>
                      <strong className="block font-bold text-[#0a2a55]">{hotel.name}</strong>
                      <span className="mt-1 block max-w-[320px] text-xs leading-5 text-slate-500">
                        {hotel.description || "-"}
                      </span>
                    </td>
                    <td>
                      <GoogleMapsLink url={hotel.google_maps_url} />
                    </td>
                    {criteria.map((criterion) => (
                      <td key={`${hotel.id}-${criterion.id}`}>
                        {formatHotelCriterionValue(hotel, criterion)}
                      </td>
                    ))}
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                          onClick={() => openEditForm(hotel)}
                          title="Ubah"
                          type="button"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-red-50 text-red-600 transition hover:bg-red-100"
                          onClick={() => void handleDelete(hotel.id)}
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

      {showForm ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/35 px-4 py-8 backdrop-blur-sm"
          onClick={closeForm}
          role="dialog"
        >
          <div
            className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(10,42,85,0.22)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0a2a55]">
                  {editingHotel ? "Ubah Hotel" : "Tambah Hotel"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Masukkan nilai hotel yang akan dipakai dalam perhitungan MOORA.
                </p>
              </div>
              <button
                aria-label="Tutup form hotel"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-0 bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                onClick={closeForm}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <HotelForm
              criteria={criteria}
              initialData={editingHotel}
              onCancel={closeForm}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

// GoogleMapsLink menampilkan lokasi hotel sebagai tautan Google Maps.
function GoogleMapsLink({ url }: { url?: string }) {
  if (!url) {
    return <span className="text-sm text-slate-400">-</span>;
  }

  return (
    <a
      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 transition hover:text-[#0a2a55]"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink className="h-4 w-4" />
      <span>Buka Maps</span>
    </a>
  );
}

// formatHotelCriterionValue menampilkan nilai hotel sesuai kriteria aktif.
function formatHotelCriterionValue(hotel: Hotel, criterion: Criterion) {
  const value = resolveHotelCriterionValue(hotel, criterion);

  if (isMoneyCriterion(criterion)) {
    return formatCurrency(value);
  }

  if (isDistanceCriterion(criterion)) {
    return `${formatNumber(value, 1)} km`;
  }

  if (criterion.attribute === "benefit") {
    return <Badge tone="green">{formatNumber(value, 1)}</Badge>;
  }

  return formatNumber(value, 1);
}

// resolveHotelCriterionValue mengambil nilai dari response dinamis dengan fallback field lama.
function resolveHotelCriterionValue(hotel: Hotel, criterion: Criterion) {
  const storedValue = hotel.criterion_values?.find((item) => item.criterion_id === criterion.id);
  if (storedValue) {
    return storedValue.value;
  }

  const code = criterion.code.trim().toUpperCase();
  const name = criterion.name.trim().toLowerCase();
  if (code === "C1" || name.includes("biaya") || name.includes("harga")) return hotel.price;
  if (code === "C2" || name.includes("fasilitas") || name.includes("rating")) return hotel.rating_facility;
  if (code === "C3" || name.includes("akses")) return hotel.accessibility;
  if (name.includes("jarak")) return hotel.distance_km;
  if (code === "C4" || name.includes("lokasi")) return hotel.location_score;
  if (code === "C5" || name.includes("view")) return hotel.view_score;

  return 0;
}

// isMoneyCriterion mengenali kriteria biaya agar tampil sebagai Rupiah.
function isMoneyCriterion(criterion: Criterion) {
  const name = criterion.name.trim().toLowerCase();
  return criterion.code.trim().toUpperCase() === "C1" || name.includes("biaya") || name.includes("harga");
}

// isDistanceCriterion mengenali kriteria jarak agar tampil dengan satuan km.
function isDistanceCriterion(criterion: Criterion) {
  return criterion.name.trim().toLowerCase().includes("jarak");
}
