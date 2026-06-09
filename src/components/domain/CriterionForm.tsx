import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { InputField, SelectField } from "../ui/FormField";
import type {
  Criterion,
  CriterionAttribute,
  SaveCriterionPayload
} from "../../types/criterion";

const emptyPayload: SaveCriterionPayload = {
  code: "",
  name: "",
  attribute: "benefit",
  weight: 0
};

// CriterionForm menangani input kriteria dan bobot MOORA.
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
  const [form, setForm] = useState<SaveCriterionPayload>(emptyPayload);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyPayload);
      return;
    }

    setForm({
      code: initialData.code,
      name: initialData.name,
      attribute: initialData.attribute,
      weight: initialData.weight
    });
  }, [initialData]);

  // handleSubmit mengirim payload kriteria yang siap disimpan.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
    if (!initialData) {
      setForm(emptyPayload);
    }
  }

  // updateField memperbarui field form kriteria berdasarkan nama input.
  function updateField<K extends keyof SaveCriterionPayload>(
    key: K,
    value: SaveCriterionPayload[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <InputField
        label="Kode"
        onChange={(event) => updateField("code", event.target.value)}
        required
        value={form.code}
      />
      <InputField
        label="Nama kriteria"
        onChange={(event) => updateField("name", event.target.value)}
        required
        value={form.name}
      />
      <SelectField
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
        label="Bobot"
        min={1}
        onChange={(event) => updateField("weight", Number(event.target.value))}
        required
        step="0.01"
        type="number"
        value={form.weight}
      />
      <div className="form-actions">
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
