import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { InputField, TextareaField } from "../ui/FormField";
import type { Hotel, SaveHotelPayload } from "../../types/hotel";

type HotelFormState = Record<keyof SaveHotelPayload, string>;
type HotelFormErrors = Partial<Record<keyof SaveHotelPayload, string>>;

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

// HotelForm menangani input manual hotel dan validasi format angka sebelum submit.
export function HotelForm({
  initialData,
  submitting,
  onCancel,
  onSubmit
}: {
  initialData?: Hotel | null;
  submitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: SaveHotelPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState<HotelFormState>(emptyForm);
  const [errors, setErrors] = useState<HotelFormErrors>({});

  useEffect(() => {
    setErrors({});

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
  }, [initialData]);

  // handleSubmit memvalidasi input lalu mengirim payload hotel ke parent page.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateHotelForm(form);
    setErrors(validation.errors);

    if (!validation.payload) {
      return;
    }

    await onSubmit(validation.payload);
    if (!initialData) {
      setForm(emptyForm);
    }
  }

  // updateField memperbarui nilai input manual dan membersihkan error field tersebut.
  function updateField(key: keyof SaveHotelPayload, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
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

// validateHotelForm memastikan harga dan nilai desimal sesuai format backend.
function validateHotelForm(form: HotelFormState): {
  errors: HotelFormErrors;
  payload?: SaveHotelPayload;
} {
  const errors: HotelFormErrors = {};
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
  const distanceKm = parseDecimalRange(
    form.distance_km,
    "Jarak",
    errors,
    "distance_km",
    0
  );
  const locationScore = parseDecimalRange(
    form.location_score,
    "Skor lokasi",
    errors,
    "location_score",
    0,
    5
  );
  const viewScore = parseDecimalRange(
    form.view_score,
    "Skor view",
    errors,
    "view_score",
    0,
    5
  );

  if (!name) {
    errors.name = "Nama hotel wajib diisi.";
  }

  if (!description) {
    errors.description = "Deskripsi wajib diisi.";
  }

  if (Object.values(errors).some(Boolean)) {
    return { errors };
  }

  return {
    errors,
    payload: {
      name,
      price,
      rating_facility: ratingFacility,
      accessibility,
      distance_km: distanceKm,
      location_score: locationScore,
      view_score: viewScore,
      description
    }
  };
}

// parseWholeNumber memvalidasi harga agar hanya berisi angka bulat positif.
function parseWholeNumber(
  value: string,
  label: string,
  errors: HotelFormErrors,
  key: keyof SaveHotelPayload
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
  key: keyof SaveHotelPayload,
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
