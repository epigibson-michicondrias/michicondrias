"use client";

/**
 * Postulaciones del refugio — formularios de compatibilidad (`/adopciones/refugio/aplicaciones`).
 * Espejo de `mobile/app/adopciones/refugio/aplicaciones.tsx`.
 */
import { ClipboardList, Eye, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { SkeletonList } from "@/components/Skeleton";
import {
  useRefugeApplications,
  STATUS_TONES,
  STATUS_LABELS,
} from "@/hooks/adopciones/useRefugeApplications";
import type { AdoptionForm } from "@/types/adopciones";
import { formatDate } from "@/utils/formatters";
import local from "@/features/adopciones/adopciones.module.css";

const TONE_COLOR: Record<string, string> = {
  warning: "var(--color-warning)",
  info: "var(--color-info)",
  success: "var(--color-success)",
  error: "var(--color-error)",
};

function statusColor(status: string) {
  return TONE_COLOR[STATUS_TONES[status] || "warning"];
}

function StatusIcon({ status }: { status: string }) {
  const color = statusColor(status);
  if (status === "approved") return <CheckCircle size={14} color={color} />;
  if (status === "rejected") return <XCircle size={14} color={color} />;
  return <Clock size={14} color={color} />;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-error)";
  return (
    <div className={local.scoreRow}>
      <div className={local.scoreBar}>
        <div className={local.scoreFill} style={{ width: `${score}%`, background: color }} />
      </div>
      <span className={local.scoreText}>{score}%</span>
    </div>
  );
}

function ApplicationCard({ item, onOpen }: { item: AdoptionForm; onOpen: () => void }) {
  const color = statusColor(item.status);
  const statusLabel = STATUS_LABELS[item.status] || item.status;
  return (
    <Card>
      <div className={local.applicationCard}>
        <div className={local.applicationHeader}>
          <div className={local.applicationTitleRow}>
            <ClipboardList size={20} color="var(--color-primary)" aria-hidden />
            <p className={local.applicationTitle}>
              {item.pet_name ? `Postulación por ${item.pet_name}` : `Postulación #${item.id.slice(0, 8)}`}
            </p>
          </div>
          <span className={local.applicationStatus} style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
            <StatusIcon status={item.status} />
            {statusLabel}
          </span>
        </div>

        <div className={local.applicationBody}>
          <div className={local.applicationRow}>
            <span className={local.applicationLabel}>Compatibilidad</span>
            <ScoreBar score={item.compatibility_score} />
          </div>
          <div className={local.applicationRow}>
            <span className={local.applicationLabel}>Experiencia</span>
            <span className={local.applicationValue}>
              {item.experience_level
                ? item.experience_level.charAt(0).toUpperCase() + item.experience_level.slice(1)
                : "No especificada"}
            </span>
          </div>
          <div className={local.applicationRow}>
            <span className={local.applicationLabel}>Fecha</span>
            <span className={local.applicationValue}>{formatDate(item.created_at)}</span>
          </div>
        </div>

        <Button
          label="Revisar"
          variant="secondary"
          size="sm"
          icon={<Eye size={16} />}
          onPress={onOpen}
        />
      </div>
    </Card>
  );
}

export default function RefugeApplicationsPage() {
  const { applications, isLoading, isRefetching, refetch, goToApplicationDetail } = useRefugeApplications();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Postulaciones"
        subtitle={isLoading ? undefined : `${applications.length} en total`}
        actions={[{ icon: RefreshCw, label: "Actualizar", onPress: refetch, loading: isRefetching }]}
      />

      {isLoading ? (
        <SkeletonList count={3} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="Sin solicitudes"
          subtitle="Aún no hay solicitudes de adopción para revisar."
        />
      ) : (
        <div className={local.list}>
          {applications.map((item) => (
            <ApplicationCard
              key={item.id}
              item={item}
              onOpen={() => goToApplicationDetail(item.id)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
