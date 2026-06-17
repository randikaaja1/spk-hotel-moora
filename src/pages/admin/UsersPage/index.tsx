import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck, UserCheck, UserX, Users, X } from "lucide-react";
import { Alert } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { TableShell } from "../../../components/ui/TableShell";
import { useAuth } from "../../../context/AuthContext";
import {
  getUsers,
  updateUserRole,
  updateUserStatus
} from "../../../services/userService";
import type { Role } from "../../../types/api";
import type { ManagedUser } from "../../../types/user";
import { formatDateTime } from "../../../utils/formatters";

type PendingUserAction =
  | { type: "role"; user: ManagedUser; nextRole: Role }
  | { type: "status"; user: ManagedUser; nextStatus: boolean };

// AdminUsersPage mengelola role dan status aktif pengguna.
export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingUserAction | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadUsers();
  }, []);

  const summary = useMemo(() => buildUserSummary(users), [users]);

  // loadUsers mengambil daftar pengguna terbaru dari backend.
  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      setUsers(await getUsers());
    } catch {
      setError("Data pengguna belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  // openRoleValidation menyiapkan card validasi sebelum role pengguna diubah.
  function openRoleValidation(targetUser: ManagedUser, role: Role) {
    if (currentUser?.id === targetUser.id || targetUser.role === role) {
      return;
    }

    setMessage("");
    setError("");
    setPendingAction({ nextRole: role, type: "role", user: targetUser });
  }

  // openStatusValidation menyiapkan card validasi sebelum status akun diubah.
  function openStatusValidation(targetUser: ManagedUser) {
    if (currentUser?.id === targetUser.id) {
      return;
    }

    setMessage("");
    setError("");
    setPendingAction({ nextStatus: !targetUser.is_active, type: "status", user: targetUser });
  }

  // closeValidationCard menutup card validasi saat tidak ada update berjalan.
  function closeValidationCard() {
    if (updatingKey) {
      return;
    }

    setPendingAction(null);
  }

  // confirmPendingAction menjalankan update role atau status setelah admin menyetujui validasi.
  async function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    const action = pendingAction;
    setMessage("");
    setError("");
    setUpdatingKey(`${action.type}-${action.user.id}`);

    try {
      if (action.type === "role") {
        const updatedUser = await updateUserRole(action.user.id, { role: action.nextRole });
        replaceUser(updatedUser);
        setMessage(`Role ${updatedUser.name} berhasil diubah.`);
        setPendingAction(null);
        return;
      }

      const updatedUser = await updateUserStatus(action.user.id, { is_active: action.nextStatus });
      replaceUser(updatedUser);
      setMessage(`Akun ${updatedUser.name} berhasil ${action.nextStatus ? "diaktifkan" : "dinonaktifkan"}.`);
      setPendingAction(null);
    } catch {
      setPendingAction(null);
      setError(
        action.type === "role"
          ? "Role pengguna belum berhasil diubah."
          : "Status pengguna belum berhasil diubah."
      );
    } finally {
      setUpdatingKey("");
    }
  }

  // replaceUser mengganti satu user pada state setelah update berhasil.
  function replaceUser(updatedUser: ManagedUser) {
    setUsers((current) =>
      current.map((item) => (item.id === updatedUser.id ? updatedUser : item))
    );
  }

  if (loading) {
    return <LoadingState label="Memuat data pengguna" />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        action={
          <Button icon={<RefreshCw size={18} />} onClick={() => void loadUsers()} variant="secondary">
            Muat ulang
          </Button>
        }
        description="Kelola role dan status akun pengguna yang terdaftar di sistem."
        title="Pengguna"
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <div className="grid gap-4 md:grid-cols-4">
        <UserMetricCard icon={<Users className="h-5 w-5" />} label="Total" tone="blue" value={summary.total} />
        <UserMetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Admin" tone="purple" value={summary.admins} />
        <UserMetricCard icon={<UserCheck className="h-5 w-5" />} label="Aktif" tone="green" value={summary.active} />
        <UserMetricCard icon={<UserX className="h-5 w-5" />} label="Nonaktif" tone="amber" value={summary.inactive} />
      </div>

      <Card className="min-w-0">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0a2a55]">Daftar Pengguna</h2>
          <p className="mt-1 text-sm text-slate-500">
            Role dan status dapat diubah untuk akun lain. Akun yang sedang digunakan dikunci.
          </p>
        </div>

        {users.length === 0 ? (
          <EmptyState title="Belum ada pengguna." />
        ) : (
          <TableShell>
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Terdaftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const isCurrentUser = currentUser?.id === item.id;
                  const roleUpdating = updatingKey === `role-${item.id}`;
                  const statusUpdating = updatingKey === `status-${item.id}`;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong className="block font-bold text-[#0a2a55]">{item.name}</strong>
                        <span className="mt-1 block text-xs text-slate-500">{item.email}</span>
                        {isCurrentUser ? (
                          <span className="mt-2 block text-xs font-semibold text-blue-700">
                            Akun sedang digunakan
                          </span>
                        ) : null}
                      </td>
                      <td>
                        <select
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[#0a2a55] outline-none transition focus:border-[#0a2a55] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          disabled={isCurrentUser || roleUpdating || statusUpdating}
                          onChange={(event) => openRoleValidation(item, event.target.value as Role)}
                          value={item.role}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <Badge tone={item.is_active ? "green" : "red"}>
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td>{formatDateTime(item.created_at)}</td>
                      <td>
                        <Button
                          className="h-10"
                          disabled={isCurrentUser || roleUpdating || statusUpdating}
                          onClick={() => openStatusValidation(item)}
                          variant={item.is_active ? "danger" : "secondary"}
                        >
                          {statusUpdating
                            ? "Memproses"
                            : item.is_active
                              ? "Nonaktifkan"
                              : "Aktifkan"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
        )}
      </Card>

      {pendingAction ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/35 px-4 py-8 backdrop-blur-sm"
          onClick={closeValidationCard}
          role="dialog"
        >
          <div
            className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(10,42,85,0.22)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${getPendingActionTone(pendingAction)}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c98b24]">
                    Validasi Pengguna
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-[#0a2a55]">
                    {getPendingActionTitle(pendingAction)}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {getPendingActionDescription(pendingAction)}
                  </p>
                </div>
              </div>
              <button
                aria-label="Tutup validasi pengguna"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-0 bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={Boolean(updatingKey)}
                onClick={closeValidationCard}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3">
              <ValidationInfo label="Pengguna" value={pendingAction.user.name} />
              <ValidationInfo label="Email" value={pendingAction.user.email} />
              <ValidationInfo label="Aksi" value={getPendingActionValue(pendingAction)} />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button disabled={Boolean(updatingKey)} onClick={closeValidationCard} variant="secondary">
                Batal
              </Button>
              <Button
                disabled={Boolean(updatingKey)}
                onClick={() => void confirmPendingAction()}
                variant={getPendingActionButtonVariant(pendingAction)}
              >
                {updatingKey ? "Memproses" : getPendingActionConfirmLabel(pendingAction)}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ValidationInfo menampilkan detail singkat pada card validasi pengguna.
function ValidationInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-white p-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-[#0a2a55]">{value}</p>
    </div>
  );
}

// UserMetricCard menampilkan ringkasan jumlah pengguna berdasarkan status.
function UserMetricCard({
  icon,
  label,
  tone,
  value
}: {
  icon: ReactNode;
  label: string;
  tone: "blue" | "green" | "amber" | "purple";
  value: number;
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    purple: "bg-violet-50 text-violet-700"
  }[tone];

  return (
    <Card className="flex min-h-[118px] items-center gap-4">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${toneClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-[#0a2a55]">{value}</p>
      </div>
    </Card>
  );
}

// buildUserSummary menghitung total pengguna berdasarkan role dan status akun.
function buildUserSummary(users: ManagedUser[]) {
  return users.reduce(
    (current, item) => {
      current.total += 1;
      if (item.role === "admin") {
        current.admins += 1;
      }
      if (item.is_active) {
        current.active += 1;
      } else {
        current.inactive += 1;
      }

      return current;
    },
    { active: 0, admins: 0, inactive: 0, total: 0 }
  );
}

// formatRoleLabel mengubah kode role menjadi label yang mudah dibaca.
function formatRoleLabel(role: Role) {
  return role === "admin" ? "Admin" : "User";
}

// getPendingActionTitle membuat judul card sesuai aksi yang sedang divalidasi.
function getPendingActionTitle(action: PendingUserAction) {
  if (action.type === "role") {
    return "Ubah role pengguna?";
  }

  return action.nextStatus ? "Aktifkan akun pengguna?" : "Nonaktifkan akun pengguna?";
}

// getPendingActionDescription menjelaskan dampak aksi sebelum admin mengonfirmasi.
function getPendingActionDescription(action: PendingUserAction) {
  if (action.type === "role") {
    return `Role ${action.user.name} akan diubah dari ${formatRoleLabel(action.user.role)} menjadi ${formatRoleLabel(action.nextRole)}.`;
  }

  return action.nextStatus
    ? `Akun ${action.user.name} akan dapat masuk kembali dan menggunakan sistem.`
    : `Akun ${action.user.name} tidak akan dapat login sampai statusnya diaktifkan kembali.`;
}

// getPendingActionValue menampilkan ringkasan nilai perubahan pada card validasi.
function getPendingActionValue(action: PendingUserAction) {
  if (action.type === "role") {
    return `${formatRoleLabel(action.user.role)} ke ${formatRoleLabel(action.nextRole)}`;
  }

  return action.nextStatus ? "Aktifkan akun" : "Nonaktifkan akun";
}

// getPendingActionConfirmLabel membuat label tombol konfirmasi sesuai aksi.
function getPendingActionConfirmLabel(action: PendingUserAction) {
  if (action.type === "role") {
    return "Ubah Role";
  }

  return action.nextStatus ? "Aktifkan" : "Nonaktifkan";
}

// getPendingActionButtonVariant menentukan warna tombol utama pada card validasi.
function getPendingActionButtonVariant(action: PendingUserAction) {
  return action.type === "status" && !action.nextStatus ? "danger" : "primary";
}

// getPendingActionTone menentukan warna ikon peringatan pada card validasi.
function getPendingActionTone(action: PendingUserAction) {
  if (action.type === "status" && !action.nextStatus) {
    return "bg-red-50 text-red-600";
  }

  return "bg-blue-50 text-blue-700";
}
