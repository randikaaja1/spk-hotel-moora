import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff, LockKeyhole, Mountain } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "../../assets/hero-kintamani.png";

interface AuthShellProps {
  children: ReactNode;
}

interface AuthCardProps {
  children: ReactNode;
  description: string;
  kicker: string;
  title: string;
}

interface AuthAlertProps {
  message: string;
  variant: "error" | "success";
}

interface AuthFooterLinkProps {
  label: string;
  prompt: string;
  to: string;
}

interface AuthSubmitButtonProps {
  children: ReactNode;
  disabled?: boolean;
  icon: ReactNode;
}

interface AuthPasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  onToggleVisibility: () => void;
  visible: boolean;
}

interface AuthTextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode;
  label: string;
}

// AuthShell membentuk latar gambar dan grid utama untuk halaman login/register.
export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative h-screen max-h-screen overflow-hidden bg-white text-[#0a2a55]">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-left-bottom"
        src={heroImage}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-white/95" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/10 to-white/90" />
      <div className="absolute -bottom-32 -left-24 h-72 w-[120%] rounded-[50%] bg-white/95" />

      <section className="relative z-10 grid h-screen w-full grid-cols-1 items-center gap-5 overflow-hidden px-6 py-5 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:gap-10 lg:px-20 lg:py-8 xl:px-28">
        <div className="flex justify-center lg:justify-start">
          <AuthBrand />
        </div>
        <div className="mx-auto w-full max-w-[520px] lg:mx-0">{children}</div>
      </section>
    </main>
  );
}

// AuthBrand menampilkan identitas sistem pada sisi visual halaman auth.
function AuthBrand() {
  return (
    <div className="flex flex-col items-center lg:items-start">
      <div className="flex items-center gap-3">
        <Mountain className="h-11 w-11 text-[#c7902e] sm:h-14 sm:w-14" strokeWidth={1.7} />
        <span className="font-serif text-3xl font-bold leading-tight text-[#0a2a55] sm:text-4xl xl:text-5xl">
          SPK Hotel Kintamani
        </span>
      </div>
      <span className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.32em] text-[#c7902e] sm:text-xs lg:pl-[72px] lg:text-left">
        Sistem Pendukung Keputusan
      </span>
    </div>
  );
}

// AuthCard menampung judul, deskripsi, dan isi form autentikasi.
export function AuthCard({ children, description, kicker, title }: AuthCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_70px_rgba(10,42,85,0.14)] backdrop-blur-xl sm:p-7 lg:p-9 xl:p-10">
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#c7902e] sm:text-sm">
          {kicker}
        </span>
        <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-[#0a2a55] sm:text-[34px]">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-[360px] text-sm leading-6 text-slate-600 sm:text-[15px]">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

// AuthTextInput membuat field teks dengan ikon dan state fokus yang seragam.
export function AuthTextInput({ icon, label, className = "", ...props }: AuthTextInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#0a2a55]">{label}</span>
      <div className="mt-1.5 flex h-12 items-center rounded-lg border border-slate-300 bg-white/85 px-4 shadow-sm transition-all focus-within:border-[#0a2a55] focus-within:ring-4 focus-within:ring-blue-100">
        <span className="shrink-0 text-slate-500">{icon}</span>
        <input
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] text-[#0a2a55] outline-none placeholder:text-slate-400 ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}

// AuthPasswordInput membuat field password dengan tombol lihat/sembunyikan.
export function AuthPasswordInput({
  label,
  onToggleVisibility,
  visible,
  className = "",
  ...props
}: AuthPasswordInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#0a2a55]">{label}</span>
      <div className="mt-1.5 flex h-12 items-center rounded-lg border border-slate-300 bg-white/85 px-4 shadow-sm transition-all focus-within:border-[#0a2a55] focus-within:ring-4 focus-within:ring-blue-100">
        <LockKeyhole className="h-5 w-5 shrink-0 text-slate-500" />
        <input
          className={`min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] text-[#0a2a55] outline-none placeholder:text-slate-400 ${className}`}
          type={visible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={visible ? "Sembunyikan password" : "Lihat password"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-slate-500 transition hover:bg-slate-100 hover:text-[#0a2a55]"
          onClick={onToggleVisibility}
          type="button"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}

// AuthAlert menampilkan pesan error atau sukses pada form auth.
export function AuthAlert({ message, variant }: AuthAlertProps) {
  if (!message) {
    return null;
  }

  const tone =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-lg border px-4 py-2.5 text-sm font-semibold ${tone}`} role="alert">
      {message}
    </div>
  );
}

// AuthSubmitButton membuat tombol aksi utama untuk login/register.
export function AuthSubmitButton({ children, disabled = false, icon }: AuthSubmitButtonProps) {
  return (
    <button
      className="mt-1 flex h-12 w-full items-center justify-center gap-3 rounded-lg border-0 bg-[#0a2a55] px-5 text-base font-bold text-white shadow-[0_14px_28px_rgba(10,42,85,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#0f3f78] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={disabled}
      type="submit"
    >
      {icon}
      {children}
    </button>
  );
}

// AuthFooterLink menampilkan pemisah dan tautan perpindahan login/register.
export function AuthFooterLink({ label, prompt, to }: AuthFooterLinkProps) {
  return (
    <div className="mt-5 flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <p className="shrink-0 text-sm text-slate-500">
        {prompt}{" "}
        <Link className="font-bold text-blue-700 transition hover:text-[#0a2a55]" to={to}>
          {label}
        </Link>
      </p>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
