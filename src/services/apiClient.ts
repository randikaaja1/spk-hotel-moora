import { ApiRequestError, type ApiResponse } from "../types/api";
import { getStoredToken } from "./tokenStorage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

// apiRequest mengirim request ke backend dan mengembalikan field data dari response standar.
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success) {
    throw new ApiRequestError(
      payload.message || "Request failed",
      payload.error?.code || "REQUEST_FAILED",
      payload.error?.details || [],
      response.status
    );
  }

  return payload.data as T;
}
