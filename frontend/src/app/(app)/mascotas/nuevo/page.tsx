"use client";

/**
 * Nueva mascota — espejo de `mobile/app/mascotas/nuevo.tsx` (form `PetForm`).
 */
import { useState } from "react";
import { Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import FormImagePicker from "@/components/forms/FormImagePicker";
import { usePetForm } from "@/hooks/mascotas/usePetForm";
import s from "../../pages.module.css";

const SPECIES_OPTIONS = [
  { label: "Perro", value: "perro" },
  { label: "Gato", value: "gato" },
  { label: "Otro", value: "otro" },
];

const GENDER_OPTIONS = [
  { label: "Macho", value: "macho" },
  { label: "Hembra", value: "hembra" },
];

export default function NuevaMascotaPage() {
  const { form, updateField, image, setImageFile, loading, handleSubmit } = usePetForm();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameError = touched.name && !form.name.trim() ? "El nombre es obligatorio" : null;
  const breedError = touched.breed && !form.breed.trim() ? "La raza es obligatoria" : null;
  const descError = touched.description && !form.description.trim() ? "La descripción es obligatoria" : null;

  return (
    <ScreenContainer>
      <ScreenHeader title="Nueva Mascota" />

      <FormImagePicker
        label="Foto"
        preview={image?.preview ?? null}
        onChange={setImageFile}
      />

      <FormSection title="Información básica">
        <FormField
          label="Nombre *"
          value={form.name}
          onChangeText={(v) => updateField("name", v)}
          placeholder="Ej. Firulais"
          error={nameError}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
        />
        <FormSelect
          label="Especie *"
          options={SPECIES_OPTIONS}
          value={form.species}
          onChange={(v) => updateField("species", v)}
        />
        <FormSelect
          label="Género"
          options={GENDER_OPTIONS}
          value={form.gender}
          onChange={(v) => updateField("gender", v)}
        />
        <FormField
          label="Raza *"
          value={form.breed}
          onChangeText={(v) => updateField("breed", v)}
          placeholder="Ej. Husky Siberiano"
          error={breedError}
          onBlur={() => setTouched((t) => ({ ...t, breed: true }))}
        />
        <div className={s.formRow}>
          <FormField
            label="Edad (meses)"
            value={form.age_months}
            onChangeText={(v) => updateField("age_months", v)}
            placeholder="Ej. 24"
            keyboardType="number-pad"
          />
          <FormField
            label="Peso (kg)"
            value={form.weight_kg}
            onChangeText={(v) => updateField("weight_kg", v)}
            placeholder="Ej. 12.5"
            keyboardType="decimal-pad"
          />
        </div>
        <FormField
          label="Descripción *"
          value={form.description}
          onChangeText={(v) => updateField("description", v)}
          placeholder="Cuéntanos un poco de tu mascota..."
          multiline
          numberOfLines={3}
          error={descError}
          onBlur={() => setTouched((t) => ({ ...t, description: true }))}
        />
      </FormSection>

      <FormSection title="Salud y registro">
        <FormSwitch
          label="Vacunado"
          value={form.is_vaccinated}
          onChange={(v) => updateField("is_vaccinated", v)}
        />
        <FormSwitch
          label="Esterilizado"
          value={form.is_sterilized}
          onChange={(v) => updateField("is_sterilized", v)}
        />
        <FormSwitch
          label="Desparasitado"
          value={form.is_dewormed}
          onChange={(v) => updateField("is_dewormed", v)}
        />
        <FormField
          label="Microchip"
          value={form.microchip_id}
          onChangeText={(v) => updateField("microchip_id", v)}
          placeholder="Opcional"
        />
      </FormSection>

      <Button
        label={loading ? "Guardando…" : "Registrar Mascota"}
        onPress={handleSubmit}
        loading={loading}
        icon={<Check size={20} />}
        accessibilityLabel="Registrar Mascota"
      />
    </ScreenContainer>
  );
}
