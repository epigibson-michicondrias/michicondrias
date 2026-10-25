"use client";

/**
 * Ficha de mascota (web). Misma lógica que `mobile/app/mascotas/[id].tsx` (pestañas Resumen · Salud · Historial,
 * `?tab=salud|historial`, aviso de Stripe), con composición de escritorio: hero ancho con las acciones, pestañas
 * subrayadas y contenido a dos columnas (principal + panel lateral). Secciones en `features/mascotas/PetDetailSections`.
 */
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, HeartPulse, LayoutGrid, PawPrint } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import { showAlert } from "@/components/AppAlert";
import { usePetDetail, type PetTab } from "@/hooks/mascotas/usePetDetail";
import { usePetHealth } from "@/hooks/carnet/usePetHealth";
import { copyText } from "@/utils/helpers";
import { PetHero, PetSummary, PetHealth } from "@/features/mascotas/PetDetailSections";
import { PetHistoryPanel } from "@/features/mascotas/PetHistoryPanel";
import d from "@/features/mascotas/PetDetail.module.css";
import s from "../mascotas.module.css";

function PetDetailContent() {
  const detail = usePetDetail();
  const { pet, isOwner, isLoading, error, tab, setTab, openShare, shareUrl, closeShare } = detail;
  const router = useRouter();
  const health = usePetHealth(pet?.id, pet, tab === "salud" ? "salud" : tab === "historial" ? "historial" : null);

  if (isLoading) {
    return (
      <ScreenContainer>
        <Skeleton height={200} borderRadius={24} />
        <Skeleton height={44} width="40%" />
        <div className={d.columns}>
          <Skeleton height={280} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </div>
      </ScreenContainer>
    );
  }

  if (error || !pet) {
    const status = (error as { status?: number } | null)?.status;
    const title =
      status === 403 ? "No tienes acceso a esta mascota" : status === 404 ? "Esta mascota ya no existe" : "No pudimos cargar a tu mascota";
    const subtitle =
      status === 403
        ? "Solo su dueño o un profesional autorizado puede verla."
        : status === 404
          ? "Puede que la hayan eliminado."
          : "Revisa tu conexión e inténtalo de nuevo.";
    const retry = status !== 403 && status !== 404;
    return (
      <ScreenContainer>
        <EmptyState
          icon={<PawPrint size={28} />}
          title={title}
          subtitle={subtitle}
          actionLabel={retry ? "Reintentar" : "Ver mis mascotas"}
          onAction={() => (retry ? detail.refetch() : router.replace("/mascotas"))}
        />
      </ScreenContainer>
    );
  }

  const tabs: { value: PetTab; label: string; icon: typeof LayoutGrid; count?: number }[] = [
    { value: "resumen", label: "Resumen", icon: LayoutGrid },
    { value: "salud", label: "Salud", icon: HeartPulse, count: health.loadingVaccines ? undefined : health.vaccines.length },
    { value: "historial", label: "Historial", icon: ClipboardList, count: tab === "historial" && !health.loadingRecords ? health.records.length : undefined },
  ];

  return (
    <ScreenContainer>
      <PetHero pet={pet} isOwner={isOwner} health={health} onShare={openShare} />

      <div className={d.tabsWrap}>
        <Tabs value={tab} onChange={setTab} options={tabs} accessibilityLabel={`Secciones de ${pet.name}`} />
      </div>

      {tab === "resumen" && <PetSummary pet={pet} isOwner={isOwner} health={health} detail={detail} onOpenTab={setTab} />}
      {tab === "salud" && <PetHealth pet={pet} health={health} />}
      {tab === "historial" && <PetHistoryPanel pet={pet} health={health} />}

      {shareUrl && (
        <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-label={`Carnet de ${pet.name}`}>
          <div className={s.modal}>
            <h2 className={s.modalTitle}>Carnet de {pet.name}</h2>
            <p className={s.modalText}>Quien abra el enlace verá el pasaporte. El enlace dura 24 horas.</p>
            <p className={s.shareUrl}>{shareUrl}</p>
            <div className={s.modalActions}>
              <Button
                label="Copiar enlace"
                onPress={async () => {
                  const ok = await copyText(shareUrl);
                  showAlert({
                    type: ok ? "success" : "error",
                    title: ok ? "Enlace copiado" : "No se pudo copiar",
                    message: ok ? "Pégalo donde quieras." : "Inténtalo de nuevo.",
                  });
                }}
              />
              <Button label="Cerrar" variant="secondary" onPress={closeShare} />
            </div>
          </div>
        </div>
      )}
    </ScreenContainer>
  );
}

export default function PetDetailPage() {
  return (
    <Suspense fallback={null}>
      <PetDetailContent />
    </Suspense>
  );
}
