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
    <div className="stack">
      <PageHeader title="Daftar Hotel" description={error || undefined} />
      <Card>
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
                      <strong>{hotel.name}</strong>
                      <span className="table-note">{hotel.description || "-"}</span>
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
