"use client";

/**
 * Editar establecimiento (`/establecimientos/editar/[id]`), rol establecimiento.
 * Espejo de `mobile/app/establecimientos/editar/[id].tsx`.
 */
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import RoleGuard from "@/components/RoleGuard";
import VenueForm from "../../VenueForm";

function EditarEstablecimientoContent() {
  return (
    <ScreenContainer>
      <ScreenHeader
        title="Editar local"
        subtitle="Actualiza la información de tu negocio"
      />
      <VenueForm mode="edit" />
    </ScreenContainer>
  );
}

export default function EditarEstablecimientoPage() {
  return (
    <RoleGuard roles={["establecimiento", "admin"]}>
      <EditarEstablecimientoContent />
    </RoleGuard>
  );
}
