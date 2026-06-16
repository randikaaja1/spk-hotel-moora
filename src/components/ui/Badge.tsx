type BadgeTone = "blue" | "green" | "amber" | "red" | "slate";

const toneClass: Record<BadgeTone, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700"
};

// Badge menampilkan status singkat seperti role atau atribut kriteria.
export function Badge({
  children,
  tone = "blue"
}: {
  children: string;
  tone?: BadgeTone;
}) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
