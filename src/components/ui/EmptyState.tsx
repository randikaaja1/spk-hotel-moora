import type { ReactNode } from "react";

// EmptyState menampilkan keadaan kosong dengan aksi opsional.
export function EmptyState({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
