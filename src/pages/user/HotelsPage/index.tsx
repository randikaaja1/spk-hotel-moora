import { useEffect, useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import { getHotels } from "../../../services/hotelService";
import type { Hotel } from "../../../types/hotel";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

// UserHotelsPage menampilkan daftar hotel yang dapat dipilih user.
export function UserHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadHotels();
  }, []);

  // loadHotels mengambil daftar hotel dari backend.
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

  return (
    <div className="space-y-5">
      <PageHeader title="Daftar Hotel" description={error || undefined} />
      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0a2a55]">Hotel Tersedia</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bandingkan data hotel sebelum menentukan preferensi rekomendasi.
          </p>
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
                  <th>Lokasi</th>
                  <th>View</th>
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
                    <td>{formatNumber(hotel.location_score, 1)}</td>
                    <td>{formatNumber(hotel.view_score, 1)}</td>
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
