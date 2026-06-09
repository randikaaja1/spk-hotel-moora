const TOKEN_KEY = "spk_hotel_moora_token";

// getStoredToken mengambil token JWT dari localStorage browser.
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// setStoredToken menyimpan token JWT setelah login berhasil.
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// clearStoredToken menghapus token JWT saat logout atau sesi tidak valid.
export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
