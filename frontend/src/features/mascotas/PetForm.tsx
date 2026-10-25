"use client";

/**
 * PetForm — formulario común de mascota (alta y edición). Espejo de `mobile/src/features/mascotas/PetForm.tsx`.
 * Toda la validación es inline (`hooks/mascotas/petFormRules`): solo llama a `onSubmit` cuando no hay errores.
 */
import { useState, type FormEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import FormImagePicker from "@/components/forms/FormImagePicker";
import { SPECIES_OPTIONS, GENDER_OPTIONS, type PetFormData } from "@/types/mascotas";
import { validatePetForm, type PetFormErrors } from "@/hooks/mascotas/petFormRules";
import s from "../../app/(app)/pages.module.css";

interface PetFormProps {
  form: PetFormData;
  updateField: (key: keyof PetFormData, value: string | boolean) => void;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  submitLabel: string;
  onSubmit: () => void;
  busy: boolean;
  /** Bloque extra bajo los campos (p. ej. «Eliminar mascota» al editar). */
  children?: ReactNode;
}

export default function PetForm({ form, updateField, imagePreview, onImageChange, submitLabel, onSubmit, busy, children }: PetFormProps) {
  const [errors, setErrors] = useState<PetFormErrors>({});

  /** Al corregir un campo se quita su error. */
  const change = (key: keyof PetFormData, value: string | boolean) => {
    updateField(key, value);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = validatePetForm(form);
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={s.formStack}>
      <FormImagePicker label="Foto" preview={imagePreview} onChange={onImageChange} />

      <FormSection title="Datos básicos">
        <FormField
          label="Nombre *"
          value={form.name}
          onChangeText={(v) => change("name", v)}
          placeholder="Ej. Michi"
          error={errors.name}
        />
        <FormSelect label="Especie" options={SPECIES_OPTIONS} value={form.species} onChange={(v) => change("species", v)} />
        <FormSelect label="Género" options={GENDER_OPTIONS} value={form.gender} onChange={(v) => change("gender", v)} />
        <FormField
          label="Raza"
          value={form.breed}
          onChangeText={(v) => change("breed", v)}
          placeholder="Ej. Siamés (opcional)"
        />
        <div className={s.formRowCompact}>
          <FormField
            label="Edad (años)"
            value={form.age_years}
            onChangeText={(v) => change("age_years", v)}
            placeholder="Ej. 3"
            keyboardType="number-pad"
            error={errors.age_years}
          />
          <FormField
            label="Meses"
            value={form.age_months}
            onChangeText={(v) => change("age_months", v)}
            placeholder="0 a 11"
            keyboardType="number-pad"
            error={errors.age_months}
          />
        </div>
        <FormField
          label="Peso (kg)"
          value={form.weight_kg}
          onChangeText={(v) => change("weight_kg", v)}
          placeholder="Ej. 4.5"
          keyboardType="decimal-pad"
          error={errors.weight_kg}
        />
        <FormField
          label="Sobre tu mascota"
          value={form.description}
          onChangeText={(v) => change("description", v)}
          placeholder="Carácter, manías, lo que le gusta… (opcional)"
          multiline
          numberOfLines={3}
        />
      </FormSection>

      <FormSection title="Salud y registro">
        <FormSwitch label="Esterilizado" value={form.is_sterilized} onChange={(v) => change("is_sterilized", v)} />
        <FormSwitch label="Desparasitado" value={form.is_dewormed} onChange={(v) => change("is_dewormed", v)} />
        <FormField
          label="Microchip"
          value={form.microchip_id}
          onChangeText={(v) => change("microchip_id", v)}
          placeholder="Opcional"
        />
      </FormSection>

      {children}

      <Button type="submit" label={submitLabel} loading={busy} icon={<Check size={20} />} />
    </form>
  );
}
