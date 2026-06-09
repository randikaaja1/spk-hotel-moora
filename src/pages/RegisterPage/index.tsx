import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { InputField } from "../../components/ui/FormField";
import { useAuth } from "../../context/AuthContext";
import { ApiRequestError } from "../../types/api";

// RegisterPage menangani pendaftaran akun user baru.
export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="auth-page">
      <Card className="auth-card">
        <span className="eyebrow">Akun User</span>
        <h1>Daftar</h1>
        <Alert message={message} variant="success" />
        <Alert message={error} variant="error" />
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField
            label="Nama"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <InputField
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <InputField
            label="Password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <Button disabled={submitting} icon={<UserPlus size={18} />} type="submit">
            {submitting ? "Memproses" : "Daftar"}
          </Button>
        </form>
        <p className="auth-footnote">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </Card>
    </main>
  );
}
