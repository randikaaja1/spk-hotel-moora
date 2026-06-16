import type { ReactNode } from "react";

// Card membungkus konten yang perlu dipisahkan dalam panel ringan.
export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}
