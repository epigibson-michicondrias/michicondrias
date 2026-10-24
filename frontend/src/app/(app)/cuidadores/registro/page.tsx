"use client";

/**
 * Registro como cuidador (`/cuidadores/registro`).
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
import {
  useSitterRegistration,
  SERVICE_TYPE_OPTIONS,
  HOME_TYPE_OPTIONS,
} from "@/hooks/cuidadores/useSitterRegistration";

export default function RegistroCuidadorPage() {
  const { form, errors, image, saving, updateField, setImage, handleSave } = useSitterRegistration();
  const offersHosting = form.service_type !== "visiting";

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Registrarme como cuidador"
        subtitle="Crea tu perfil y empieza a cuidar mascotas"
        module="cuidadores"
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
            placeholder="CDMX, Coyoacán"
          />
          <FormField
            label="Biografía / Presentación"
            value={form.bio}
            onChangeText={(v) => updateField("bio", v)}
            placeholder="Cuéntanos sobre ti y tu experiencia cuidando gatos y perros..."
            multiline
          />
        </FormSection>

        <FormSection title="Servicio y precios">
          <FormSelect
            label="Tipo de servicio"
            options={SERVICE_TYPE_OPTIONS}
            value={form.service_type}
            onChange={(v) => updateField("service_type", v)}
          />
          {offersHosting && (
            <FormField
              label="Precio por día de hospedaje (MXN)"
              value={form.price_per_day}
              onChangeText={(v) => updateField("price_per_day", v)}
              placeholder="350"
              keyboardType="decimal-pad"
              error={errors.price_per_day}
            />
          )}
          {form.service_type !== "hosting" && (
            <FormField
              label="Precio por visita (MXN)"
              value={form.price_per_visit}
              onChangeText={(v) => updateField("price_per_visit", v)}
              placeholder="200"
              keyboardType="decimal-pad"
              error={errors.price_per_visit}
            />
          )}
          <FormField
            label="Años de experiencia"
            value={form.experience_years}
            onChangeText={(v) => updateField("experience_years", v)}
            placeholder="2"
            keyboardType="numeric"
          />
          <FormField
            label="Máximo de mascotas a la vez"
            value={form.max_pets}
            onChangeText={(v) => updateField("max_pets", v)}
            keyboardType="numeric"
          />
        </FormSection>

        {offersHosting && (
          <FormSection title="Tu hogar">
            <FormSelect
              label="Tipo de vivienda"
              options={HOME_TYPE_OPTIONS}
              value={form.home_type}
              onChange={(v) => updateField("home_type", v)}
            />
            <FormSwitch
              label="Tengo patio o jardín"
              value={form.has_yard}
              onChange={(v) => updateField("has_yard", v)}
            />
          </FormSection>
        )}

        <FormSection title="Acepta">
          <FormSwitch
            label="Gatos"
            value={form.accepts_cats}
            onChange={(v) => updateField("accepts_cats", v)}
            variant="checkbox"
          />
          <FormSwitch
            label="Perros"
            value={form.accepts_dogs}
            onChange={(v) => updateField("accepts_dogs", v)}
            variant="checkbox"
          />
        </FormSection>

        <Button label="Publicar mi perfil de cuidador" onPress={handleSave} loading={saving} disabled={saving} />
      </div>
    </ScreenContainer>
  );
}
