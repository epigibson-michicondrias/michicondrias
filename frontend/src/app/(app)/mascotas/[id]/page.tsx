"use client";

/**
 * Ficha de mascota — espejo de `mobile/app/mascotas/[id].tsx`. Pestañas Resumen · Salud · Historial
 * (`?tab=salud|historial` como en la app). El detalle de carnet completo se porta con el módulo carnet.
 */
import { Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  PawPrint,
  Pencil,
  Pill,
  Satellite,
  Share2,
  ShieldCheck,
  Sparkles,
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
import { formatAge, formatDate, formatWeight, capitalize } from "@/utils/formatters";
import s from "../mascotas.module.css";

/** Resultado de laboratorio tal como lo devuelve `getPetLabHistory` (sin tipo en el servicio). */
interface LabResult {
  id?: string;
  parameter_name: string;
  measured_value: string | number;
  unit?: string | null;
  reference_range?: string | null;
  is_anomaly?: boolean;
  created_at?: string;
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
          {[pet.breed || capitalize(pet.species), pet.gender === "hembra" ? "Hembra" : pet.gender === "macho" ? "Macho" : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {/* Badges: especie y tracker (la edad ya está en el Resumen) */}
        <div className={s.heroBadgeRow}>
          {pet.species && <span className={s.heroBadge}>{capitalize(pet.species)}</span>}
          {pet.has_active_subscription && (
            <span className={`${s.heroBadge} ${s.heroBadgeOn}`}>Michi-Tracker</span>
          )}
        </div>
      </div>

      {/* Acciones del dueño: las de carnet arriba, editar y compartir como secundarias */}
      {isOwner && (
        <div className={s.quickActions}>
          <Button label="Agregar vacuna" variant="secondary" icon={<Syringe size={18} />} onPress={health.addVaccine} />
          <Button label="Agregar consulta" variant="secondary" icon={<ClipboardList size={18} />} onPress={health.addRecord} />
          <div className={s.quickActionsRow}>
            <Button label="Editar datos" variant="ghost" fullWidth={false} icon={<Pencil size={16} />} onPress={() => router.push(`/mascotas/editar/${pet.id}`)} />
            <Button label="Compartir carnet" variant="ghost" fullWidth={false} icon={<Share2 size={16} />} onPress={openShare} />
          </div>
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
          {/* Stats: Peso y Vacunas llevan a su detalle (Historial con las consultas, Salud con el carnet) */}
          <div className={s.statGridVisual}>
            <div className={s.statCard}>
              <span className={s.statIcon}><CalendarDays size={20} /></span>
              <div>
                <p className={s.statCardValue}>{formatAge(pet.age_months)}</p>
                <p className={s.statCardLabel}>Edad</p>
              </div>
            </div>
            <button type="button" className={`${s.statCard} ${s.statCardLink}`} onClick={() => setTab("historial")} aria-label={`Peso: ${formatWeight(pet.weight_kg)}. Ver historial`}>
              <span className={s.statIcon}><Activity size={20} /></span>
              <div>
                <p className={s.statCardValue}>{formatWeight(pet.weight_kg)}</p>
                <p className={s.statCardLabel}>Peso</p>
              </div>
            </button>
            <button type="button" className={`${s.statCard} ${s.statCardLink}`} onClick={() => setTab("salud")} aria-label={`Vacunas: ${vaccinesLabel}. Ver salud`}>
              <span className={s.statIcon}><ShieldCheck size={20} /></span>
              <div>
                <p className={`${s.statCardValue} ${health.vaccinesStatus === "al-dia" ? s.statOk : health.vaccinesStatus === "vencido" ? s.statBad : ""}`}>
                  {vaccinesLabel}
                </p>
                <p className={s.statCardLabel}>Vacunas</p>
              </div>
            </button>
          </div>

          {isOwner && (
            <ListRow
              icon={Satellite}
              label="Michi-Tracker Pro"
              desc={
                isSubscribing || isOpeningBilling
                  ? "Abriendo…"
                  : pet.has_active_subscription
                    ? "GPS activo · Gestionar suscripción"
                    : "Activa el seguimiento GPS en tiempo real"
              }
              onPress={isSubscribing || isOpeningBilling ? undefined : pet.has_active_subscription ? openTrackerBilling : handleSubscribeMichiTracker}
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
          <SectionHeader title="Vacunas" />
          {health.loadingVaccines ? (
            <Skeleton height={64} borderRadius={12} />
          ) : health.vaccines.length === 0 ? (
            <p className={s.emptyLine}>Aún no hay vacunas registradas de {pet.name}.</p>
          ) : (
            /* Timeline: la línea de tiempo del carnet — punto con estado, nombre, fecha y refuerzo. */
            <div className={s.timeline}>
              {health.vaccines.map((v) => {
                const vencido = !!v.next_due_date && v.next_due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
                return (
                  <div key={v.id} className={s.timelineItem}>
                    <span className={`${s.timelineDot} ${vencido ? s.timelineDotWarn : s.timelineDotOk}`} aria-hidden />
                    {/* El estado no se comunica solo con color: el texto lo dice. */}
                    <span className={`${s.timelineStatus} ${vencido ? s.statusWarn : s.statusOk}`}>
                      {vencido ? "Refuerzo vencido" : "Al día"}
                    </span>
                    <div className={s.timelineBody}>
                      <p className={s.timelineTitle}>{v.name}</p>
                      <p className={s.timelineMeta}>
                        {[
                          v.date_administered ? `Aplicada el ${formatDate(v.date_administered)}` : null,
                          v.next_due_date ? `Refuerzo: ${formatDate(v.next_due_date)}` : null,
                          v.notes || null,
                        ].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    {health.canEdit && (
                      <ItemActions
                        onEdit={() => health.editVaccine(v.id)}
                        onDelete={() => health.confirmDeleteVaccine(v.id, v.name)}
                        label={v.name}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <SectionHeader title="Medicamentos" />
          {health.loadingReminders ? (
            <Skeleton height={64} borderRadius={12} />
          ) : health.reminders.length === 0 ? (
            <p className={s.emptyLine}>Sin tratamientos activos. Aparecen aquí cuando una consulta incluye receta.</p>
          ) : (
            <div className={s.itemList}>
              {health.reminders.map((r) => (
                <div key={r.id} className={s.item}>
                  <Pill size={20} aria-hidden />
                  <div className={s.timelineBody}>
                    <p className={s.itemTitle}>{r.medication_name}</p>
                    <p className={s.itemMeta}>
                      {r.dosage} · cada {r.frequency_hours} h · {r.duration_days} días · {r.sent ? "Tomado" : `Toca el ${formatDate(r.remind_at)}`}
                    </p>
                  </div>
                  {!r.sent && health.canEdit && (
                    <Button
                      label="Marcar tomado"
                      variant="secondary"
                      size="sm"
                      icon={<Check size={16} />}
                      onPress={() => health.checkReminder(r.id)}
                      accessibilityLabel={`Marcar ${r.medication_name} como tomado`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <SectionHeader title="Laboratorio" />
          {health.loadingLabs ? (
            <Skeleton height={64} borderRadius={12} />
          ) : health.labResults.length === 0 ? (
            <p className={s.emptyLine}>Sin resultados de laboratorio.</p>
          ) : (
            <div className={s.itemList}>
              {(health.labResults as LabResult[]).map((r, i) => (
                <div key={r.id ?? i} className={s.item}>
                  <FlaskConical size={20} aria-hidden />
                  <div className={s.timelineBody}>
                    <p className={s.itemTitle}>
                      {r.parameter_name}: {r.measured_value} {r.unit || ""}
                      {r.is_anomaly ? " · Fuera de rango" : ""}
                    </p>
                    <p className={s.itemMeta}>
                      {[r.reference_range ? `Rango normal: ${r.reference_range} ${r.unit || ""}` : null, r.created_at ? formatDate(r.created_at) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {health.isOwner && (
            <Button
              label="Consultar síntomas con IA"
              variant="secondary"
              icon={<Sparkles size={18} />}
              onPress={health.openSymptomCheck}
            />
          )}
        </>
      )}

      {tab === "historial" && (
        <>
          <SectionHeader title="Consultas" />
          {health.loadingRecords ? (
            <Skeleton height={64} borderRadius={12} />
          ) : health.records.length === 0 ? (
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="Sin consultas"
              subtitle="Las visitas al veterinario, con diagnóstico y receta, aparecerán aquí."
              actionLabel={health.canEdit ? "Registrar consulta" : undefined}
              onAction={health.canEdit ? health.addRecord : undefined}
            />
          ) : (
            <div className={s.itemList}>
              {health.records.map((r) => (
                <RecordItem
                  key={r.id}
                  record={r}
                  petId={pet.id}
                  onEdit={health.canEdit ? () => health.editRecord(r.id) : undefined}
                  onDelete={health.canEdit ? () => health.confirmDeleteRecord(r.id, r.reason_for_visit) : undefined}
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
