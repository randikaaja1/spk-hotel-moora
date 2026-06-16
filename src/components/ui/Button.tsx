import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[#0a2a55] text-white shadow-[0_12px_24px_rgba(10,42,85,0.16)] hover:bg-[#0f3f78]",
  secondary:
    "border-slate-200 bg-white text-[#0a2a55] shadow-sm hover:border-blue-100 hover:bg-blue-50",
  ghost: "border-transparent bg-transparent text-[#0a2a55] hover:bg-blue-50",
  danger: "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
};

// Button menyediakan gaya tombol konsisten untuk aksi di semua halaman.
export function Button({
  children,
  className = "",
  icon,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-bold transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 ${variantClass[variant]} ${className}`}
      type={type}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
