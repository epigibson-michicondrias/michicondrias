"use client";

/**
 * Ficha de mascota — espejo de `mobile/app/mascotas/[id].tsx`. Pestañas Resumen · Salud · Historial
 * (`?tab=salud|historial` como en la app). El detalle de carnet completo se porta con el módulo carnet.
 */
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutGrid,
  PawPrint,
  Plus,
  Share2,
  ShieldCheck,
  Syringe,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import Button from "@/components/Button";
import ListRow from "@/components/ListRow";
import SectionHeader from "@/components/SectionHeader";
import SegmentedControl from "@/components/SegmentedControl";
import { showAlert } from "@/components/AppAlert";
import { usePetDetail, type PetTab } from "@/hooks/mascotas/usePetDetail";
import { usePetHealth } from "@/hooks/carnet/usePetHealth";
import { copyText } from "@/utils/helpers";
import { ItemActions, RecordItem, VaccineItem } from "@/features/carnet/CarnetItems";
import { formatDate } from "@/utils/formatters";
import s from "../mascotas.module.css";

function formatAge(months: number | null): string {
  if (months == null || months < 0) return "—";
  if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "año" : "años"}`;
}

const TABS: { value: PetTab; label: string; icon: typeof LayoutGrid }[] = [
  { value: "resumen", label: "Resumen", icon: LayoutGrid },
  { value: "salud", label: "Salud", icon: HeartPulse },
  { value: "historial", label: "Historial", icon: ClipboardList },
];

function PetDetailContent() {
  const {
    pet,
    isOwner,
    isLoading,
    error,
    tab,
    setTab,
    openShare,
    shareUrl,
    closeShare,
    handleSubscribeMichiTracker,
    isSubscribing,
    openTrackerBilling,
    isOpeningBilling,
  } = usePetDetail();
  const router = useRouter();
  const health = usePetHealth(pet?.id, pet, tab === "salud" ? "salud" : tab === "historial" ? "historial" : null);

  if (isLoading) {
    return (
      <ScreenContainer>
        <Skeleton height={220} borderRadius={16} />
        <Skeleton height={28} width="50%" />
        <Skeleton height={44} borderRadius={12} />
        <Skeleton height={120} borderRadius={16} />
      </ScreenContainer>
    );
  }

  if (error || !pet) {
    const status = (error as { status?: number } | null)?.status;
    const title =
      status === 403
        ? "No tienes acceso a esta mascota"
        : status === 404
          ? "Esta mascota ya no existe"
          : "No pudimos cargar a tu mascota";
    const subtitle =
      status === 403
        ? "Solo su dueño o un profesional autorizado puede verla."
        : status === 404
          ? "Puede que la hayan eliminado."
          : "Revisa tu conexión e inténtalo de nuevo.";
    return (
      <ScreenContainer>
        <EmptyState
          icon={<PawPrint size={28} />}
          title={title}
          subtitle={subtitle}
          actionLabel={status === 404 ? "Ver mis mascotas" : "Reintentar"}
          onAction={() => (status === 404 ? router.replace("/mascotas") : window.location.reload())}
        />
      </ScreenContainer>
    );
  }

  const vaccinesLabel =
    health.vaccinesStatus === "al-dia" ? "Al día" : health.vaccinesStatus === "vencido" ? "Vencido" : "Sin vacunas";

  return (
    <ScreenContainer>
      <div className={s.detailTop}>
        <button type="button" className={s.backBtn} onClick={() => router.back()} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        {isOwner && (
          <div className={s.topActions}>
            <button type="button" className={s.iconAction} onClick={openShare} aria-label="Compartir carnet">
              <Share2 size={20} />
            </button>
          </div>
        )}
      </div>

      <div className={s.detailLayout}>
      <div className={s.detailSide}>
      <div className={s.hero}>
        {pet.photo_url ? (
          <Image src={pet.photo_url} alt={pet.name} width={148} height={148} className={s.heroPhotoBig} />
        ) : (
          <div className={s.heroPhotoFallbackBig}><PawPrint size={56} /></div>
        )}
        <h1 className={s.heroName}>{pet.name}</h1>
        <p className={s.heroMeta}>
          {[pet.breed, pet.gender === "hembra" ? "Hembra" : pet.gender === "macho" ? "Macho" : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {/* Badges: especie, edad y tracker — escaneables de un vistazo */}
        <div className={s.heroBadgeRow}>
          {pet.species && (
            <span className={s.heroBadge}>{pet.species}</span>
          )}
          {pet.age_months != null && (
            <span className={s.heroBadge}>{formatAge(pet.age_months)}</span>
          )}
          {pet.has_active_subscription && (
            <span className={`${s.heroBadge} ${s.heroBadgeOn}`}>Michi-Tracker</span>
          )}
        </div>
      </div>

      {/* Acciones rápidas del dueño */}
      {isOwner && (
        <div className={s.quickActions}>
          <Button
            label="Agregar vacuna"
            variant="secondary"
            fullWidth={false}
            onPress={() => router.push(`/carnet/nueva-vacuna?pet_id=${pet.id}`)}
          />
          <Button
            label="Agregar consulta"
            variant="secondary"
            fullWidth={false}
            onPress={() => router.push(`/carnet/nueva-consulta?pet_id=${pet.id}`)}
          />
          <Button
            label="Compartir carnet"
            variant="ghost"
            fullWidth={false}
            onPress={openShare}
          />
        </div>
      )}

      </div>

      <div className={s.detailMain}>
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={TABS.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
        accessibilityLabel="Secciones de la ficha"
      />

      {tab === "resumen" && (
        <>
          {/* Stats como tarjetas con ícono */}
          <div className={s.statGridVisual}>
            <div className={s.statCard}>
              <span className={s.statIcon}><CalendarDays size={20} /></span>
              <div>
                <p className={s.statCardValue}>{formatAge(pet.age_months)}</p>
                <p className={s.statCardLabel}>Edad</p>
              </div>
            </div>
            <div className={s.statCard}>
              <span className={s.statIcon}><Activity size={20} /></span>
              <div>
                <p className={s.statCardValue}>{pet.weight_kg ? `${pet.weight_kg} kg` : "—"}</p>
                <p className={s.statCardLabel}>Peso</p>
              </div>
            </div>
            <div className={s.statCard}>
              <span className={s.statIcon}><ShieldCheck size={20} /></span>
              <div>
                <p className={`${s.statCardValue} ${health.vaccinesStatus === "al-dia" ? s.statOk : health.vaccinesStatus === "vencido" ? s.statBad : ""}`}>
                  {vaccinesLabel}
                </p>
                <p className={s.statCardLabel}>Vacunas</p>
              </div>
            </div>
          </div>

          {isOwner && (
            <ListRow
              icon={HeartPulse}
              label="Michi-Tracker Pro"
              desc={
                pet.has_active_subscription
                  ? "GPS activo · Gestionar suscripción"
                  : "Activa el seguimiento GPS en tiempo real"
              }
              onPress={pet.has_active_subscription ? openTrackerBilling : handleSubscribeMichiTracker}
            />
          )}

          {pet.description && (
            <section className={s.about}>
              <SectionHeader title={`Sobre ${pet.name}`} />
              <p className={s.aboutText}>{pet.description}</p>
            </section>
          )}
        </>
      )}

      {tab === "salud" && (
        <>
          <SectionHeader
            title="Vacunas"
            actionLabel={health.canEdit ? "Agregar" : undefined}
            onAction={health.canEdit ? () => router.push(`/carnet/nueva-vacuna?pet_id=${pet.id}`) : undefined}
          />
          {health.isLoadingVaccines ? (
            <Skeleton height={64} borderRadius={12} />
          ) : health.vaccines.length === 0 ? (
            <p className={s.emptyLine}>Aún no hay vacunas registradas de {pet.name}.</p>
          ) : (
            /* Timeline: la línea de tiempo del carnet — punto con estado, nombre, fecha y refuerzo. */
            <div className={s.timeline}>
              {health.vaccines.map((v: any) => {
                const vencido = !!v.next_due_date && v.next_due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
                return (
                  <div key={v.id} className={s.timelineItem}>
                    <span className={`${s.timelineDot} ${vencido ? s.timelineDotWarn : s.timelineDotOk}`} aria-hidden />
                    {/* El estado no se comunica solo con color: el texto lo dice. */}
                    <span className={s.timelineStatus} style={{ color: vencido ? "var(--color-warning)" : "var(--color-success)" }}>
                      {vencido ? "Refuerzo vencido" : "Al día"}
                    </span>
                    <div className={s.timelineBody}>
                      <p className={s.timelineTitle}>{v.name}</p>
                      <p className={s.timelineMeta}>
                        {[
                          v.applied_on ? `Aplicada el ${formatDate(v.applied_on)}` : null,
                          v.next_due_date ? `Refuerzo: ${formatDate(v.next_due_date)}` : null,
                          v.notes || null,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {health.canEdit && (
                      <ItemActions
                        onEdit={() => router.push(`/carnet/nueva-vacuna?pet_id=${pet.id}&id=${v.id}`)}
                        onDelete={() => health.deleteVaccine(v.id)}
                        label={v.name}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <SectionHeader title="Consulta con IA" />
          <Button
            label="Consultar síntomas con IA"
            variant="secondary"
            onPress={() => router.push(`/mascotas/diagnostico-ia?petId=${pet.id}`)}
          />
        </>
      )}

      {tab === "historial" && (
        <>
          <SectionHeader
            title="Consultas"
            actionLabel={health.canEdit ? "Registrar" : undefined}
            onAction={health.canEdit ? () => router.push(`/carnet/nueva-consulta?pet_id=${pet.id}`) : undefined}
          />
          {health.isLoadingRecords ? (
            <Skeleton height={64} borderRadius={12} />
          ) : health.records.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="Sin consultas"
              subtitle="Las visitas al veterinario, con diagnóstico y receta, aparecerán aquí."
              actionLabel={health.canEdit ? "Registrar consulta" : undefined}
              onAction={health.canEdit ? () => router.push(`/carnet/nueva-consulta?pet_id=${pet.id}`) : undefined}
            />
          ) : (
            <div className={s.itemList}>
              {health.records.map((r) => (
                <RecordItem
                  key={r.id}
                  record={r}
                  petId={pet.id}
                  onEdit={health.canEdit ? () => router.push(`/carnet/nueva-consulta?pet_id=${pet.id}&id=${r.id}`) : undefined}
                  onDelete={health.canEdit ? () => health.deleteRecord(r.id) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      {shareUrl && (
        <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-label={`Carnet de ${pet.name}`}>
          <div className={s.modal}>
            <h2 className={s.modalTitle}>Carnet de {pet.name}</h2>
            <p className={s.modalText}>
              Quien escanee el QR verá el pasaporte. El enlace dura 24 horas.
            </p>
            <p className={s.shareUrl}>{shareUrl}</p>
            <div className={s.modalActions}>
              <Button
                label="Compartir enlace"
                onPress={async () => {
                  const ok = await copyText(shareUrl);
                  showAlert({
                    type: ok ? "success" : "error",
                    title: ok ? "Enlace copiado" : "No se pudo compartir",
                    message: ok ? "Pégalo donde quieras." : "Inténtalo de nuevo.",
                  });
                }}
              />
              <Button label="Cerrar" variant="secondary" onPress={closeShare} />
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
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
