import { FormEvent, useState } from "react";
import { LogIn, Mail } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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

type LoginLocationState = {
  from?: {
    pathname?: string;
    search?: string;
  };
};

// LoginPage menangani form masuk admin dan user.
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
  }

  // handleSubmit mengirim form login dan mengarahkan user sesuai role.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedUser = await login({ email, password });
      const fallbackPath = loggedUser.role === "admin" ? "/admin/dashboard" : "/hotels";
      const locationState = location.state as LoginLocationState | null;
      const from = locationState?.from;
      const targetPath = from?.pathname ? `${from.pathname}${from.search ?? ""}` : fallbackPath;

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard
        description="Silakan masuk untuk melanjutkan ke sistem sebagai Admin atau Pengguna."
        kicker="Masuk ke Sistem"
        title="Selamat datang kembali"
      >
        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <AuthAlert message={error} variant="error" />
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
          <div>
            <AuthPasswordInput
              autoComplete="current-password"
              label="Password"
              onChange={(event) => setPassword(event.target.value)}
              onToggleVisibility={() => setShowPassword((current) => !current)}
              placeholder="Masukkan password"
              required
              value={password}
              visible={showPassword}
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <input
                  checked={remember}
                  className="h-4 w-4 rounded border-slate-300 accent-[#0a2a55]"
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                />
                Ingat saya
              </label>
              <button
                className="border-0 bg-transparent p-0 text-sm font-semibold text-blue-700 transition hover:text-[#0a2a55]"
                type="button"
              >
                Lupa password?
              </button>
            </div>
          </div>
          <AuthSubmitButton disabled={submitting} icon={<LogIn className="h-5 w-5" />}>
            {submitting ? "Memproses" : "Masuk"}
          </AuthSubmitButton>
        </form>
        <AuthFooterLink label="Daftar akun" prompt="Belum punya akun?" to="/register" />
      </AuthCard>
    </AuthShell>
  );
}
