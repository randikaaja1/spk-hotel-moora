import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { AdminCriteriaPage } from "./pages/admin/CriteriaPage";
import { AdminCriteriaWeightsPage } from "./pages/admin/CriteriaWeightsPage";
import { AdminDashboardPage } from "./pages/admin/DashboardPage";
import { AdminHotelsPage } from "./pages/admin/HotelsPage";
import { AdminMooraPage } from "./pages/admin/MooraPage";
import { AdminUsersPage } from "./pages/admin/UsersPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { UserHotelsPage } from "./pages/user/HotelsPage";
import { UserPreferencesPage } from "./pages/user/PreferencesPage";
import { UserRecommendationsPage } from "./pages/user/RecommendationsPage";

// App mendefinisikan seluruh route frontend SPK Hotel MOORA.
export function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<RegisterPage />} path="/register" />

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route element={<AdminDashboardPage />} path="/admin/dashboard" />
          <Route element={<AdminHotelsPage />} path="/admin/hotels" />
          <Route element={<AdminCriteriaPage />} path="/admin/criteria" />
          <Route element={<AdminCriteriaWeightsPage />} path="/admin/criteria/weights" />
          <Route element={<AdminMooraPage />} path="/admin/moora" />
          <Route element={<AdminUsersPage />} path="/admin/users" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["user"]} />}>
        <Route element={<AppLayout />}>
          <Route element={<UserHotelsPage />} path="/hotels" />
          <Route element={<UserPreferencesPage />} path="/preferences" />
          <Route element={<UserRecommendationsPage />} path="/recommendations" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />} >
        <Route element={<AppLayout />}>
          <Route element={<ProfilePage />} path="/profile" />
        </Route>
      </Route>

      <Route element={<RoleRedirect />} path="/app" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}

// RoleRedirect mengarahkan user login ke halaman awal sesuai role.
function RoleRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/hotels"} replace />;
}
