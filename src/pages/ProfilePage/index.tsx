import type { ReactNode } from "react";
import { LogOut, Mail, Shield, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/formatters";

// ProfilePage menampilkan identitas akun yang sedang login.
export function ProfilePage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // handleLogout mengakhiri sesi dan mengarahkan user ke halaman login.
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        description="Informasi akun yang sedang digunakan pada sistem SPK Hotel Kintamani."
        title="Profil"
      />

      <Card className="max-w-3xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#0a2a55] text-2xl font-bold text-white shadow-[0_12px_24px_rgba(10,42,85,0.18)]">
              {getInitial(user?.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0a2a55]">{user?.name || "Pengguna"}</h2>
              <p className="mt-1 text-sm text-slate-500">{user?.email || "-"}</p>
            </div>
          </div>
          <Button icon={<LogOut className="h-4 w-4" />} onClick={handleLogout} variant="danger">
            Logout
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ProfileInfo
            icon={<UserRound className="h-5 w-5" />}
            label="Nama"
            value={user?.name || "-"}
          />
          <ProfileInfo
            icon={<Mail className="h-5 w-5" />}
            label="Email"
            value={user?.email || "-"}
          />
          <ProfileInfo
            icon={<Shield className="h-5 w-5" />}
            label="Role"
            value={user?.role === "admin" ? "Administrator" : "Pengguna"}
          />
        </div>

        <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-[#0a2a55]">Detail sesi</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Akun dibuat pada {user?.created_at ? formatDateTime(user.created_at) : "-"} dan terakhir
            diperbarui pada {user?.updated_at ? formatDateTime(user.updated_at) : "-"}.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ProfileInfo menampilkan satu item informasi profil dalam kartu kecil.
function ProfileInfo({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-4">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-[#0a2a55]">{value}</p>
    </div>
  );
}

// getInitial mengambil inisial nama untuk avatar profil.
function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "U";
}
