import { useState, type ReactNode } from "react";
import { AlertTriangle, LogOut, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

type LogoutButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface LogoutButtonProps {
  children?: ReactNode;
  className?: string;
  variant?: LogoutButtonVariant;
}

// LogoutButton menampilkan tombol logout dengan validasi konfirmasi sebelum sesi diakhiri.
export function LogoutButton({
  children = "Logout",
  className = "",
  variant = "danger"
}: LogoutButtonProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  // confirmLogout menghapus sesi user lalu mengarahkan kembali ke halaman login.
  function confirmLogout() {
    logout();
    setShowConfirmation(false);
    navigate("/login", { replace: true });
  }

  const confirmationModal = showConfirmation
    ? createPortal(
        <div
          aria-modal="true"
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-slate-950/35 px-4 py-8 backdrop-blur-sm"
          onClick={() => setShowConfirmation(false)}
          role="dialog"
        >
          <div
            className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(10,42,85,0.22)] sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c98b24]">
                    Logout
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-[#0a2a55]">
                    Keluar dari sistem?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Sesi {user?.name || "pengguna"} akan diakhiri dan Anda perlu login kembali
                    untuk mengakses sistem.
                  </p>
                </div>
              </div>
              <button
                aria-label="Tutup validasi logout"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-0 bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowConfirmation(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button onClick={() => setShowConfirmation(false)} variant="secondary">
                Batal
              </Button>
              <Button onClick={confirmLogout} variant="danger">
                Logout
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <Button
        className={className}
        icon={<LogOut className="h-5 w-5" />}
        onClick={() => setShowConfirmation(true)}
        variant={variant}
      >
        {children}
      </Button>

      {confirmationModal}
    </>
  );
}
