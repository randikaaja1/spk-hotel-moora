import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { RecommendationItem } from "../../types/recommendation";
import { formatNumber } from "../../utils/formatters";

// RecommendationChart menampilkan grafik batang nilai preferensi MOORA.
export function RecommendationChart({ results }: { results: RecommendationItem[] }) {
  const data = results.slice(0, 8).map((item) => ({
    name: item.hotel.name,
    value: item.preference_value
  }));

  return (
    <div className="min-h-[320px] w-full">
      <ResponsiveContainer height={320} width="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 24 }}>
          <CartesianGrid stroke="#dbeafe" vertical={false} />
          <XAxis dataKey="name" fontSize={12} interval={0} tickLine={false} />
          <YAxis fontSize={12} tickFormatter={(value) => formatNumber(Number(value), 2)} />
          <Tooltip
            formatter={(value) => [formatNumber(Number(value), 5), "Yi"]}
            labelStyle={{ color: "#0f172a" }}
          />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
