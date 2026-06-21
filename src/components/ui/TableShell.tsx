import type { ReactNode } from "react";

// TableShell memberi pembungkus responsif untuk tabel data.
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-slate-100 [&_table]:w-full [&_table]:min-w-[680px] [&_table]:border-collapse [&_td]:border-b [&_td]:border-slate-100 [&_td]:px-3 [&_td]:py-3 [&_td]:align-top [&_td]:text-sm [&_td]:text-slate-600 [&_th]:border-b [&_th]:border-slate-100 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-slate-500 [&_tr:last-child_td]:border-b-0 sm:[&_table]:min-w-[760px] sm:[&_td]:px-4 sm:[&_th]:px-4">
      {children}
    </div>
  );
}
