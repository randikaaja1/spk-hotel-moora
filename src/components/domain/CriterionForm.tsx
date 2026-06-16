import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { InputField, SelectField } from "../ui/FormField";
import type {
  Criterion,
  CriterionAttribute,
  SaveCriterionPayload
} from "../../types/criterion";

type CriterionFormState = {
  code: string;
  name: string;
  attribute: CriterionAttribute;
  weight: string;
};

type CriterionFormErrors = Partial<Record<keyof SaveCriterionPayload, string>>;

const emptyForm: CriterionFormState = {
  code: "",
  name: "",
  attribute: "benefit",
  weight: ""
};

// CriterionForm menangani input kriteria dan validasi bobot MOORA.
export function CriterionForm({
  initialData,
  submitting,
  onCancel,
  onSubmit
}: {
  initialData?: Criterion | null;
  submitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: SaveCriterionPayload) => Promise<void> | void;
}) {
  const [form, setForm] = useState<CriterionFormState>(emptyForm);
  const [errors, setErrors] = useState<CriterionFormErrors>({});

  useEffect(() => {
    setErrors({});

    if (!initialData) {
      setForm(emptyForm);
      return;
    }

    setForm({
      code: initialData.code,
      name: initialData.name,
      attribute: initialData.attribute,
      weight: String(initialData.weight)
    });
  }, [initialData]);

  // handleSubmit memvalidasi input lalu mengirim payload kriteria ke parent page.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateCriterionForm(form);
    setErrors(validation.errors);

    if (!validation.payload) {
      return;
    }

    await onSubmit(validation.payload);
    if (!initialData) {
      setForm(emptyForm);
    }
  }

  // updateField memperbarui nilai form dan menghapus error field terkait.
  function updateField<K extends keyof CriterionFormState>(
    key: K,
    value: CriterionFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <InputField
        error={errors.code}
        hint="Contoh: C1, C2, C3. Gunakan huruf dan angka tanpa spasi."
        label="Kode"
        onChange={(event) => updateField("code", event.target.value.toUpperCase())}
        placeholder="C1"
        required
        value={form.code}
      />
      <InputField
        error={errors.name}
        hint="Contoh: Harga, Fasilitas, Aksesibilitas, Lokasi, View."
        label="Nama kriteria"
        onChange={(event) => updateField("name", event.target.value)}
        placeholder="Nama kriteria"
        required
        value={form.name}
      />
      <SelectField
        error={errors.attribute}
        hint="Benefit untuk nilai yang makin besar makin baik, cost untuk nilai yang makin kecil makin baik."
        label="Atribut"
        onChange={(event) =>
          updateField("attribute", event.target.value as CriterionAttribute)
        }
        required
        value={form.attribute}
      >
        <option value="benefit">Benefit</option>
        <option value="cost">Cost</option>
      </SelectField>
      <InputField
        error={errors.weight}
        hint="Contoh: 5 atau 2.5. Bobot harus lebih besar dari 0."
        inputMode="decimal"
        label="Bobot"
        onChange={(event) => updateField("weight", event.target.value)}
        placeholder="5"
        required
        value={form.weight}
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

// validateCriterionForm memastikan kode, atribut, dan bobot siap dikirim ke backend.
function validateCriterionForm(form: CriterionFormState): {
  errors: CriterionFormErrors;
  payload?: SaveCriterionPayload;
} {
  const errors: CriterionFormErrors = {};
  const code = form.code.trim().toUpperCase();
  const name = form.name.trim();
  const weight = parseWeight(form.weight, errors);

  if (!code) {
    errors.code = "Kode wajib diisi.";
  } else if (!/^[A-Z0-9]+$/.test(code)) {
    errors.code = "Kode hanya boleh berisi huruf dan angka tanpa spasi.";
  }

  if (!name) {
    errors.name = "Nama kriteria wajib diisi.";
  }

  if (form.attribute !== "benefit" && form.attribute !== "cost") {
    errors.attribute = "Atribut kriteria tidak valid.";
  }

  if (Object.values(errors).some(Boolean)) {
    return { errors };
  }

  return {
    errors,
    payload: {
      code,
      name,
      attribute: form.attribute,
      weight
    }
  };
}

// parseWeight memvalidasi bobot agar berupa angka positif dengan titik desimal.
function parseWeight(value: string, errors: CriterionFormErrors) {
  const normalized = value.trim();

  if (!normalized) {
    errors.weight = "Bobot wajib diisi.";
    return 0;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    errors.weight = "Bobot harus angka valid, contoh 5 atau 2.5.";
    return 0;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    errors.weight = "Bobot harus lebih besar dari 0.";
    return 0;
  }

  return parsed;
}
