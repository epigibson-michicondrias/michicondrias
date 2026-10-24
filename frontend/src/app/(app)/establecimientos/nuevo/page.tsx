"use client";

/**
 * Nuevo establecimiento (`/establecimientos/nuevo`), rol establecimiento.
 * Espejo de `mobile/app/establecimientos/nuevo.tsx`.
 */
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import RoleGuard from "@/components/RoleGuard";
import VenueForm from "../VenueForm";

function NuevoEstablecimientoContent() {
  return (
    <ScreenContainer>
      <ScreenHeader
        title="Nuevo Establecimiento"
        subtitle="Registra tu negocio pet-friendly"
      />
      <VenueForm mode="create" />
    </ScreenContainer>
  );
}

export default function NuevoEstablecimientoPage() {
  return (
    <RoleGuard roles={["establecimiento", "admin"]}>
      <NuevoEstablecimientoContent />
    </RoleGuard>
  );
}
