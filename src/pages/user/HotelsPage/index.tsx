import { useEffect, useState } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import { getCriteria } from "../../../services/criterionService";
import { getHotels } from "../../../services/hotelService";
import type { Criterion } from "../../../types/criterion";
import type { Hotel } from "../../../types/hotel";
import { formatCurrency, formatNumber } from "../../../utils/formatters";

// UserHotelsPage menampilkan daftar hotel yang dapat dipilih user.
export function UserHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
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
      const [hotelItems, criterionItems] = await Promise.all([getHotels(), getCriteria()]);
      setHotels(hotelItems);
      setCriteria(criterionItems);
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
                  <th>Jarak</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id}>{criterion.code}</th>
                  ))}
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
                    <td>{formatNumber(hotel.distance_km, 1)} km</td>
                    {criteria.map((criterion) => (
                      <td key={`${hotel.id}-${criterion.id}`}>
                        {formatHotelCriterionValue(hotel, criterion)}
                      </td>
                    ))}
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
