import { FormEvent, useEffect, useState } from "react";
import { ListChecks, Save } from "lucide-react";
import { RecommendationTable } from "../../../components/domain/RecommendationTable";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { InputField } from "../../../components/ui/FormField";
import { LoadingState } from "../../../components/ui/LoadingState";
import { PageHeader } from "../../../components/ui/PageHeader";
import {
  getLatestPreference,
  savePreference
} from "../../../services/preferenceService";
import { calculateRecommendation } from "../../../services/recommendationService";
import type { PreferenceFilter } from "../../../types/preference";
import type { RecommendationItem } from "../../../types/recommendation";

type PreferenceFormState = Record<keyof PreferenceFilter, string>;
type PreferenceFormErrors = Partial<Record<keyof PreferenceFilter, string>>;

const emptyPreference: PreferenceFormState = {
  max_budget: "",
  min_rating: "",
  min_accessibility: "",
  max_distance: "",
  min_view: ""
};

// UserPreferencesPage menyimpan filter kebutuhan hotel user.
export function UserPreferencesPage() {
  const [form, setForm] = useState<PreferenceFormState>(emptyPreference);
  const [fieldErrors, setFieldErrors] = useState<PreferenceFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rankingVisible, setRankingVisible] = useState(false);
  const [results, setResults] = useState<RecommendationItem[]>([]);
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
        max_budget: stringifyPreference(latest.max_budget),
        min_rating: stringifyPreference(latest.min_rating),
        min_accessibility: stringifyPreference(latest.min_accessibility),
        max_distance: stringifyPreference(latest.max_distance),
        min_view: stringifyPreference(latest.min_view)
      });
    } catch {
      setForm(emptyPreference);
    } finally {
      setLoading(false);
    }
  }

  // handleSubmit menyimpan preferensi lalu menghitung ranking berdasarkan preferensi terbaru.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const validation = validatePreferenceForm(form);
    setFieldErrors(validation.errors);

    if (!validation.payload) {
      setSubmitting(false);
      return;
    }

    try {
      await savePreference(validation.payload);
    } catch {
      setError("Preferensi belum berhasil disimpan.");
      setSubmitting(false);
      return;
    }

    try {
      const recommendation = await calculateRecommendation({
        preference: validation.payload,
        save_result: true
      });
      setResults(recommendation.results);
      setRankingVisible(true);
      setMessage("Preferensi berhasil disimpan dan ranking diperbarui.");
    } catch {
      setResults([]);
      setRankingVisible(true);
      setError("Preferensi berhasil disimpan, tetapi belum ada ranking yang bisa ditampilkan.");
    } finally {
      setSubmitting(false);
    }
  }

  // updateField memperbarui nilai input manual dan membersihkan error terkait.
  function updateField(key: keyof PreferenceFilter, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Preferensi Hotel"
        description="Simpan batas kebutuhan agar hasil rekomendasi lebih dekat dengan pilihan Anda."
      />
      <Alert message={message} variant="success" />
      <Alert message={error} variant="error" />

      <Card className="max-w-3xl">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-[#0a2a55]">Filter Kebutuhan</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kosongkan field yang tidak ingin dipakai sebagai batas rekomendasi.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              error={fieldErrors.max_budget}
              hint="Contoh: 500000. Tulis angka saja, tanpa Rp, titik, atau koma."
              inputMode="numeric"
              label="Budget maksimal"
              onChange={(event) => updateField("max_budget", event.target.value)}
              placeholder="500000"
              value={form.max_budget}
            />
            <InputField
              error={fieldErrors.min_rating}
              hint="Contoh: 3.5. Rentang 0 sampai 5, gunakan titik untuk desimal."
              inputMode="decimal"
              label="Rating minimum"
              onChange={(event) => updateField("min_rating", event.target.value)}
              placeholder="3.5"
              value={form.min_rating}
            />
            <InputField
              error={fieldErrors.min_accessibility}
              hint="Contoh: 3.0. Rentang 0 sampai 5."
              inputMode="decimal"
              label="Aksesibilitas minimum"
              onChange={(event) => updateField("min_accessibility", event.target.value)}
              placeholder="3.0"
              value={form.min_accessibility}
            />
            <InputField
              error={fieldErrors.max_distance}
              hint="Contoh: 5.5. Jarak maksimal dalam kilometer, minimal 0."
              inputMode="decimal"
              label="Jarak maksimal"
              onChange={(event) => updateField("max_distance", event.target.value)}
              placeholder="5.5"
              value={form.max_distance}
            />
            <InputField
              error={fieldErrors.min_view}
              hint="Contoh: 4.0. Rentang 0 sampai 5."
              inputMode="decimal"
              label="View minimum"
              onChange={(event) => updateField("min_view", event.target.value)}
              placeholder="4.0"
              value={form.min_view}
            />
          </div>
          <div className="flex justify-end">
            <Button disabled={submitting} icon={<Save size={18} />} type="submit">
              {submitting ? "Memproses" : "Simpan"}
            </Button>
          </div>
        </form>
      </Card>

      {rankingVisible ? (
        <Card>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#0a2a55]">
                <ListChecks className="h-5 w-5 text-[#c7902e]" />
                Hasil Ranking
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Urutan hotel dihitung dari preferensi yang baru Anda simpan.
              </p>
            </div>
            <span className="inline-flex h-9 items-center rounded-full border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-[#0a2a55]">
              {results.length} hotel sesuai preferensi
            </span>
          </div>

          {results.length > 0 ? (
            <RecommendationTable results={results} />
          ) : (
            <EmptyState title="Belum ada hotel yang sesuai dengan preferensi." />
          )}
        </Card>
      ) : null}
    </div>
  );
}

// validatePreferenceForm memastikan input preferensi sesuai format angka yang diterima backend.
function validatePreferenceForm(form: PreferenceFormState): {
  errors: PreferenceFormErrors;
  payload?: PreferenceFilter;
} {
  const errors: PreferenceFormErrors = {};
  const payload: PreferenceFilter = {};

  assignOptionalWholeNumber(payload, errors, "max_budget", form.max_budget, "Budget maksimal");
  assignOptionalDecimal(payload, errors, "min_rating", form.min_rating, "Rating minimum", 0, 5);
  assignOptionalDecimal(
    payload,
    errors,
    "min_accessibility",
    form.min_accessibility,
    "Aksesibilitas minimum",
    0,
    5
  );
  assignOptionalDecimal(payload, errors, "max_distance", form.max_distance, "Jarak maksimal", 0);
  assignOptionalDecimal(payload, errors, "min_view", form.min_view, "View minimum", 0, 5);

  if (Object.values(errors).some(Boolean)) {
    return { errors };
  }

  if (Object.keys(payload).length === 0) {
    errors.max_budget = "Isi minimal satu preferensi sebelum menyimpan.";
    return { errors };
  }

  return { errors, payload };
}

// assignOptionalWholeNumber menambahkan angka bulat opsional ke payload jika valid.
function assignOptionalWholeNumber(
  payload: PreferenceFilter,
  errors: PreferenceFormErrors,
  key: keyof PreferenceFilter,
  value: string,
  label: string
) {
  const normalized = value.trim();
  if (!normalized) {
    return;
  }

  if (!/^\d+$/.test(normalized)) {
    errors[key] = `${label} harus angka bulat tanpa titik, koma, atau simbol.`;
    return;
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    errors[key] = `${label} minimal 0.`;
    return;
  }

  payload[key] = parsed;
}

// assignOptionalDecimal menambahkan angka desimal opsional ke payload jika valid.
function assignOptionalDecimal(
  payload: PreferenceFilter,
  errors: PreferenceFormErrors,
  key: keyof PreferenceFilter,
  value: string,
  label: string,
  min: number,
  max?: number
) {
  const normalized = value.trim();
  if (!normalized) {
    return;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    errors[key] = `${label} harus angka desimal valid, contoh 4.5 atau 2.25.`;
    return;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < min || (max !== undefined && parsed > max)) {
    errors[key] =
      max === undefined
        ? `${label} minimal ${min}.`
        : `${label} harus berada pada rentang ${min} sampai ${max}.`;
    return;
  }

  payload[key] = parsed;
}

// stringifyPreference mengubah nilai preferensi tersimpan menjadi string input.
function stringifyPreference(value?: number) {
  return value === undefined || value === null ? "" : String(value);
}
