"use client";

/**
 * Mi clínica — panel de la clínica del veterinario u hospital (`/mi-clinica`).
 * Espejo de `mobile/app/mi-clinica/index.tsx`.
 */
import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, BarChart3, Calendar, ChevronRight, DollarSign, Settings, Stethoscope,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/constants/roles";
import { canAccessRoute, getRoleTools } from "@/constants/roleTools";
import { formatDateMx } from "@/features/mi-clinica/format";
import { useMyClinic } from "@/hooks/directorio/useMyClinic";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/mi-clinica/clinica.module.css";

type Icon = ComponentType<{ size?: number }>;

export default function MiClinicaPage() {
  return <MiClinica />;
}

function MiClinica() {
  const router = useRouter();
  const { user } = useAuth();
  const role = normalizeRole(user?.role_name);
  const { clinic, loadingClinics, metrics, todayAppointments, pendingAppointments, goToRegister } = useMyClinic();

  if (loadingClinics) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mi clínica" />
        <div className={s.content}>
          <Skeleton height={96} />
          <Skeleton height={80} />
          <Skeleton height={260} />
        </div>
      </ScreenContainer>
    );
  }

  if (!clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Mi clínica" />
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

  // Menú = herramientas de /mi-clinica del rol (fuente única ROLE_TOOLS), sin la propia "Mi clínica".
  // `canAccessRoute` es el mismo criterio que ROUTE_ACCESS: hospital no ve recetas/cirugías; veterinario no ve sucursales/médicos.
  const menu = getRoleTools(role)
    .filter((t) => t.route.startsWith("/mi-clinica/") && canAccessRoute(role, t.route))
    .map((t) => ({ icon: t.icon as Icon, color: t.color, label: t.label, sub: t.desc, href: t.route }));

  return (
    <ScreenContainer>
      <ScreenHeader
        title={clinic.name}
        subtitle={clinic.city || undefined}
        actions={[{ icon: Settings, label: "Configurar clínica", onPress: () => router.push(`/mi-clinica/config/${clinic.id}`) }]}
      />

      <div className={s.content}>
        <Card>
          <div className={s.profile}>
            {clinic.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- el logo viene del storage
              <img src={clinic.logo_url} alt="" className={s.logo} />
            ) : (
              <span className={s.logo}>
                <Stethoscope size={28} />
              </span>
            )}
            <div className={s.cardInfo}>
              <Badge
                label={clinic.is_approved ? "Verificada" : "En revisión: aún no aparece en el directorio"}
                color={clinic.is_approved ? "var(--color-success)" : "var(--color-warning)"}
                size="sm"
              />
              <span className={s.muted}>{clinic.address || "Sin dirección registrada"}</span>
            </div>
          </div>
        </Card>

        <div className={s.tiles}>
          <Tile icon={Calendar} color="var(--color-primary)" value={todayAppointments.length} label="Citas hoy" href="/mi-clinica/agenda" />
          <Tile icon={Activity} color="var(--color-warning)" value={pendingAppointments.length} label="Pendientes" href="/mi-clinica/agenda" />
          <Tile icon={DollarSign} color="var(--color-success)" value={formatCurrency(metrics.dailyRevenue || 0)} label="Ingresos hoy" />
          <Tile icon={BarChart3} color="var(--color-info)" value={`${metrics.occupancyRate || 0}%`} label="Ocupación" />
        </div>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Gestión operativa</h2>
          <div className={s.menu}>
            {menu
              .map((m) => (
                <Link key={m.href} href={m.href} className={s.menuItem} style={{ "--c": m.color } as CSSProperties}>
                  <span className={s.iconBox} style={{ "--c": m.color } as CSSProperties}>
                    <m.icon size={22} />
                  </span>
                  <span className={s.menuLabel}>{m.label}</span>
                  <span className={s.menuSub}>{m.sub}</span>
                </Link>
              ))}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>Citas por confirmar</h2>
            {pendingAppointments.length > 0 ? (
              <Link href="/mi-clinica/agenda" className={s.muted}>
                Ver agenda
              </Link>
            ) : null}
          </div>
          {pendingAppointments.length === 0 ? (
            <p className={s.muted}>No hay citas pendientes de confirmación.</p>
          ) : (
            pendingAppointments.slice(0, 3).map((appt) => (
              <Link key={appt.id} href="/mi-clinica/agenda" className={s.card}>
                <div className={s.cardHead}>
                  <span className={s.iconBox}>
                    <Calendar size={18} />
                  </span>
                  <div className={s.cardInfo}>
                    <span className={s.cardTitle}>{appt.service_name || "Cita"}</span>
                    <span className={s.cardSub}>
                      {formatDateMx(appt.date)} · {appt.start_time?.slice(0, 5)}
                      {appt.pet_name ? ` · ${appt.pet_name}` : ""}
                    </span>
                  </div>
                  <ChevronRight size={18} aria-hidden />
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </ScreenContainer>
  );
}

function Tile({ icon: IconC, color, value, label, href }: { icon: Icon; color: string; value: string | number; label: string; href?: string }) {
  const body = (
    <>
      <span className={s.iconBox}>
        <IconC size={20} />
      </span>
      <span>
        <span className={s.tileValue} style={{ display: "block" }}>{value}</span>
        <span className={s.tileLabel}>{label}</span>
      </span>
    </>
  );
  const style = { "--c": color } as CSSProperties;
  return href ? (
    <Link href={href} className={s.tile} style={style}>
      {body}
    </Link>
  ) : (
    <div className={s.tile} style={style}>
      {body}
    </div>
  );
}
