import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { HotelForm } from "../../../components/domain/HotelForm";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import {
  createHotel,
  deleteHotel,
  getHotels,
  updateHotel
} from "../../../services/hotelService";
import type { Hotel, SaveHotelPayload } from "../../../types/hotel";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

// AdminHotelsPage mengelola CRUD data hotel sebagai alternatif MOORA.
export function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadHotels();
  }, []);

  // loadHotels mengambil daftar hotel terbaru dari backend.
  async function loadHotels() {
    setLoading(true);
    setError("");

    try {
      setHotels(await getHotels());
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
      await loadHotels();
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
      await loadHotels();
    } catch {
      setError("Hotel belum berhasil dihapus.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button icon={<Plus size={18} />} onClick={() => setEditingHotel(null)}>
            Data baru
          </Button>
        }
        title="Kelola Hotel"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.35fr)]">
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#0a2a55]">
              {editingHotel ? "Ubah Hotel" : "Tambah Hotel"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Masukkan nilai hotel yang akan dipakai dalam perhitungan MOORA.
            </p>
          </div>
          <HotelForm
            initialData={editingHotel}
            onCancel={editingHotel ? () => setEditingHotel(null) : undefined}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </Card>

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
                    <th>Harga</th>
                    <th>Fasilitas</th>
                    <th>Akses</th>
                    <th>Jarak</th>
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
                      <td>{formatCurrency(hotel.price)}</td>
                      <td>
                        <Badge tone="green">{formatNumber(hotel.rating_facility, 1)}</Badge>
                      </td>
                      <td>{formatNumber(hotel.accessibility, 1)}</td>
                      <td>{formatNumber(hotel.distance_km, 1)} km</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="grid h-9 w-9 place-items-center rounded-lg border-0 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                            onClick={() => setEditingHotel(hotel)}
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
      </div>
    </div>
  );
}
