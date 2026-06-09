import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseFieldProps {
  label: string;
  error?: string;
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}
interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}
interface SelectFieldProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {}

// InputField menampilkan input teks atau angka dengan label konsisten.
export function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

// TextareaField menampilkan area teks untuk deskripsi panjang.
export function TextareaField({ label, error, ...props }: TextareaFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea {...props} />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

// SelectField menampilkan pilihan dropdown dengan label konsisten.
export function SelectField({ label, error, children, ...props }: SelectFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props}>{children}</select>
      {error ? <small>{error}</small> : null}
    </label>
  );
}
