"use client";

/**
 * Publicar mascota en adopción (`/adopciones/nuevo`). Espejo de `mobile/app/adopciones/nuevo.tsx`.
 * Acepta `?editId=` para editar una publicación existente.
 */
import { Suspense, useState } from "react";
import { Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import FormImagePicker from "@/components/forms/FormImagePicker";
import { useListingForm } from "@/hooks/adopciones/useListingForm";
import local from "@/features/adopciones/adopciones.module.css";

const SPECIES_OPTIONS = [
  { label: "Perro", value: "perro" },
  { label: "Gato", value: "gato" },
  { label: "Otro", value: "otro" },
];

const GENDER_OPTIONS = [
  { label: "Macho", value: "macho" },
  { label: "Hembra", value: "hembra" },
];

const SIZE_OPTIONS = [
  { label: "Pequeño", value: "pequeño" },
  { label: "Mediano", value: "mediano" },
  { label: "Grande", value: "grande" },
];

const ENERGY_OPTIONS = [
  { label: "Baja", value: "Baja" },
  { label: "Media", value: "Media" },
  { label: "Alta", value: "Alta" },
];

function NuevoContent() {
  const { form, image, loading, errors, isEditing, updateField, toggleField, setImageFile, handleSave } =
    useListingForm();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameError = touched.name && !form.name.trim() ? "Escribe su nombre." : errors.name;
  const ageError = touched.age_months ? errors.age_months : null;
  const locationError = touched.location && !form.location.trim() ? "Indica la ciudad o zona donde está." : errors.location;

  return (
    <ScreenContainer>
      <ScreenHeader title={isEditing ? "Editar publicación" : "Dar en adopción"} />

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
          horizontal
        />
        <FormField
          label="Raza"
          value={form.breed}
          onChangeText={(v) => updateField("breed", v)}
          placeholder="Ej. Mestizo, Husky..."
        />
        <div className={local.formRow}>
          <FormField
            label="Edad (meses)"
            value={form.age_months}
            onChangeText={(v) => updateField("age_months", v)}
            placeholder="Ej. 24"
            keyboardType="number-pad"
            error={ageError}
            onBlur={() => setTouched((t) => ({ ...t, age_months: true }))}
          />
          <FormField
            label="Ubicación *"
            value={form.location}
            onChangeText={(v) => updateField("location", v)}
            placeholder="Ciudad o zona"
            error={locationError}
            onBlur={() => setTouched((t) => ({ ...t, location: true }))}
          />
        </div>
        <FormSelect
          label="Tamaño"
          options={SIZE_OPTIONS}
          value={form.size}
          onChange={(v) => updateField("size", v)}
          horizontal
        />
        <FormField
          label="Descripción"
          value={form.description}
          onChangeText={(v) => updateField("description", v)}
          placeholder="Cuéntanos su historia, personalidad..."
          multiline
          numberOfLines={3}
        />
      </FormSection>

      <FormSection title="Salud">
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
        <FormSwitch
          label="Caso urgente"
          value={form.is_emergency}
          onChange={(v) => updateField("is_emergency", v)}
          description="Necesita hogar lo antes posible"
        />
      </FormSection>

      <FormSection title="Convivencia">
        <FormSwitch
          label="Convive con gatos"
          value={form.social_cats}
          onChange={(v) => updateField("social_cats", v)}
        />
        <FormSwitch
          label="Convive con perros"
          value={form.social_dogs}
          onChange={(v) => updateField("social_dogs", v)}
        />
        <FormSwitch
          label="Convive con niños"
          value={form.social_children}
          onChange={(v) => updateField("social_children", v)}
        />
        <FormField
          label="Temperamento"
          value={form.temperament}
          onChangeText={(v) => updateField("temperament", v)}
          placeholder="Ej. Juguetón, tranquilo..."
        />
        <FormSelect
          label="Nivel de energía"
          options={ENERGY_OPTIONS}
          value={form.energy_level}
          onChange={(v) => updateField("energy_level", v)}
          horizontal
        />
      </FormSection>

      <Button
        label={loading ? "Guardando…" : isEditing ? "Guardar cambios" : "Publicar en adopción"}
        onPress={handleSave}
        loading={loading}
        icon={<Check size={20} />}
        accessibilityLabel={isEditing ? "Guardar cambios" : "Publicar en adopción"}
      />
    </ScreenContainer>
  );
}

export default function NuevoAdopcionPage() {
  return (
    <Suspense fallback={<ScreenContainer><ScreenHeader title="Dar en adopción" /></ScreenContainer>}>
      <NuevoContent />
    </Suspense>
  );
}
