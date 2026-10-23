"use client";

/**
 * Historial de grooming de una mascota (`/grooming/historial/[petId]`): expediente + línea de tiempo.
 * Espejo de `mobile/app/grooming/historial/[petId].tsx`.
 */
import { useParams } from "next/navigation";
import {
  Scissors,
  Calendar,
  Clock,
  FileText,
  Droplets,
  Heart,
  AlertTriangle,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useGroomingClient } from "@/hooks/grooming/useGroomingClient";
import type { GroomingAppointment } from "@/services/grooming";
import l from "../../../estilistas/estilistas.module.css";

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

export default function HistorialGroomingPage() {
  const params = useParams<{ petId: string }>();
  const petId = params.petId;
  const { groomingHistory, historyLoading } = useGroomingClient(petId);

  const file = groomingHistory?.file;
  const appointments = groomingHistory?.appointments ?? [];

  return (
    <ScreenContainer>
      <ScreenHeader title="Historial" subtitle="Expediente de grooming" />

      {historyLoading ? (
        <SkeletonList count={3} />
      ) : (
        <>
          {file ? (
            <Card>
              <div className={l.fileCard}>
                <div className={l.fileHeader}>
                  <div className={l.iconBox}>
                    <FileText size={20} />
                  </div>
                  <h2 className={l.fileTitle}>Expediente de Grooming</h2>
                </div>
                {file.hair_type ? (
                  <div className={l.fileRow}>
                    <Scissors size={14} />
                    <span className={l.fileLabel}>Tipo de pelo:</span>
                    <span className={l.fileValue}>{file.hair_type}</span>
                  </div>
                ) : null}
                {file.preferred_shampoo ? (
                  <div className={l.fileRow}>
                    <Droplets size={14} />
                    <span className={l.fileLabel}>Shampoo preferido:</span>
                    <span className={l.fileValue}>{file.preferred_shampoo}</span>
                  </div>
                ) : null}
                {file.behavior_notes ? (
                  <div className={l.fileRow}>
                    <Heart size={14} />
                    <span className={l.fileLabel}>Comportamiento:</span>
                    <span className={l.fileValue}>{file.behavior_notes}</span>
                  </div>
                ) : null}
                {file.allergies_detected ? (
                  <div className={l.allergyBadge}>
                    <AlertTriangle size={14} />
                    Alergias: {file.allergies_detected}
                  </div>
                ) : null}
                {file.last_service_date ? (
                  <p className={l.timelineMeta}>Última visita: {file.last_service_date}</p>
                ) : null}
              </div>
            </Card>
          ) : null}

          {appointments.length === 0 ? (
            <EmptyState
              icon={<Scissors size={28} />}
              title="Sin citas registradas"
              subtitle="Cuando tu mascota tenga citas de grooming aparecerán aquí."
            />
          ) : (
            <div className={l.list} style={{ marginTop: "var(--space-lg)" }}>
              {appointments.map((item: GroomingAppointment) => (
                <Card key={item.id}>
                  <div className={l.card}>
                    <div className={l.cardTop}>
                      <div className={l.iconBox}>
                        <Scissors size={18} />
                      </div>
                      <div className={l.cardInfo}>
                        <p className={l.cardTitle}>{item.service_type || "Grooming"}</p>
                        <div className={l.dateRow}>
                          <Calendar size={12} />
                          <span>{item.date}</span>
                          <Clock size={12} />
                          <span>{item.time}</span>
                        </div>
                        {item.skin_report ? <p className={l.skinReport}>{item.skin_report}</p> : null}
                      </div>
                      <Badge
                        label={STATUS_LABELS[item.status || ""] || "Pendiente"}
                        color={STATUS_COLORS[item.status || ""] || "var(--color-text-muted)"}
                        size="sm"
                      />
                    </div>
                    {item.before_photo_url || item.after_photo_url ? (
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
