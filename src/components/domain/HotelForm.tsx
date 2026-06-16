import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { InputField, TextareaField } from "../ui/FormField";
import type { Hotel, SaveHotelPayload } from "../../types/hotel";

const emptyPayload: SaveHotelPayload = {
  name: "",
  price: 0,
  rating_facility: 0,
  accessibility: 0,
  distance_km: 0,
  location_score: 0,
  view_score: 0,
  description: ""
};

// HotelForm menangani input hotel agar halaman admin tetap ringkas.
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
  const [form, setForm] = useState<SaveHotelPayload>(emptyPayload);

  useEffect(() => {
    if (!initialData) {
      setForm(emptyPayload);
      return;
    }

    setForm({
      name: initialData.name,
      price: initialData.price,
      rating_facility: initialData.rating_facility,
      accessibility: initialData.accessibility,
      distance_km: initialData.distance_km,
      location_score: initialData.location_score,
      view_score: initialData.view_score,
      description: initialData.description
    });
  }, [initialData]);

  // handleSubmit mengirim payload hotel yang sudah dikonversi ke angka.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form);
    if (!initialData) {
      setForm(emptyPayload);
    }
  }

  // updateField memperbarui field form hotel berdasarkan nama input.
  function updateField<K extends keyof SaveHotelPayload>(
    key: K,
    value: SaveHotelPayload[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <InputField
        label="Nama hotel"
        onChange={(event) => updateField("name", event.target.value)}
        required
        value={form.name}
      />
      <InputField
        label="Harga"
        min={1}
        onChange={(event) => updateField("price", Number(event.target.value))}
        required
        type="number"
        value={form.price}
      />
      <InputField
        label="Rating fasilitas"
        max={5}
        min={0}
        onChange={(event) => updateField("rating_facility", Number(event.target.value))}
        required
        step="0.1"
        type="number"
        value={form.rating_facility}
      />
      <InputField
        label="Aksesibilitas"
        max={5}
        min={0}
        onChange={(event) => updateField("accessibility", Number(event.target.value))}
        required
        step="0.1"
        type="number"
        value={form.accessibility}
      />
      <InputField
        label="Jarak km"
        min={0}
        onChange={(event) => updateField("distance_km", Number(event.target.value))}
        required
        step="0.1"
        type="number"
        value={form.distance_km}
      />
      <InputField
        label="Skor lokasi"
        max={5}
        min={0}
        onChange={(event) => updateField("location_score", Number(event.target.value))}
        required
        step="0.1"
        type="number"
        value={form.location_score}
      />
      <InputField
        label="Skor view"
        max={5}
        min={0}
        onChange={(event) => updateField("view_score", Number(event.target.value))}
        required
        step="0.1"
        type="number"
        value={form.view_score}
      />
      <TextareaField
        label="Deskripsi"
        onChange={(event) => updateField("description", event.target.value)}
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
