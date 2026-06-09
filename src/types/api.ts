export type Role = "admin" | "user";

export interface ApiError {
  code: string;
  details?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

export class ApiRequestError extends Error {
  code: string;
  details: string[];
  status: number;

  // Membentuk error API yang seragam untuk ditangani halaman.
  constructor(message: string, code: string, details: string[], status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}
