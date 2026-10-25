"use client";

/**
 * Editar mascota — espejo de `mobile/app/mascotas/editar/[id].tsx`: mismo `PetForm` que el alta y zona de peligro.
 * Con Michi-Tracker activo el backend no deja eliminarla (409): en su lugar se ofrece gestionar la suscripción.
 */
import { useRouter } from "next/navigation";
import { CreditCard, PawPrint, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import PetForm from "@/features/mascotas/PetForm";
import { useEditPet } from "@/hooks/mascotas/useEditPet";
import { useTrackerBilling } from "@/hooks/mascotas/useTrackerBilling";
import { useAuth } from "@/contexts/AuthContext";
import s from "../../mascotas.module.css";

export default function EditarMascotaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { pet, error, form, updateField, image, setImageFile, isLoadingPet, hasTracker, isUpdating, isDeleting, handleUpdate, handleDelete } = useEditPet();
  const { openTrackerBilling, isOpeningBilling } = useTrackerBilling();

  if (isLoadingPet) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Editar mascota" />
        <Skeleton width={96} height={96} borderRadius={999} />
        <Skeleton height={320} borderRadius={16} />
        <Skeleton height={180} borderRadius={16} />
      </ScreenContainer>
    );
  }

  // Solo el dueño edita (el backend devuelve 403 a los demás): sin mascota o ajena, salida clara
  if (error || !pet || pet.owner_id !== user?.id) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Editar mascota" />
        <EmptyState
          icon={<PawPrint size={28} />}
          title="No puedes editar esta mascota"
          subtitle="Solo su dueño puede cambiar sus datos."
          actionLabel="Ver mis mascotas"
          onAction={() => router.replace("/mascotas")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Editar mascota" />
      <PetForm
        form={form}
        updateField={updateField}
        imagePreview={image?.preview ?? null}
        onImageChange={setImageFile}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
        busy={isUpdating}
      >
        <section className={s.dangerCard} aria-labelledby="danger-title">
          <h2 id="danger-title" className={s.dangerTitle}>Eliminar mascota</h2>
          <p className={s.dangerText}>
            {hasTracker
              ? "Tiene Michi-Tracker Pro activo. Cancela la suscripción en Facturación y después podrás eliminarla."
              : "Dejará de aparecer en tu lista. Su carnet y sus citas se conservan."}
          </p>
          {hasTracker ? (
            <Button
              label="Gestionar suscripción"
              variant="secondary"
              icon={<CreditCard size={18} />}
              onPress={openTrackerBilling}
              loading={isOpeningBilling}
            />
          ) : (
            <Button
              label="Eliminar mascota"
              variant="danger"
              icon={<Trash2 size={18} />}
              onPress={handleDelete}
              loading={isDeleting}
              disabled={isUpdating}
            />
          )}
        </section>
      </PetForm>
    </ScreenContainer>
  );
}
