type AlertVariant = "info" | "success" | "error";

// Alert menampilkan pesan pendek hasil proses request atau validasi.
export function Alert({
  message,
  variant = "info"
}: {
  message: string;
  variant?: AlertVariant;
}) {
  if (!message) {
    return null;
  }

  return <div className={`alert alert-${variant}`}>{message}</div>;
}
