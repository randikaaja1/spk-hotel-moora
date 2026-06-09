// LoadingState menampilkan indikator sederhana ketika data sedang dimuat.
export function LoadingState({ label = "Memuat data" }: { label?: string }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
