"use client";

/**
 * Inicio — espejo de `mobile/app/(tabs)/index.tsx`, pero aprovechando el espacio de la web:
 * hero con acento dorado, fila de KPIs, mascotas como tarjetas grandes y atajos en tarjetas.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Heart,
  PawPrint,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useHome, STATUS_COLORS, STATUS_LABELS, formatDate } from "@/hooks/home/useHome";
import s from "../pages.module.css";

export default function InicioPage() {
  const {
    greetingName, pets, petsLoading, petsError, upcomingAppointments, appointmentsLoading, appointmentsError,
    quickActions, panelTitle, isPro, goTools,
  } = useHome();
  const router = useRouter();

  const petsCount = pets.length;
  const weekAppointments = upcomingAppointments.length;
  const trackerCount = pets.filter((p: any) => p.has_active_subscription).length;

  return (
    <ScreenContainer>
      {/* Hero: identidad de marca + acción principal */}
      <header className={s.homeHero}>
        <div className={s.homeHeroGlow} aria-hidden />
        <div>
          <p className={s.homeOverline}>{panelTitle}</p>
          <h1 className={s.homeHeroTitle}>
            Hola, <em>{greetingName || "amigo"}</em>
          </h1>
          <p className={s.homeHeroSub}>¿Qué necesitas hoy para tus mascotas?</p>
          <div className={s.homeHeroCta}>
            <Button
              label="Agregar mascota"
              fullWidth={false}
              icon={<Plus size={16} />}
              onPress={() => router.push("/mascotas/nuevo")}
            />
            <Button
              label="Agendar cita"
              variant="secondary"
              fullWidth={false}
              icon={<CalendarDays size={16} />}
              onPress={() => router.push("/directorio")}
            />
            {isPro && (
              <Button label="Herramientas" variant="ghost" fullWidth={false} onPress={goTools} />
            )}
          </div>
        </div>
      </header>

      {/* KPIs: resumen visual de un vistazo */}
      <div className={s.kpiRow}>
        <div className={s.kpi}>
          <span className={s.kpiIcon} style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}>
            <PawPrint size={20} />
          </span>
          <div>
            <p className={s.kpiValue}>{petsLoading ? "—" : petsCount}</p>
            <p className={s.kpiLabel}>{petsCount === 1 ? "Mascota" : "Mascotas"}</p>
          </div>
        </div>
        <div className={s.kpi}>
          <span className={s.kpiIcon} style={{ background: "var(--color-primary-light, var(--color-accent-light))", color: "var(--color-primary)" }}>
            <CalendarDays size={20} />
          </span>
          <div>
            <p className={s.kpiValue}>{appointmentsLoading ? "—" : weekAppointments}</p>
            <p className={s.kpiLabel}>Próximas citas</p>
          </div>
        </div>
        <div className={s.kpi}>
          <span className={s.kpiIcon} style={{ background: "var(--color-success-light, var(--color-accent-light))", color: "var(--color-success)" }}>
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className={s.kpiValue}>{petsLoading ? "—" : trackerCount}</p>
            <p className={s.kpiLabel}>Con Michi-Tracker</p>
          </div>
        </div>
      </div>

      {/* Mascotas: tarjetas grandes con foto */}
      <section>
        <SectionHeader
          title="Mis mascotas"
          icon={<PawPrint size={18} />}
          actionLabel="Ver todas"
          onAction={() => router.push("/mascotas")}
        />
        {petsLoading ? (
          <div className={s.homeRow}>
            {[0, 1, 2].map((i) => <Skeleton key={i} height={180} borderRadius={16} />)}
          </div>
        ) : petsError ? (
          // El banner de QueryErrorBanner ya explica el fallo: no fingir que no hay mascotas.
          null
        ) : pets.length === 0 ? (
          <EmptyState
            icon={<PawPrint size={28} />}
            title="Aún no tienes mascotas"
            subtitle="Agrega a tu perro o gato para llevar su control y carnet."
            actionLabel="Agregar mascota"
            onAction={() => router.push("/mascotas/nuevo")}
          />
        ) : (
          <div className={s.homeRow}>
            {pets.slice(0, 6).map((pet) => (
              <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.petCard}>
                <div className={s.petCardMedia}>
                  {pet.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pet.photo_url} alt={pet.name} loading="lazy" />
                  ) : (
                    <div className={s.petCardFallback}><PawPrint size={36} /></div>
                  )}
                </div>
                <div className={s.petCardBody}>
                  <p className={s.petCardName}>{pet.name}</p>
                  <p className={s.petCardMeta}>{pet.breed || pet.species}</p>
                </div>
              </Link>
            ))}
            <button type="button" className={s.homePetAdd} onClick={() => router.push("/mascotas/nuevo")} aria-label="Agregar mascota">
              <Plus size={22} />
            </button>
          </div>
        )}
      </section>

      {/* Próximas citas */}
      <section>
        <SectionHeader
          title="Próximas citas"
          icon={<CalendarDays size={18} />}
          actionLabel="Ver citas"
          onAction={() => router.push("/directorio/citas")}
        />
        {appointmentsLoading ? (
          <Skeleton height={64} borderRadius={12} />
        ) : appointmentsError ? (
          null
        ) : upcomingAppointments.length === 0 ? (
          <Card>
            <p className={s.homeEmptyLine}>No tienes citas próximas.</p>
            <Button
              label="Agendar cita"
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={() => router.push("/directorio")}
            />
          </Card>
        ) : (
          <div className={s.homeList}>
            {upcomingAppointments.map((a) => (
              <Link key={a.id} href="/directorio/citas" className={s.homeItem}>
                <div>
                  <p className={s.homePetName}>{a.clinic_name || "Clínica"}</p>
                  <p className={s.homePetMeta}>{a.pet_name || "Mascota"} · {formatDate(a.appointment_date)}</p>
                </div>
                <span className={s.homeStatus} style={{ color: STATUS_COLORS[a.status] || "var(--color-text-muted)" }}>
                  {STATUS_LABELS[a.status] || a.status}
                </span>
                <ChevronRight size={18} aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Atajos como tarjetas con ícono y acento */}
      <section>
        <SectionHeader title="Atajos" icon={<Sparkles size={18} />} />
        <div className={s.kpiRow}>
          {quickActions.map((action) => (
            <Link key={action.title} href={action.route || "/explorar"} className={s.toolCard}>
              <span className={s.toolCardIcon} style={{ background: "var(--color-accent-light)", color: action.color }}>
                <action.icon size={20} />
              </span>
              <span className={s.toolCardLabel}>{action.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </ScreenContainer>
  );
}
