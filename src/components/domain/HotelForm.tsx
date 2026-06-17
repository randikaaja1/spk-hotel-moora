import { FormEvent, useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { InputField, TextareaField } from "../ui/FormField";
import type { Criterion } from "../../types/criterion";
import type { Hotel, SaveHotelPayload } from "../../types/hotel";

type HotelBaseField =
  | "name"
  | "price"
  | "rating_facility"
  | "accessibility"
  | "distance_km"
  | "location_score"
  | "view_score"
  | "description";
type HotelFormState = Record<HotelBaseField, string>;
type HotelFormErrors = Partial<Record<HotelBaseField, string>>;
type CriterionFormState = Record<number, string>;
type CriterionFormErrors = Record<number, string | undefined>;

const emptyForm: HotelFormState = {
  name: "",
  price: "",
  rating_facility: "",
  accessibility: "",
  distance_km: "",
  location_score: "",
  view_score: "",
  description: ""
};

// HotelForm menangani input hotel dan nilai kriteria dinamis sebelum submit.
export function HotelForm({
  criteria,
  initialData,
  submitting,
  onCancel,
  onSubmit
}: {
  criteria: Criterion[];
  initialData?: Hotel | null;
  submitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: SaveHotelPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState<HotelFormState>(emptyForm);
  const [criterionForm, setCriterionForm] = useState<CriterionFormState>({});
  const [errors, setErrors] = useState<HotelFormErrors>({});
  const [criterionErrors, setCriterionErrors] = useState<CriterionFormErrors>({});
  const extraCriteria = useMemo(
    () => criteria.filter((criterion) => !getLegacyCriterionKey(criterion)),
    [criteria]
  );

  useEffect(() => {
    setErrors({});
    setCriterionErrors({});
    setCriterionForm(buildCriterionFormState(criteria, initialData ?? null));

    if (!initialData) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: initialData.name,
      price: String(initialData.price),
      rating_facility: String(initialData.rating_facility),
      accessibility: String(initialData.accessibility),
      distance_km: String(initialData.distance_km),
      location_score: String(initialData.location_score),
      view_score: String(initialData.view_score),
      description: initialData.description
    });
  }, [criteria, initialData]);

  // handleSubmit memvalidasi input lalu mengirim payload hotel ke parent page.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateHotelForm(form, criteria, criterionForm);
    setErrors(validation.errors);
    setCriterionErrors(validation.criterionErrors);

    if (!validation.payload) {
      return;
    }

    await onSubmit(validation.payload);
    if (!initialData) {
      setForm(emptyForm);
      setCriterionForm(buildCriterionFormState(criteria, null));
    }
  }

  // updateField memperbarui nilai input dasar dan membersihkan error field tersebut.
  function updateField(key: HotelBaseField, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  // updateCriterionField memperbarui nilai kriteria tambahan yang berasal dari database.
  function updateCriterionField(criterionID: number, value: string) {
    setCriterionForm((current) => ({ ...current, [criterionID]: value }));
    setCriterionErrors((current) => ({ ...current, [criterionID]: undefined }));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <InputField
        error={errors.name}
        hint="Contoh: Hotel Lakeview Kintamani."
        label="Nama hotel"
        onChange={(event) => updateField("name", event.target.value)}
        placeholder="Nama hotel"
        required
        value={form.name}
      />
      <InputField
        error={errors.price}
        hint="Contoh: 450000. Tulis angka saja, tanpa Rp, titik, atau koma."
        inputMode="numeric"
        label="Harga"
        onChange={(event) => updateField("price", event.target.value)}
        placeholder="450000"
        required
        value={form.price}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          error={errors.rating_facility}
          hint="Contoh: 4.5. Rentang 0 sampai 5, gunakan titik untuk desimal."
          inputMode="decimal"
          label="Rating fasilitas"
          onChange={(event) => updateField("rating_facility", event.target.value)}
          placeholder="4.5"
          required
          value={form.rating_facility}
        />
        <InputField
          error={errors.accessibility}
          hint="Contoh: 4.0. Rentang 0 sampai 5."
          inputMode="decimal"
          label="Aksesibilitas"
          onChange={(event) => updateField("accessibility", event.target.value)}
          placeholder="4.0"
          required
          value={form.accessibility}
        />
        <InputField
          error={errors.distance_km}
          hint="Contoh: 2.5. Jarak dalam kilometer, minimal 0."
          inputMode="decimal"
          label="Jarak km"
          onChange={(event) => updateField("distance_km", event.target.value)}
          placeholder="2.5"
          required
          value={form.distance_km}
        />
        <InputField
          error={errors.location_score}
          hint="Contoh: 4.2. Rentang 0 sampai 5."
          inputMode="decimal"
          label="Skor lokasi"
          onChange={(event) => updateField("location_score", event.target.value)}
          placeholder="4.2"
          required
          value={form.location_score}
        />
        <InputField
          error={errors.view_score}
          hint="Contoh: 4.8. Rentang 0 sampai 5."
          inputMode="decimal"
          label="Skor view"
          onChange={(event) => updateField("view_score", event.target.value)}
          placeholder="4.8"
          required
          value={form.view_score}
        />
      </div>

      {extraCriteria.length > 0 ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
          <h3 className="text-sm font-bold text-[#0a2a55]">Nilai Kriteria Tambahan</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Field ini mengikuti kriteria yang ditambahkan pada halaman Kriteria.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {extraCriteria.map((criterion) => (
              <InputField
                error={criterionErrors[criterion.id]}
                hint={`${criterion.code} - ${criterion.attribute}. Contoh: 4.5, gunakan titik untuk desimal.`}
                inputMode="decimal"
                key={criterion.id}
                label={criterion.name}
                onChange={(event) => updateCriterionField(criterion.id, event.target.value)}
                placeholder="4.5"
                required
                value={criterionForm[criterion.id] ?? ""}
              />
            ))}
          </div>
        </div>
      ) : null}

      <TextareaField
        error={errors.description}
        hint="Contoh: Hotel dengan pemandangan Danau Batur dan akses mudah ke area wisata."
        label="Deskripsi"
        onChange={(event) => updateField("description", event.target.value)}
        placeholder="Deskripsi singkat hotel"
        rows={4}
        value={form.description}
      />
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <Button onClick={onCancel} variant="secondary">
            Batal
          </Button>
        ) : null}
        <Button disabled={submitting} icon={<Save size={18} />} type="submit">
          {submitting ? "Menyimpan" : initialData ? "Perbarui" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}

// validateHotelForm memastikan nilai dasar dan kriteria dinamis sesuai format backend.
function validateHotelForm(
  form: HotelFormState,
  criteria: Criterion[],
  criterionForm: CriterionFormState
): {
  errors: HotelFormErrors;
  criterionErrors: CriterionFormErrors;
  payload?: SaveHotelPayload;
} {
  const errors: HotelFormErrors = {};
  const criterionErrors: CriterionFormErrors = {};
  const name = form.name.trim();
  const description = form.description.trim();
  const price = parseWholeNumber(form.price, "Harga", errors, "price");
  const ratingFacility = parseDecimalRange(
    form.rating_facility,
    "Rating fasilitas",
    errors,
    "rating_facility",
    0,
    5
  );
  const accessibility = parseDecimalRange(
    form.accessibility,
    "Aksesibilitas",
    errors,
    "accessibility",
    0,
    5
  );
  const distanceKm = parseDecimalRange(form.distance_km, "Jarak", errors, "distance_km", 0);
  const locationScore = parseDecimalRange(
    form.location_score,
    "Skor lokasi",
    errors,
    "location_score",
    0,
    5
  );
  const viewScore = parseDecimalRange(form.view_score, "Skor view", errors, "view_score", 0, 5);

  if (!name) {
    errors.name = "Nama hotel wajib diisi.";
  }

  if (!description) {
    errors.description = "Deskripsi wajib diisi.";
  }

  const baseValues = {
    accessibility,
    distance_km: distanceKm,
    location_score: locationScore,
    price,
    rating_facility: ratingFacility,
    view_score: viewScore
  };

  const criterionValues = criteria.map((criterion) => ({
    criterion_id: criterion.id,
    value: resolveCriterionPayloadValue(criterion, criterionForm, baseValues, criterionErrors)
  }));

  if (Object.values(errors).some(Boolean) || Object.values(criterionErrors).some(Boolean)) {
    return { errors, criterionErrors };
  }

  return {
    errors,
    criterionErrors,
    payload: {
      name,
      price,
      rating_facility: ratingFacility,
      accessibility,
      distance_km: distanceKm,
      location_score: locationScore,
      view_score: viewScore,
      description,
      criterion_values: criterionValues
    }
  };
}

// buildCriterionFormState mengisi nilai kriteria tambahan saat form dibuka.
function buildCriterionFormState(criteria: Criterion[], initialData: Hotel | null): CriterionFormState {
  return criteria.reduce<CriterionFormState>((current, criterion) => {
    if (getLegacyCriterionKey(criterion)) {
      return current;
    }

    const storedValue = initialData?.criterion_values?.find(
      (item) => item.criterion_id === criterion.id
    );
    current[criterion.id] = storedValue ? String(storedValue.value) : "";

    return current;
  }, {});
}

// resolveCriterionPayloadValue mengambil nilai kriteria dari field dasar atau field tambahan.
function resolveCriterionPayloadValue(
  criterion: Criterion,
  criterionForm: CriterionFormState,
  baseValues: Pick<
    SaveHotelPayload,
    "accessibility" | "distance_km" | "location_score" | "price" | "rating_facility" | "view_score"
  >,
  criterionErrors: CriterionFormErrors
) {
  switch (getLegacyCriterionKey(criterion)) {
    case "price":
      return baseValues.price;
    case "rating":
      return baseValues.rating_facility;
    case "accessibility":
      return baseValues.accessibility;
    case "distance":
      return baseValues.distance_km;
    case "location":
      return baseValues.location_score;
    case "view":
      return baseValues.view_score;
    default:
      return parseCriterionDecimal(criterion, criterionForm[criterion.id] ?? "", criterionErrors);
  }
}

// parseWholeNumber memvalidasi harga agar hanya berisi angka bulat positif.
function parseWholeNumber(
  value: string,
  label: string,
  errors: HotelFormErrors,
  key: HotelBaseField
) {
  const normalized = value.trim();

  if (!normalized) {
    errors[key] = `${label} wajib diisi.`;
    return 0;
  }

  if (!/^\d+$/.test(normalized)) {
    errors[key] = `${label} harus angka bulat tanpa titik, koma, atau simbol.`;
    return 0;
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    errors[key] = `${label} harus lebih besar dari 0.`;
    return 0;
  }

  return parsed;
}

// parseDecimalRange memvalidasi angka desimal dengan titik dan batas nilai tertentu.
function parseDecimalRange(
  value: string,
  label: string,
  errors: HotelFormErrors,
  key: HotelBaseField,
  min: number,
  max?: number
) {
  const normalized = value.trim();

  if (!normalized) {
    errors[key] = `${label} wajib diisi.`;
    return 0;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    errors[key] = `${label} harus angka desimal valid, contoh 4.5 atau 2.25.`;
    return 0;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < min || (max !== undefined && parsed > max)) {
    errors[key] =
      max === undefined
        ? `${label} minimal ${min}.`
        : `${label} harus berada pada rentang ${min} sampai ${max}.`;
    return 0;
  }

  return parsed;
}

// parseCriterionDecimal memvalidasi nilai kriteria tambahan sebagai skor 0 sampai 5.
function parseCriterionDecimal(
  criterion: Criterion,
  value: string,
  errors: CriterionFormErrors
) {
  const normalized = value.trim();

  if (!normalized) {
    errors[criterion.id] = `${criterion.name} wajib diisi.`;
    return 0;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    errors[criterion.id] = `${criterion.name} harus angka desimal valid, contoh 4.5.`;
    return 0;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) {
    errors[criterion.id] = `${criterion.name} harus berada pada rentang 0 sampai 5.`;
    return 0;
  }

  return parsed;
}

// getLegacyCriterionKey mengenali kriteria default yang memakai field dasar hotel.
function getLegacyCriterionKey(criterion: Criterion) {
  const code = criterion.code.trim().toUpperCase();
  if (code === "C1") return "price";
  if (code === "C2") return "rating";
  if (code === "C3") return "accessibility";
  if (code === "C4") return "location";
  if (code === "C5") return "view";

  const name = criterion.name.trim().toLowerCase();
  if (name.includes("biaya") || name.includes("harga")) return "price";
  if (name.includes("fasilitas") || name.includes("rating")) return "rating";
  if (name.includes("akses")) return "accessibility";
  if (name.includes("jarak")) return "distance";
  if (name.includes("lokasi")) return "location";
  if (name.includes("view")) return "view";

  return "";
}
