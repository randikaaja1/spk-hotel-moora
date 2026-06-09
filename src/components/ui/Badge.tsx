type BadgeTone = "blue" | "green" | "amber" | "red" | "slate";

// Badge menampilkan status singkat seperti role atau atribut kriteria.
export function Badge({
  children,
  tone = "blue"
}: {
  children: string;
  tone?: BadgeTone;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
