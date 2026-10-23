"use client";

/**
 * Notificaciones — espejo de `mobile/app/notificaciones.tsx`. W4 porta la lista completa
 * con `resolveNotificationRoute` y marcar como leídas.
 */
import { Bell } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";

export default function NotificacionesPage() {
  return (
    <ScreenContainer>
      <ScreenHeader title="Notificaciones" />
      <EmptyState
        icon={<Bell size={28} />}
        title="Muy pronto"
        subtitle="El centro de notificaciones llega con la portada del módulo. Mientras tanto, los avisos importantes llegan a tu correo."
      />
    </ScreenContainer>
  );
}
