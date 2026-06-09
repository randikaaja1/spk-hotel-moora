import { UserCircle } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";

// Topbar menampilkan konteks halaman dan profil singkat user.
export function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <span className="topbar-kicker">Sistem Pendukung Keputusan</span>
        <strong>Pemilihan Hotel Kintamani</strong>
      </div>
      {user ? (
        <div className="topbar-user">
          <UserCircle size={22} />
          <span>{user.name}</span>
          <Badge tone={user.role === "admin" ? "blue" : "green"}>{user.role}</Badge>
        </div>
      ) : null}
    </header>
  );
}
