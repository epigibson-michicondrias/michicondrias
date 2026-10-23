"use client";

/**
 * Panel del entrenador (`/entrenadores/gestion`): inscripciones y acceso a metas.
 * Espejo de `mobile/app/entrenadores/gestion.tsx`.
 */
import { useRouter } from "next/navigation";
import { Plus, Users, Calendar, ChevronRight, Dumbbell } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import RoleGuard from "@/components/RoleGuard";
import { useTrainerDashboard } from "@/hooks/training/useTrainerDashboard";
import type { TrainingEnrollment } from "@/services/training";
import l from "../entrenadores.module.css";

const STATUS_LABELS: Record<string, string> = {
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

function PanelContent() {
  const router = useRouter();
  const { enrollments, isEnrollmentsLoading } = useTrainerDashboard();

  const totalActive = enrollments.filter((e) => e.status === "active").length;
  const totalCompleted = enrollments.filter((e) => e.status === "completed").length;

  return (
    <ScreenContainer>
      <ScreenHeader title="Panel Entrenador" />

      <div style={{ marginBottom: "var(--space-lg)" }}>
        <Button
          label="Nuevo programa"
          icon={<Plus size={18} />}
          onPress={() => router.push("/entrenadores/nuevo-programa")}
        />
      </div>

      <div className={l.statsRow}>
        <div className={l.statItem}>
          <p className={l.statValue} style={{ color: "var(--color-primary)" }}>
            {enrollments.length}
          </p>
          <p className={l.statLabel}>Total</p>
        </div>
        <div className={l.statDivider} />
        <div className={l.statItem}>
          <p className={l.statValue} style={{ color: "var(--color-success)" }}>
            {totalActive}
          </p>
          <p className={l.statLabel}>Activos</p>
        </div>
        <div className={l.statDivider} />
        <div className={l.statItem}>
          <p className={l.statValue} style={{ color: "var(--color-info)" }}>
            {totalCompleted}
          </p>
          <p className={l.statLabel}>Completos</p>
        </div>
      </div>

      <h2 style={{ margin: "0 0 var(--space-md)", fontSize: "var(--font-lg)", fontWeight: 700, color: "var(--color-text)" }}>
        Inscripciones
      </h2>

      {isEnrollmentsLoading ? (
        <SkeletonList count={3} />
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="Sin inscripciones"
          subtitle="Cuando un cliente inscriba a su mascota en tu programa aparecerá aquí."
          actionLabel="Ver mis programas"
          onAction={() => router.push("/entrenadores")}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {enrollments.map((item: TrainingEnrollment) => (
            <Card key={item.id}>
              <button
                type="button"
                onClick={() => router.push(`/entrenadores/metas/${item.id}`)}
                aria-label={`Gestionar metas de ${item.pet_name || "la mascota"}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                  background: "none",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      background: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <Users size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)" }}>
                      {item.pet_name || "Mascota"}
                      {item.client_name ? ` · ${item.client_name}` : ""}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--font-sm)", color: "var(--color-text-muted)" }}>
                      {item.program_title || "Programa"}
                    </p>
                  </div>
                  <Badge
                    label={STATUS_LABELS[item.status] || "Pendiente"}
                    color={STATUS_COLOR[item.status] || "var(--color-warning)"}
                    size="sm"
                  />
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
                    {new Date(item.start_date).toLocaleDateString("es-MX")}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      fontSize: "var(--font-md)",
                      fontWeight: 700,
                      color: "var(--color-primary)",
                    }}
                  >
                    Gestionar metas <ChevronRight size={15} />
                  </span>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: "var(--space-xl)" }}>
        <Button
          label="Ver catálogo de programas"
          variant="secondary"
          icon={<Dumbbell size={18} />}
          onPress={() => router.push("/entrenadores")}
        />
      </div>
    </ScreenContainer>
  );
}

export default function GestionEntrenadoresPage() {
  return (
    <RoleGuard roles={["entrenador"]} message="El panel de entrenador es solo para cuentas de entrenador.">
      <PanelContent />
    </RoleGuard>
  );
}
