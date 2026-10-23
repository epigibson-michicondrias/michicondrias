"use client";

/**
 * Gestión de citas del estilista (`/grooming/gestion`): filtros, fotos/reporte y estados.
 * Espejo de `mobile/app/grooming/gestion.tsx`.
 */
import { useState } from "react";
import { Scissors, Camera, Calendar, Clock, CheckCircle, Play, X, ImagePlus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import RoleGuard from "@/components/RoleGuard";
import { SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import {
  useGroomingProvider,
  type ProviderFilter,
  type ProviderPhotoPayload,
} from "@/hooks/grooming/useGroomingProvider";
import type { GroomingAppointment } from "@/services/grooming";
import l from "../../estilistas/estilistas.module.css";

const FILTERS: { key: ProviderFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "scheduled", label: "Agendadas" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "in_progress", label: "En progreso" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
];

const STATUS_ACTIONS: Record<string, { next: string; label: string }> = {
  scheduled: { next: "confirmed", label: "Confirmar" },
  pending: { next: "confirmed", label: "Confirmar" },
  confirmed: { next: "in_progress", label: "Iniciar sesión" },
  in_progress: { next: "completed", label: "Marcar completada" },
};
const CANCELLABLE = ["scheduled", "pending", "confirmed", "in_progress"];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "var(--color-info)",
  pending: "var(--color-info)",
  confirmed: "var(--color-success)",
  in_progress: "var(--color-warning)",
  completed: "var(--color-primary)",
  cancelled: "var(--color-error)",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

function GestionContent() {
  const {
    appointments,
    filter,
    isLoading,
    isUpdating,
    setFilter,
    updatePhotos,
    updateStatus,
  } = useGroomingProvider();

  const [photoModal, setPhotoModal] = useState<GroomingAppointment | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [skinReport, setSkinReport] = useState("");

  const openPhotoModal = (appointment: GroomingAppointment) => {
    setPhotoModal(appointment);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(appointment.before_photo_url || null);
    setAfterPreview(appointment.after_photo_url || null);
    setSkinReport(appointment.skin_report || "");
  };

  const closePhotoModal = () => {
    setPhotoModal(null);
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setSkinReport("");
  };

  const pickPhoto = (type: "before" | "after") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "before") {
      setBeforeFile(file);
      setBeforePreview(preview);
    } else {
      setAfterFile(file);
      setAfterPreview(preview);
    }
  };

  const handleSavePhotos = () => {
    if (!photoModal) return;
    const payload: ProviderPhotoPayload = {
      before_photo_url: beforeFile ? undefined : photoModal.before_photo_url || undefined,
      after_photo_url: afterFile ? undefined : photoModal.after_photo_url || undefined,
      beforeFile,
      afterFile,
      skin_report: skinReport || undefined,
    };
    updatePhotos(photoModal.id, payload);
    closePhotoModal();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Gestión de Citas" subtitle="Panel del estilista" />

      <div className={l.chipsRow} role="group" aria-label="Filtrar citas">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${l.slotChip} ${filter === f.key ? l.slotChipActive : ""}`}
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Scissors size={28} />}
          title="Sin citas"
          subtitle="No tienes citas asignadas con este filtro."
        />
      ) : (
        <div className={l.list}>
          {appointments.map((item) => {
            const statusAction = STATUS_ACTIONS[item.status || ""];
            const hasPhotos = !!item.before_photo_url || !!item.after_photo_url;
            return (
              <Card key={item.id}>
                <div className={l.card}>
                  <div className={l.cardTop}>
                    <div className={l.iconBox}>
                      <Scissors size={20} />
                    </div>
                    <div className={l.cardInfo}>
                      <p className={l.cardTitle}>{item.service_type || "Grooming"}</p>
                      <p className={l.selectSub}>
                        {item.pet_name || "Mascota"} · {item.client_name || "Cliente"}
                      </p>
                      <div className={l.dateRow}>
                        <Calendar size={12} />
                        <span>{item.date}</span>
                        <Clock size={12} />
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <Badge
                      label={STATUS_LABELS[item.status || ""] || "Pendiente"}
                      color={STATUS_COLORS[item.status || ""] || "var(--color-text-muted)"}
                      size="sm"
                    />
                  </div>

                  {hasPhotos ? (
                    <div className={l.photosRow}>
                      {item.before_photo_url ? (
                        <div className={l.photoThumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- URL remota de storage */}
                          <img src={item.before_photo_url} alt="Antes" />
                          <span className={l.photoLabel}>Antes</span>
                        </div>
                      ) : null}
                      {item.after_photo_url ? (
                        <div className={l.photoThumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- URL remota de storage */}
                          <img src={item.after_photo_url} alt="Después" />
                          <span className={l.photoLabel}>Después</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className={l.cardActions}>
                    <button type="button" className={l.linkBtn} onClick={() => openPhotoModal(item)}>
                      <Camera size={14} style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden />
                      Fotos & Reporte
                    </button>
                    {statusAction ? (
                      <button
                        type="button"
                        className={l.linkBtn}
                        disabled={isUpdating}
                        onClick={() => updateStatus(item.id, statusAction.next)}
                      >
                        {statusAction.next === "in_progress" ? (
                          <Play size={14} style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden />
                        ) : (
                          <CheckCircle size={14} style={{ verticalAlign: -2, marginRight: 4 }} aria-hidden />
                        )}
                        {statusAction.label}
                      </button>
                    ) : null}
                    {CANCELLABLE.includes(item.status || "") ? (
                      <button
                        type="button"
                        className={`${l.linkBtn} ${l.linkBtnDanger}`}
                        disabled={isUpdating}
                        onClick={() =>
                          showAlert({
                            type: "warning",
                            title: "Cancelar cita",
                            message: `¿Cancelar la cita de ${item.pet_name || "la mascota"}? El horario quedará libre.`,
                            showCancel: true,
                            cancelText: "Volver",
                            buttonText: "Cancelar cita",
                            onButtonPress: () => updateStatus(item.id, "cancelled"),
                          })
                        }
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {photoModal ? (
        <div className={l.sheetBackdrop} role="presentation" onClick={closePhotoModal}>
          <div
            className={l.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Fotos y reporte"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={l.sheetHeader}>
              <h2 className={l.sheetTitle}>Fotos y reporte</h2>
              <IconButton icon={X} accessibilityLabel="Cerrar" onPress={closePhotoModal} variant="subtle" />
            </div>

            <p className={l.fieldLabel}>Foto antes</p>
            <label className={l.photoPicker}>
              {beforePreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- previsualización local o URL de storage
                <img src={beforePreview} alt="Foto antes" />
              ) : (
                <span className={l.photoPlaceholder}>
                  <ImagePlus size={26} />
                  Agregar foto antes
                </span>
              )}
              <input type="file" accept="image/*" hidden onChange={pickPhoto("before")} />
            </label>

            <p className={l.fieldLabel}>Foto después</p>
            <label className={l.photoPicker}>
              {afterPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- previsualización local o URL de storage
                <img src={afterPreview} alt="Foto después" />
              ) : (
                <span className={l.photoPlaceholder}>
                  <ImagePlus size={26} />
                  Agregar foto después
                </span>
              )}
              <input type="file" accept="image/*" hidden onChange={pickPhoto("after")} />
            </label>

            <FormField
              label="Reporte de piel"
              value={skinReport}
              onChangeText={setSkinReport}
              placeholder="Observaciones sobre la piel, pelaje, parásitos..."
              multiline
              numberOfLines={4}
            />

            <Button label="Guardar" onPress={handleSavePhotos} loading={isUpdating} />
          </div>
        </div>
      ) : null}
    </ScreenContainer>
  );
}

export default function GestionGroomingPage() {
  return (
    <RoleGuard roles={["estilista"]} message="La gestión de citas es solo para cuentas de estilista.">
      <GestionContent />
    </RoleGuard>
  );
}
