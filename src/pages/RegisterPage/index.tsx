import { FormEvent, useState } from "react";
import { Mail, UserPlus, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  AuthAlert,
  AuthCard,
  AuthFooterLink,
  AuthPasswordInput,
  AuthShell,
  AuthSubmitButton,
  AuthTextInput
} from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { ApiRequestError } from "../../types/api";

// RegisterPage menangani pendaftaran akun user baru.
export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
  }

  // handleSubmit mengirim form registrasi user ke backend.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await register({ name, email, password });
      setMessage("Registrasi berhasil. Silakan masuk.");
      window.setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Registrasi gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard
        description="Buat akun pengguna untuk mulai memilih preferensi dan melihat rekomendasi hotel."
        kicker="Daftar Akun"
        title="Mulai gunakan sistem"
      >
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <AuthAlert message={message} variant="success" />
          <AuthAlert message={error} variant="error" />
          <AuthTextInput
            autoComplete="name"
            icon={<UserRound className="h-5 w-5" />}
            label="Nama"
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama lengkap"
            required
            value={name}
          />
          <AuthTextInput
            autoComplete="email"
            icon={<Mail className="h-5 w-5" />}
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@contoh.com"
            required
            type="email"
            value={email}
          />
          <AuthPasswordInput
            autoComplete="new-password"
            label="Password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            onToggleVisibility={() => setShowPassword((current) => !current)}
            placeholder="Minimal 6 karakter"
            required
            value={password}
            visible={showPassword}
          />
          <AuthSubmitButton disabled={submitting} icon={<UserPlus className="h-5 w-5" />}>
            {submitting ? "Memproses" : "Daftar"}
          </AuthSubmitButton>
        </form>
        <AuthFooterLink label="Masuk" prompt="Sudah punya akun?" to="/login" />
      </AuthCard>
    </AuthShell>
  );
}
