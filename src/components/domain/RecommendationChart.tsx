import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { RecommendationItem } from "../../types/recommendation";
import { formatNumber } from "../../utils/formatters";

// RecommendationChart menampilkan grafik batang nilai preferensi MOORA.
export function RecommendationChart({ results }: { results: RecommendationItem[] }) {
  const data = results.map((item) => ({
    label: shortenHotelName(item.hotel.name),
    name: item.hotel.name,
    value: item.preference_value,
    formattedValue: formatNumber(item.preference_value, 5)
  }));
  const chartHeight = Math.max(260, data.length * 40 + 32);

  return (
    <div className="max-h-[420px] w-full max-w-full overflow-y-auto overflow-x-hidden pr-1">
      <div className="w-full min-w-0" style={{ height: chartHeight }}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 6, right: 34, left: 0, bottom: 6 }}
          >
            <CartesianGrid horizontal={false} stroke="#dbeafe" />
            <XAxis
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => formatNumber(Number(value), 2)}
              tickLine={false}
              type="number"
            />
            <YAxis
              axisLine={false}
              dataKey="label"
              fontSize={11}
              tickLine={false}
              type="category"
              width={132}
            />
            <Tooltip
              formatter={(value) => [formatNumber(Number(value), 5), "Yi"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
              labelStyle={{ color: "#0f172a", fontWeight: 700 }}
            />
            <Bar barSize={20} dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]}>
              <LabelList
                dataKey="formattedValue"
                fill="#0a2a55"
                fontSize={11}
                fontWeight={700}
                position="right"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// shortenHotelName menjaga label sumbu tetap rapi tanpa menghilangkan nama penuh di tooltip.
function shortenHotelName(name: string) {
  const trimmed = name.trim();
  return trimmed.length > 18 ? `${trimmed.slice(0, 15)}...` : trimmed;
}
