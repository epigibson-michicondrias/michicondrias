"use client";

/**
 * Datos personales — espejo de `mobile/app/perfil/editar.tsx`.
 */
import { Check } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useProfile, BIO_MAX } from "@/hooks/perfil/useProfile";

export default function EditarPerfilPage() {
  const { formData, errors, updateField, isLoading, handleSave, isSaving } = useProfile();

  return (
    <ScreenContainer>
      <ScreenHeader title="Datos personales" />

      {isLoading ? (
        <>
          <Skeleton height={48} borderRadius={12} />
          <Skeleton height={48} borderRadius={12} />
          <Skeleton height={48} borderRadius={12} />
          <Skeleton height={96} borderRadius={12} />
        </>
      ) : (
        <>
          <FormSection title="Tus datos">
            <FormField
              label="Nombre completo"
              value={formData.full_name}
              onChangeText={(v) => updateField("full_name", v)}
              error={errors.full_name}
            />
            <FormField
              label="Correo electrónico"
              value={formData.email}
              onChangeText={() => {}}
              editable={false}
              hint="Es tu acceso a la cuenta; no se puede cambiar desde la app."
            />
            <FormField
              label="Teléfono (opcional)"
              value={formData.phone}
              onChangeText={(v) => updateField("phone", v)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <FormField
              label="Ubicación (opcional)"
              value={formData.location}
              onChangeText={(v) => updateField("location", v)}
            />
            <FormField
              label={`Sobre mí (opcional) · ${formData.bio.length}/${BIO_MAX}`}
              value={formData.bio}
              onChangeText={(v) => updateField("bio", v)}
              multiline
              numberOfLines={3}
              error={errors.bio}
            />
          </FormSection>

          <Button
            label={isSaving ? "Guardando…" : "Guardar cambios"}
            onPress={handleSave}
            loading={isSaving}
            icon={<Check size={20} />}
          />
        </>
      )}
    </ScreenContainer>
  );
}
