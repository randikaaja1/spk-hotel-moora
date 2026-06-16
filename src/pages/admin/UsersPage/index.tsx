import { useEffect, useState } from "react";
import { Database, ShieldCheck, Users } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import { getDashboardSummary } from "../../../services/dashboardService";

// AdminUsersPage menampilkan status modul pengguna sesuai batas MVP.
export function AdminUsersPage() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSummary();
  }, []);

  // loadSummary mengambil total pengguna dari ringkasan dashboard.
  async function loadSummary() {
    setLoading(true);
    setError("");

    try {
      const summary = await getDashboardSummary();
      setTotalUsers(summary.total_users);
    } catch {
      setError("Total pengguna belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingState label="Memuat data pengguna" />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        description={error || "Ringkasan pengguna sistem dan catatan pengelolaan role admin."}
        title="Pengguna"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Pengguna</p>
              <p className="mt-2 text-3xl font-bold text-[#0a2a55]">{totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-amber-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Role Admin</p>
              <p className="mt-2 text-xl font-bold text-[#0a2a55]">Database</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Modul CRUD User</p>
              <p className="mt-2 text-xl font-bold text-[#0a2a55]">Belum aktif</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-[#0a2a55]">Catatan Pengelolaan</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Pada MVP ini pendaftaran pengguna dilakukan dari halaman register. Perubahan role menjadi admin
          tetap dilakukan langsung dari database sesuai keputusan sebelumnya, sehingga belum ada tombol
          ubah role atau hapus pengguna dari UI.
        </p>
      </Card>
    </div>
  );
}
