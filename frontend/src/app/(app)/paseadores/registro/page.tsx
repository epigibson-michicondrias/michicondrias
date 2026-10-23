"use client";

/**
 * Registro como paseador (`/paseadores/registro`).
 * Espejo del formulario legacy con el design system del espejo web.
 */
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSelect from "@/components/forms/FormSelect";
import FormSwitch from "@/components/forms/FormSwitch";
import FormImagePicker from "@/components/forms/FormImagePicker";
import { useWalkerRegistration, SCHEDULE_OPTIONS } from "@/hooks/paseadores/useWalkerRegistration";

export default function RegistroPaseadorPage() {
  const { form, errors, image, saving, updateField, setImage, handleSave } = useWalkerRegistration();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Registrarme como paseador"
        subtitle="Crea tu perfil y empieza a ofrecer paseos"
        module="paseadores"
      />

      <FormImagePicker
        label="Foto de perfil"
        preview={image ? URL.createObjectURL(image) : null}
        onChange={setImage}
      />

      <div style={{ display: "grid", gap: "var(--space-xxl)", paddingBottom: "var(--space-xxl)" }}>
        <FormSection title="Información personal">
          <FormField
            label="Nombre para mostrar *"
            value={form.display_name}
            onChangeText={(v) => updateField("display_name", v)}
            placeholder="Tu nombre público"
            error={errors.display_name}
          />
          <FormField
            label="Ubicación"
            value={form.location}
            onChangeText={(v) => updateField("location", v)}
            placeholder="CDMX, Polanco"
          />
          <FormField
            label="Biografía / Presentación"
            value={form.bio}
            onChangeText={(v) => updateField("bio", v)}
            placeholder="Cuéntanos sobre ti y tu experiencia con mascotas..."
            multiline
          />
        </FormSection>

        <FormSection title="Precios y servicio">
          <FormField
            label="Precio por paseo (MXN)"
            value={form.price_per_walk}
            onChangeText={(v) => updateField("price_per_walk", v)}
            placeholder="150"
            keyboardType="decimal-pad"
            error={errors.price_per_walk}
          />
          <FormField
            label="Precio por hora (MXN)"
            value={form.price_per_hour}
            onChangeText={(v) => updateField("price_per_hour", v)}
            placeholder="100"
            keyboardType="decimal-pad"
            error={errors.price_per_hour}
          />
          <FormField
            label="Años de experiencia"
            value={form.experience_years}
            onChangeText={(v) => updateField("experience_years", v)}
            placeholder="2"
            keyboardType="numeric"
          />
          <FormField
            label="Máximo de mascotas por paseo"
            value={form.max_pets_per_walk}
            onChangeText={(v) => updateField("max_pets_per_walk", v)}
            keyboardType="numeric"
          />
          <FormField
            label="Radio de servicio (km)"
            value={form.service_radius_km}
            onChangeText={(v) => updateField("service_radius_km", v)}
            keyboardType="decimal-pad"
          />
          <FormSelect
            label="Horario preferido"
            options={SCHEDULE_OPTIONS}
            value={form.schedule_preference}
            onChange={(v) => updateField("schedule_preference", v)}
          />
        </FormSection>

        <FormSection title="Acepta">
          <FormSwitch
            label="Perros"
            value={form.accepts_dogs}
            onChange={(v) => updateField("accepts_dogs", v)}
            variant="checkbox"
          />
          <FormSwitch
            label="Gatos"
            value={form.accepts_cats}
            onChange={(v) => updateField("accepts_cats", v)}
            variant="checkbox"
          />
        </FormSection>

        <Button label="Publicar mi perfil de paseador" onPress={handleSave} loading={saving} disabled={saving} />
      </div>
    </ScreenContainer>
  );
}
