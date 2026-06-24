import { Badge } from "../ui/Badge";
import { TableShell } from "../ui/TableShell";
import type { HotelCriterionValue } from "../../types/hotel";
import type { CriterionScore, RecommendationItem } from "../../types/recommendation";
import { formatCurrency, formatNumber } from "../../utils/formatters";

// RecommendationTable menampilkan hasil ranking MOORA dalam tabel.
export function RecommendationTable({ results }: { results: RecommendationItem[] }) {
  const scoreHeaders = results.find((item) => item.scores && item.scores.length > 0)?.scores ?? [];
  const hotelCriterionHeaders =
    scoreHeaders.length === 0
      ? (results.find((item) => item.hotel.criterion_values?.length > 0)?.hotel.criterion_values ?? [])
      : [];

  return (
    <TableShell>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Hotel</th>
            {scoreHeaders.length > 0 ? (
              scoreHeaders.map((score) => <th key={score.criterion_id}>{score.name}</th>)
            ) : hotelCriterionHeaders.length > 0 ? (
              hotelCriterionHeaders.map((criterion) => (
                <th key={criterion.criterion_id}>{criterion.name}</th>
              ))
            ) : (
              <>
                <th>Harga</th>
                <th>Fasilitas</th>
                <th>Akses</th>
                <th>Jarak</th>
                <th>View</th>
              </>
            )}
            <th>Yi</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <tr key={`${item.rank}-${item.hotel.id}`}>
              <td>
                <Badge tone={item.rank === 1 ? "green" : "blue"}>{`#${item.rank}`}</Badge>
              </td>
              <td>
                <strong className="font-bold text-[#0a2a55]">{item.hotel.name}</strong>
              </td>
              {scoreHeaders.length > 0 ? (
                scoreHeaders.map((header) => {
                  const score = item.scores?.find((entry) => entry.criterion_id === header.criterion_id);
                  return <td key={`${item.hotel.id}-${header.criterion_id}`}>{formatScoreRawValue(score)}</td>;
                })
              ) : hotelCriterionHeaders.length > 0 ? (
                hotelCriterionHeaders.map((header) => {
                  const value = item.hotel.criterion_values?.find(
                    (entry) => entry.criterion_id === header.criterion_id
                  );
                  return (
                    <td key={`${item.hotel.id}-${header.criterion_id}`}>
                      {formatHotelCriterionValue(value)}
                    </td>
                  );
                })
              ) : (
                <>
                  <td>{formatCurrency(item.hotel.price)}</td>
                  <td>{formatNumber(item.hotel.rating_facility, 1)}</td>
                  <td>{formatNumber(item.hotel.accessibility, 1)}</td>
                  <td>{formatNumber(item.hotel.distance_km, 1)} km</td>
                  <td>{formatNumber(item.hotel.view_score, 1)}</td>
                </>
              )}
              <td>{formatNumber(item.preference_value, 5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

// formatScoreRawValue memformat nilai asli hotel sesuai tipe kriteria.
function formatScoreRawValue(score: CriterionScore | undefined) {
  if (!score) {
    return "-";
  }

  const name = score.name.trim().toLowerCase();
  if (score.code.trim().toUpperCase() === "C1" || name.includes("biaya") || name.includes("harga")) {
    return formatCurrency(score.raw_value);
  }

  if (score.code.trim().toUpperCase() === "C4" || name.includes("jarak")) {
    return `${formatNumber(score.raw_value, 1)} km`;
  }

  return formatNumber(score.raw_value, 1);
}

// formatHotelCriterionValue memformat nilai kriteria dari hasil ranking tersimpan.
function formatHotelCriterionValue(value: HotelCriterionValue | undefined) {
  if (!value) {
    return "-";
  }

  const name = value.name.trim().toLowerCase();
  if (value.code.trim().toUpperCase() === "C1" || name.includes("biaya") || name.includes("harga")) {
    return formatCurrency(value.value);
  }

  if (value.code.trim().toUpperCase() === "C4" || name.includes("jarak")) {
    return `${formatNumber(value.value, 1)} km`;
  }

  return formatNumber(value.value, 1);
}
