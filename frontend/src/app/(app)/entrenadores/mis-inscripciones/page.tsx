"use client";

/**
 * Mis inscripciones de entrenamiento (`/entrenadores/mis-inscripciones`).
 * Espejo de `mobile/app/entrenadores/mis-inscripciones.tsx`.
 */
import { useRouter } from "next/navigation";
import { BookOpen, PawPrint, Calendar, TrendingUp, ChevronRight, Star } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useEnrollment } from "@/hooks/training/useEnrollment";
import l from "../entrenadores.module.css";

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
  pending: "Pendiente",
};

const STATUS_COLOR: Record<string, string> = {
  active: "var(--color-success)",
  completed: "var(--color-info)",
  cancelled: "var(--color-error)",
  pending: "var(--color-warning)",
};

export default function MisInscripcionesPage() {
  const router = useRouter();
  const { enrollments, isEnrollmentsLoading } = useEnrollment();

  return (
    <ScreenContainer>
      <ScreenHeader title="Mis Inscripciones" />

      {isEnrollmentsLoading ? (
        <SkeletonList count={3} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="Sin inscripciones"
          subtitle="Cuando inscribas a tu mascota en un programa aparecerá aquí."
          actionLabel="Ver programas"
          onAction={() => router.push("/entrenadores")}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {enrollments.map((item) => {
            const color = STATUS_COLOR[item.status] || "var(--color-warning)";
            const label = STATUS_LABEL[item.status] || STATUS_LABEL.pending;
            const pct =
              item.status === "completed"
                ? 100
                : item.goals_total
                  ? Math.round(((item.goals_done || 0) / item.goals_total) * 100)
                  : 0;
            return (
              <Card key={item.id}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                  <button
                    type="button"
                    onClick={() => router.push(`/entrenadores/metas/${item.id}`)}
                    aria-label={`Ver metas de ${item.programTitle}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-md)",
                      background: "none",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        background: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
                        color: "var(--color-accent)",
                      }}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)" }}>
                        {item.programTitle}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: "var(--font-sm)",
                          color: "var(--color-text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <PawPrint size={12} /> {item.petName}
                      </p>
                    </div>
                    <Badge label={label} color={color} size="sm" />
                    <ChevronRight size={18} color="var(--color-text-muted)" aria-hidden />
                  </button>

                  <div className={l.progressWrap}>
                    <div className={l.progressHead}>
                      <TrendingUp size={13} />
                      <span>
                        {item.goals_total ? `${item.goals_done || 0} de ${item.goals_total} metas` : "Sin metas aún"}
                      </span>
                    </div>
                    <div className={l.progressBg}>
                      <div className={l.progressFill} style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "var(--space-md)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "var(--font-sm)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <Calendar size={12} />
                      Inicio: {new Date(item.start_date).toLocaleDateString("es-MX")}
                    </span>
                    {item.status === "completed" ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/entrenadores/${item.program_id}`)}
                        aria-label="Calificar programa"
                        style={{
                          background: "none",
                          border: 0,
                          padding: "var(--space-xs) var(--space-sm)",
                          minHeight: 36,
                          fontWeight: 700,
                          fontSize: "var(--font-md)",
                          color: "var(--color-primary)",
                          cursor: "pointer",
                          borderRadius: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Star size={14} /> Calificar programa
                      </button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}
