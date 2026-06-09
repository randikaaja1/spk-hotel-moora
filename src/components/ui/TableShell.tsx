import type { ReactNode } from "react";

// TableShell memberi pembungkus responsif untuk tabel data.
export function TableShell({ children }: { children: ReactNode }) {
  return <div className="table-shell">{children}</div>;
}
