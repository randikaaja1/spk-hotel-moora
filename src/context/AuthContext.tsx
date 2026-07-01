import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";
import * as authService from "../services/authService";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from "../services/tokenStorage";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// AuthProvider menyimpan sesi login dan membagikannya ke seluruh halaman.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await authService.getMe();
      setUser(profile);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // handleLogin menyimpan token dan profil setelah kredensial berhasil diverifikasi.
  const handleLogin = useCallback(async (payload: LoginPayload) => {
    const result = await authService.login(payload);
    setStoredToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  // handleRegister menyimpan token dari register agar user langsung masuk tanpa login ulang.
  const handleRegister = useCallback(async (payload: RegisterPayload) => {
    const result = await authService.register(payload);
    setStoredToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const handleLogout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshProfile
    }),
    [handleLogin, handleLogout, handleRegister, loading, refreshProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth mengambil state auth dari provider terdekat.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
