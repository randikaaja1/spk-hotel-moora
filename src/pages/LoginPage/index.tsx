import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InputField } from "../../components/ui/FormField";
import { useAuth } from "../../context/AuthContext";
import { ApiRequestError } from "../../types/api";

// LoginPage menangani form masuk admin dan user.
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
  }

  const from = location.state && typeof location.state === "object" ? location.state : null;

  // handleSubmit mengirim form login dan mengarahkan user sesuai role.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedUser = await login({ email, password });
      const fallbackPath = loggedUser.role === "admin" ? "/admin/dashboard" : "/hotels";
      const targetPath =
        from && "from" in from && typeof from.from === "object"
          ? fallbackPath
          : fallbackPath;

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Login gagal");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <span className="eyebrow">SPK Hotel MOORA</span>
        <h1>Masuk</h1>
        <Alert message={error} variant="error" />
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <InputField
            label="Password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <Button disabled={submitting} icon={<LogIn size={18} />} type="submit">
            {submitting ? "Memproses" : "Masuk"}
          </Button>
        </form>
        <p className="auth-footnote">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      </Card>
    </main>
  );
}
