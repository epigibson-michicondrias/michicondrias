"use client";

/**
 * Inicio — panel de escritorio a dos columnas: mascotas, citas y recordatorios de dosis a la izquierda;
 * accesos del rol y actividad rápida a la derecha. Criterio §0.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CalendarDays, Check, ChevronRight, Clock, Heart,
  PawPrint, Pill, Plus, ShieldCheck, Sparkles, Stethoscope,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import SectionHeader from "@/components/SectionHeader";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useHome, STATUS_COLORS, STATUS_LABELS, formatDate } from "@/hooks/home/useHome";
import s from "../pages.module.css";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export default function InicioPage() {
  const {
    greetingName, pets, petsLoading, petsError,
    upcomingAppointments, appointmentsLoading, appointmentsError,
    todayDoses, treatmentsLoading,
    quickActions, panelTitle, isPro, goTools,
  } = useHome();
  const router = useRouter();

  const petsCount = pets.length;
  const weekAppointments = upcomingAppointments.length;
  const trackerCount = pets.filter((p: { has_active_subscription?: boolean }) => p.has_active_subscription).length;

  return (
    <ScreenContainer>
      {/* Hero */}
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

      {/* KPIs */}
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

      {/* Dos columnas */}
      <div className={s.homeLayout}>
        {/* ── Columna principal ── */}
        <div className={s.homeCol}>
          {/* Mascotas */}
          <section>
            <SectionHeader
              title="Mis mascotas"
              icon={<PawPrint size={18} />}
              actionLabel="Ver todas"
              onAction={() => router.push("/mascotas")}
            />
            {petsLoading ? (
              <div className={s.homeRow}>
                {[0, 1, 2].map((i) => <Skeleton key={i} height={160} borderRadius={16} />)}
              </div>
            ) : petsError ? null : pets.length === 0 ? (
              <EmptyState
                icon={<PawPrint size={28} />}
                title="Aún no tienes mascotas"
                subtitle="Agrega a tu perro o gato para llevar su control y carnet."
                actionLabel="Agregar mascota"
                onAction={() => router.push("/mascotas/nuevo")}
              />
            ) : (
              <div className={s.homeRow}>
                {pets.slice(0, 6).map((pet: { id: string; name: string; photo_url?: string | null; breed?: string | null; species?: string }) => (
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
            ) : appointmentsError ? null : upcomingAppointments.length === 0 ? (
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
                {upcomingAppointments.map((a: { id: string; clinic_name?: string; pet_name?: string; appointment_date: string; status: string }) => (
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

          {/* Recordatorios de dosis */}
          <section>
            <SectionHeader
              title="Lo que toca hoy"
              icon={<Pill size={18} />}
              actionLabel={todayDoses.length > 0 ? "Ver tratamientos" : undefined}
              onAction={todayDoses.length > 0 ? () => router.push("/mascotas") : undefined}
            />
            {treatmentsLoading ? (
              <Skeleton height={80} borderRadius={12} />
            ) : todayDoses.length === 0 ? (
              <Card>
                <div className={s.homeEmptyOk}>
                  <Check size={18} />
                  <p className={s.homeEmptyLine}>Sin tomas pendientes hoy.</p>
                </div>
              </Card>
            ) : (
              <div className={s.homeList}>
                {todayDoses.slice(0, 5).map(({ dose, treatment }: { dose: { id: string; remind_at: string; isOverdue?: boolean }; treatment: { prescription_id: string; medication_name: string; dosage: string } }) => (
                  <Link key={dose.id} href={`/carnet/tratamiento/${treatment.prescription_id}`} className={s.homeItem}>
                    <div>
                      <p className={s.homePetName}>{treatment.medication_name}</p>
                      <p className={s.homePetMeta}>{treatment.dosage} · {formatTime(dose.remind_at)}</p>
                    </div>
                    {dose.isOverdue && (
                      <span className={s.homeStatus} style={{ color: "var(--color-error)" }}>Atrasada</span>
                    )}
                    <ChevronRight size={18} aria-hidden />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Columna lateral: accesos del rol ── */}
        <aside className={s.homeAside}>
          <section>
            <SectionHeader title="Accesos rápidos" icon={<Sparkles size={18} />} />
            <div className={s.homeQuickList}>
              {quickActions.map((action) => (
                <Link key={action.title} href={action.route || "/explorar"} className={s.homeQuickItem}>
                  <span className={s.homeQuickIcon} style={{ background: "var(--color-accent-light)", color: action.color }}>
                    <action.icon size={18} />
                  </span>
                  <span>{action.title}</span>
                  <ChevronRight size={14} className={s.homeQuickArrow} />
                </Link>
              ))}
            </div>
          </section>

          {/* Acciones de rol */}
          {isPro && (
            <section>
              <SectionHeader title="Herramientas pro" icon={<Stethoscope size={18} />} />
              <Card>
                <p className={s.homeEmptyLine}>Accede a tu panel profesional.</p>
                <Button label="Abrir herramientas" variant="secondary" fullWidth={false} onPress={goTools} />
              </Card>
            </section>
          )}

          {/* Alerta si hay mascotas sin vacunas */}
          {pets.some((p: { is_vaccinated?: boolean }) => p.is_vaccinated === false) && (
            <section>
              <Card>
                <div className={s.homeAlert}>
                  <AlertTriangle size={18} />
                  <div>
                    <p className={s.homePetName}>Vacunas pendientes</p>
                    <p className={s.homePetMeta}>Alguna de tus mascotas necesita vacunas.</p>
                  </div>
                </div>
              </Card>
            </section>
          )}
        </aside>
      </div>
    </ScreenContainer>
  );
}
