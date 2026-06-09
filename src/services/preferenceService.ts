import { apiRequest } from "./apiClient";
import type { Preference, PreferenceFilter } from "../types/preference";

// savePreference menyimpan preferensi terakhir user.
export function savePreference(payload: PreferenceFilter): Promise<Preference> {
  return apiRequest<Preference>("/preferences", {
    method: "POST",
    body: payload
  });
}

// getLatestPreference mengambil preferensi terakhir user.
export function getLatestPreference(): Promise<Preference> {
  return apiRequest<Preference>("/preferences/latest");
}
