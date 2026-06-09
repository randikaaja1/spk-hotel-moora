// formatCurrency mengubah angka harga menjadi format Rupiah singkat.
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

// formatNumber membulatkan angka untuk tampilan tabel dan grafik.
export function formatNumber(value: number, digits = 3): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits
  }).format(value);
}

// formatDateTime mengubah string tanggal API menjadi format lokal ringkas.
export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
