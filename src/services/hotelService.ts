import { apiRequest } from "./apiClient";
import type { Hotel, SaveHotelPayload } from "../types/hotel";

// getHotels mengambil daftar hotel untuk admin dan user.
export function getHotels(): Promise<Hotel[]> {
  return apiRequest<Hotel[]>("/hotels");
}

// createHotel menyimpan hotel baru dari halaman admin.
export function createHotel(payload: SaveHotelPayload): Promise<Hotel> {
  return apiRequest<Hotel>("/hotels", {
    method: "POST",
    body: payload
  });
}

// updateHotel memperbarui data hotel berdasarkan id.
export function updateHotel(id: number, payload: SaveHotelPayload): Promise<Hotel> {
  return apiRequest<Hotel>(`/hotels/${id}`, {
    method: "PUT",
    body: payload
  });
}

// deleteHotel menghapus hotel berdasarkan id.
export function deleteHotel(id: number): Promise<{ id: number }> {
  return apiRequest<{ id: number }>(`/hotels/${id}`, {
    method: "DELETE"
  });
}
