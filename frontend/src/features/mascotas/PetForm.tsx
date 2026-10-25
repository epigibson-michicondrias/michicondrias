"use client";

/**
 * PetForm — formulario común de mascota (alta y edición), diseñado para web: a dos columnas en escritorio, con la
 * foto y una vista previa fija a la izquierda y la barra de acciones pegada al pie. Misma lógica que la app
 * (`hooks/mascotas/petFormRules`): validación inline y `onSubmit` solo sin errores.
 */
import { useState, type FormEvent, type ReactNode } from "react";
import { Cat, Check, Dog } from "lucide-react";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import FormImagePicker from "@/components/forms/FormImagePicker";
import FormActionsBar from "@/components/forms/FormActionsBar";
import { SPECIES_OPTIONS, GENDER_OPTIONS, type PetFormData } from "@/types/mascotas";
import { validatePetForm, type PetFormErrors } from "@/hooks/mascotas/petFormRules";
import s from "./PetForm.module.css";

interface PetFormProps {
  form: PetFormData;
  updateField: (key: keyof PetFormData, value: string | boolean) => void;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
  busy: boolean;
  /** Bloque extra al final de la columna principal (p. ej. «Eliminar mascota» al editar). */
  children?: ReactNode;
}

/** «3 años y 2 meses» a partir de los campos del formulario (sin validar: solo para la vista previa). */
function agePreview(years: string, months: string): string | null {
  const y = parseInt(years, 10) || 0;
  const m = parseInt(months, 10) || 0;
  if (!y && !m) return null;
  return [y ? `${y} ${y === 1 ? "año" : "años"}` : null, m ? `${m} ${m === 1 ? "mes" : "meses"}` : null].filter(Boolean).join(" y ");
}

export default function PetForm({ form, updateField, imagePreview, onImageChange, submitLabel, onSubmit, onCancel, busy, children }: PetFormProps) {
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

  const SpeciesIcon = form.species === "perro" ? Dog : Cat;
  const facts = [
    agePreview(form.age_years, form.age_months),
    form.weight_kg.trim() ? `${form.weight_kg.trim()} kg` : null,
  ].filter(Boolean);

  return (
    <form onSubmit={handleSubmit} noValidate className={s.form}>
      <div className={s.layout}>
        {/* Columna fija: foto + cómo se verá la ficha */}
        <aside className={s.aside} aria-label="Vista previa">
          <div className={s.previewCard}>
            <FormImagePicker label="Foto" preview={imagePreview} onChange={onImageChange} />
            <div className={s.previewBody}>
              <p className={s.previewName}>{form.name.trim() || "Tu mascota"}</p>
              <p className={s.previewMeta}>
                <SpeciesIcon size={16} aria-hidden />
                {[form.species === "perro" ? "Perro" : "Gato", form.gender === "hembra" ? "Hembra" : "Macho", form.breed.trim() || null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {facts.length > 0 && (
                <div className={s.previewFacts}>
                  {facts.map((f) => <span key={f} className={s.fact}>{f}</span>)}
                </div>
              )}
            </div>
          </div>
          <p className={s.hint}>Solo el nombre es obligatorio. Lo demás lo puedes completar después; las vacunas se registran en su carnet.</p>
        </aside>

        <div className={s.main}>
          <FormSection title="Datos básicos">
            <div className={s.grid2}>
              <FormField label="Nombre *" value={form.name} onChangeText={(v) => change("name", v)} placeholder="Ej. Michi" error={errors.name} />
              <FormField label="Raza" value={form.breed} onChangeText={(v) => change("breed", v)} placeholder="Ej. Siamés" hint="Opcional" />
              <FormSelect label="Especie" options={SPECIES_OPTIONS} value={form.species} onChange={(v) => change("species", v)} />
              <FormSelect label="Género" options={GENDER_OPTIONS} value={form.gender} onChange={(v) => change("gender", v)} />
            </div>
          </FormSection>

          <FormSection title="Edad y peso">
            <div className={s.grid3}>
              <FormField label="Años" value={form.age_years} onChangeText={(v) => change("age_years", v)} placeholder="Ej. 3" keyboardType="number-pad" error={errors.age_years} />
              <FormField label="Meses" value={form.age_months} onChangeText={(v) => change("age_months", v)} placeholder="0 a 11" keyboardType="number-pad" error={errors.age_months} />
              <FormField label="Peso (kg)" value={form.weight_kg} onChangeText={(v) => change("weight_kg", v)} placeholder="Ej. 4.5" keyboardType="decimal-pad" error={errors.weight_kg} />
            </div>
          </FormSection>

          <FormSection title="Sobre tu mascota">
            <FormField
              label="Descripción"
              value={form.description}
              onChangeText={(v) => change("description", v)}
              placeholder="Carácter, manías, lo que le gusta…"
              hint="Opcional · aparece en su ficha"
              multiline
              numberOfLines={4}
            />
          </FormSection>

          <FormSection title="Salud y registro">
            <div className={s.grid2}>
              <FormSwitch label="Esterilizado" value={form.is_sterilized} onChange={(v) => change("is_sterilized", v)} />
              <FormSwitch label="Desparasitado" value={form.is_dewormed} onChange={(v) => change("is_dewormed", v)} />
            </div>
            <FormField label="Microchip" value={form.microchip_id} onChangeText={(v) => change("microchip_id", v)} placeholder="Número del chip" hint="Opcional" />
          </FormSection>

          {children}
        </div>
      </div>

      <FormActionsBar submitLabel={submitLabel} busy={busy} onCancel={onCancel} icon={<Check size={18} />} note="* Obligatorio" />
    </form>
  );
}
