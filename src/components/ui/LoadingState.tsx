// LoadingState menampilkan indikator sederhana ketika data sedang dimuat.
export function LoadingState({ label = "Memuat data" }: { label?: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center gap-3 text-sm font-semibold text-slate-500">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-100 border-t-[#0a2a55]" />
      <span>{label}</span>
    </div>
  );
}
