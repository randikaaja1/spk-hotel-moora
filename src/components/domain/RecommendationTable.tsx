import { Badge } from "../ui/Badge";
import { TableShell } from "../ui/TableShell";
import type { RecommendationItem } from "../../types/recommendation";
import { formatCurrency, formatNumber } from "../../utils/formatters";

// RecommendationTable menampilkan hasil ranking MOORA dalam tabel.
export function RecommendationTable({ results }: { results: RecommendationItem[] }) {
  return (
    <TableShell>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Hotel</th>
            <th>Harga</th>
            <th>Fasilitas</th>
            <th>Akses</th>
            <th>Lokasi</th>
            <th>View</th>
            <th>Yi</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item) => (
            <tr key={`${item.rank}-${item.hotel.id}`}>
              <td>
                <Badge tone={item.rank === 1 ? "green" : "blue"}>{`#${item.rank}`}</Badge>
              </td>
              <td>{item.hotel.name}</td>
              <td>{formatCurrency(item.hotel.price)}</td>
              <td>{formatNumber(item.hotel.rating_facility, 1)}</td>
              <td>{formatNumber(item.hotel.accessibility, 1)}</td>
              <td>{formatNumber(item.hotel.location_score, 1)}</td>
              <td>{formatNumber(item.hotel.view_score, 1)}</td>
              <td>{formatNumber(item.preference_value, 5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}
