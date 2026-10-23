"use client";

/**
 * Mi clínica — panel de la clínica del profesional: perfil, métricas del día y citas pendientes.
 * Espejo parcial de `mobile/app/mi-clinica/index.tsx` (versión web bajo `/directorio/mi-clinica`).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  DollarSign,
  Plus,
  Stethoscope,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import ListRow from "@/components/ListRow";
import RoleGuard from "@/components/RoleGuard";
import { useMyClinic } from "@/hooks/directorio/useMyClinic";
import s from "./mi-clinica.module.css";

function MiClinicaContent() {
  const router = useRouter();
  const { clinic, loadingClinics, metrics, todayAppointments, pendingAppointments, goToRegister } =
    useMyClinic();

  if (loadingClinics) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mi Clínica" showBack={false} />
        <SkeletonList count={3} />
      </ScreenContainer>
    );
  }

  if (!clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mi Clínica" showBack={false} />
        <EmptyState
          icon={<Stethoscope size={28} />}
          title="No tienes clínicas registradas"
          subtitle="Registra tu clínica veterinaria para comenzar a gestionar citas y expedientes médicos."
          actionLabel="Registrar clínica"
          onAction={goToRegister}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader
        title={clinic.name}
        subtitle={clinic.city || undefined}
        showBack={false}
        actionIcon={Plus}
        actionLabel="Registrar otro lugar"
        onAction={goToRegister}
      />

      <div className={s.content}>
        {/* Perfil rápido */}
        <div className={s.profileCard}>
          <div className={s.clinicLogo}>
            <Stethoscope size={28} color="var(--color-primary)" />
          </div>
          <div className={s.profileInfo}>
            <span className={`${s.statusBadge} ${clinic.is_approved ? s.statusOk : s.statusPending}`}>
              {clinic.is_approved ? "VERIFICADA" : "EN REVISIÓN: aún no aparece en el directorio"}
            </span>
            <p className={s.profileAddress}>{clinic.address || "Sin dirección registrada"}</p>
          </div>
        </div>

        {/* Stats del día */}
        <div className={s.statsGrid}>
          <button type="button" className={s.statItem} onClick={() => router.push("/directorio/citas")}>
            <span className={s.statIcon} style={{ background: "var(--color-primary-light)" }}>
              <Calendar size={18} color="var(--color-primary)" />
            </span>
            <span className={s.statText}>
              <span className={s.statValue}>{todayAppointments.length}</span>
              <span className={s.statLabel}>Citas hoy</span>
            </span>
          </button>
          <button type="button" className={s.statItem} onClick={() => router.push("/directorio/citas")}>
            <span className={s.statIcon} style={{ background: "var(--color-warning-light)" }}>
              <Activity size={18} color="var(--color-warning)" />
            </span>
            <span className={s.statText}>
              <span className={s.statValue}>{pendingAppointments.length}</span>
              <span className={s.statLabel}>Pendientes</span>
            </span>
          </button>
        </div>

        {/* Métricas */}
        <h2 className={s.sectionTitle}>Métricas financieras</h2>
        <div className={s.metricsRow}>
          <div className={s.metricCard}>
            <span className={s.statIcon} style={{ background: "var(--color-success-light)" }}>
              <DollarSign size={18} color="var(--color-success)" />
            </span>
            <p className={s.metricValue}>${(metrics.dailyRevenue ?? 0).toLocaleString("es-MX")}</p>
            <p className={s.metricLabel}>Ingresos hoy</p>
          </div>
          <div className={s.metricCard}>
            <span className={s.statIcon} style={{ background: "var(--color-primary-light)" }}>
              <BarChart3 size={18} color="var(--color-primary)" />
            </span>
            <p className={s.metricValue}>{metrics.occupancyRate ?? 0}%</p>
            <p className={s.metricLabel}>Ocupación</p>
          </div>
        </div>

        {/* Citas pendientes */}
        <div className={s.activityHeader}>
          <h2 className={s.sectionTitle}>Citas pendientes</h2>
          <Link href="/directorio/citas" className={s.seeAll}>
            Ver todo
          </Link>
        </div>

        {pendingAppointments.length === 0 ? (
          <EmptyState icon={<Calendar size={28} />} title="No hay citas pendientes de confirmación" />
        ) : (
          <div className={s.activityList}>
            {pendingAppointments.slice(0, 3).map((appt) => (
              <ListRow
                key={appt.id}
                icon={Calendar}
                label={appt.service_name || "Cita"}
                desc={`${appt.date ?? ""}${appt.start_time ? ` · ${appt.start_time}` : ""}`}
                onPress={() => router.push("/directorio/citas")}
              />
            ))}
          </div>
        )}

        <ListRow
          icon={Stethoscope}
          label="Ver ficha pública"
          desc="Cómo te ven los dueños en el directorio"
          onPress={() => router.push(`/directorio/clinica/${clinic.id}`)}
        />
      </div>
    </ScreenContainer>
  );
}

export default function MiClinicaPage() {
  return (
    <RoleGuard roles={["veterinario", "hospital", "admin"]}>
      <MiClinicaContent />
    </RoleGuard>
  );
}
