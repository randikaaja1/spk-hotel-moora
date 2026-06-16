type AlertVariant = "info" | "success" | "error";

const alertClass: Record<AlertVariant, string> = {
  info: "border-blue-100 bg-blue-50 text-blue-700",
  success: "border-emerald-100 bg-emerald-50 text-emerald-700",
  error: "border-red-100 bg-red-50 text-red-700"
};

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

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${alertClass[variant]}`}>
      {message}
    </div>
  );
}
