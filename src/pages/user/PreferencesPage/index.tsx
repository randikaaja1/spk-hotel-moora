import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { InputField } from "../../../components/ui/FormField";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import {
  getLatestPreference,
  savePreference
} from "../../../services/preferenceService";
import type { PreferenceFilter } from "../../../types/preference";

const emptyPreference: PreferenceFilter = {
  max_budget: undefined,
  min_rating: undefined,
  min_accessibility: undefined,
  max_distance: undefined,
  min_view: undefined
};

// UserPreferencesPage menyimpan filter kebutuhan hotel user.
export function UserPreferencesPage() {
  const [form, setForm] = useState<PreferenceFilter>(emptyPreference);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadPreference();
  }, []);

  // loadPreference mengambil preferensi terakhir jika user sudah pernah menyimpan.
  async function loadPreference() {
    setLoading(true);
    setError("");

    try {
      const latest = await getLatestPreference();
      setForm({
        max_budget: latest.max_budget,
        min_rating: latest.min_rating,
        min_accessibility: latest.min_accessibility,
        max_distance: latest.max_distance,
        min_view: latest.min_view
      });
    } catch {
      setForm(emptyPreference);
    } finally {
      setLoading(false);
    }
  }

  // handleSubmit menyimpan preferensi user ke backend.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      await savePreference(cleanPreference(form));
      setMessage("Preferensi berhasil disimpan.");
    } catch {
      setError("Preferensi belum berhasil disimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  // updateField memperbarui nilai numerik preferensi dari input.
  function updateField(key: keyof PreferenceFilter, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value === "" ? undefined : Number(value)
    }));
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="stack">
      <PageHeader title="Preferensi Hotel" />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <Card className="narrow-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <InputField
            label="Budget maksimal"
            min={0}
            onChange={(event) => updateField("max_budget", event.target.value)}
            type="number"
            value={form.max_budget ?? ""}
          />
          <InputField
            label="Rating minimum"
            max={5}
            min={0}
            onChange={(event) => updateField("min_rating", event.target.value)}
            step="0.1"
            type="number"
            value={form.min_rating ?? ""}
          />
          <InputField
            label="Aksesibilitas minimum"
            max={5}
            min={0}
            onChange={(event) => updateField("min_accessibility", event.target.value)}
            step="0.1"
            type="number"
            value={form.min_accessibility ?? ""}
          />
          <InputField
            label="Jarak maksimal"
            min={0}
            onChange={(event) => updateField("max_distance", event.target.value)}
            step="0.1"
            type="number"
            value={form.max_distance ?? ""}
          />
          <InputField
            label="View minimum"
            max={5}
            min={0}
            onChange={(event) => updateField("min_view", event.target.value)}
            step="0.1"
            type="number"
            value={form.min_view ?? ""}
          />
          <div className="form-actions">
            <Button disabled={submitting} icon={<Save size={18} />} type="submit">
              {submitting ? "Menyimpan" : "Simpan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// cleanPreference menghapus field kosong sebelum dikirim ke backend.
function cleanPreference(form: PreferenceFilter): PreferenceFilter {
  return Object.fromEntries(
    Object.entries(form).filter(([, value]) => value !== undefined && value !== null)
  ) as PreferenceFilter;
}
