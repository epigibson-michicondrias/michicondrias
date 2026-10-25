"use client";

/**
 * Nueva mascota — espejo de `mobile/app/mascotas/nuevo.tsx` (form `PetForm`).
 */
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import PetForm from "@/features/mascotas/PetForm";
import { usePetForm } from "@/hooks/mascotas/usePetForm";

export default function NuevaMascotaPage() {
  const { form, updateField, image, setImageFile, loading, handleSubmit } = usePetForm();

  return (
    <ScreenContainer>
      <ScreenHeader title="Nueva mascota" />
      <PetForm
        form={form}
        updateField={updateField}
        imagePreview={image?.preview ?? null}
        onImageChange={setImageFile}
        submitLabel="Registrar mascota"
        onSubmit={handleSubmit}
        busy={loading}
      />
    </ScreenContainer>
  );
}
