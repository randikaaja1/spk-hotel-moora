import type { ReactNode } from "react";
import { Card } from "./Card";

// StatCard menampilkan angka ringkasan pada dashboard.
export function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <Card className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}
