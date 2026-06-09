import type { ReactNode } from "react";

// Card membungkus konten yang perlu dipisahkan dalam panel ringan.
export function Card({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
