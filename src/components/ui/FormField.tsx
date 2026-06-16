import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}
interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}
interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {}

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0a2a55] outline-none transition placeholder:text-slate-400 focus:border-[#0a2a55] focus:ring-4 focus:ring-blue-100";

// InputField menampilkan input teks atau angka dengan label konsisten.
export function InputField({ label, error, hint, ...props }: InputFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#0a2a55]">{label}</span>
      <input className={inputClass} {...props} />
      {hint ? <small className="mt-1 block text-xs leading-5 text-slate-500">{hint}</small> : null}
      {error ? <small className="mt-1 block text-xs font-semibold text-red-600">{error}</small> : null}
    </label>
  );
}

// TextareaField menampilkan area teks untuk deskripsi panjang.
export function TextareaField({ label, error, hint, ...props }: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#0a2a55]">{label}</span>
      <textarea className={`${inputClass} min-h-[104px] resize-y`} {...props} />
      {hint ? <small className="mt-1 block text-xs leading-5 text-slate-500">{hint}</small> : null}
      {error ? <small className="mt-1 block text-xs font-semibold text-red-600">{error}</small> : null}
    </label>
  );
}

// SelectField menampilkan pilihan dropdown dengan label konsisten.
export function SelectField({ label, error, hint, children, ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#0a2a55]">{label}</span>
      <select className={inputClass} {...props}>{children}</select>
      {hint ? <small className="mt-1 block text-xs leading-5 text-slate-500">{hint}</small> : null}
      {error ? <small className="mt-1 block text-xs font-semibold text-red-600">{error}</small> : null}
    </label>
  );
}
