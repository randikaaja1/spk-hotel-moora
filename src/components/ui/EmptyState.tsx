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
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
      <strong className="text-sm font-bold text-slate-600">{title}</strong>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
