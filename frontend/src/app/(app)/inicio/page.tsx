"use client";

/**
 * Inicio — espejo de `mobile/app/(tabs)/index.tsx`: saludo, mascotas, próximas citas y atajos del rol.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronRight, PawPrint, Plus, Sparkles } from "lucide-react";
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
    greetingName, pets, petsLoading, upcomingAppointments, appointmentsLoading,
    quickActions, panelTitle, isPro, goTools,
  } = useHome();
  const router = useRouter();

  return (
    <ScreenContainer>
      <header className={s.homeHeader}>
        <div>
          <p className={s.homeOverline}>{panelTitle}</p>
          <h1 className={s.homeTitle}>
            {greetingName ? `Hola, ${greetingName}` : "Hola"}
          </h1>
          <p className={s.homeSubtitle}>¿Qué necesitas hoy para tus mascotas?</p>
        </div>
        {isPro && (
          <Button label="Herramientas" variant="secondary" fullWidth={false} onPress={goTools} />
        )}
      </header>

      <section>
        <SectionHeader
          title="Mis mascotas"
          icon={<PawPrint size={18} />}
          actionLabel="Ver todas"
          onAction={() => router.push("/mascotas")}
        />
        {petsLoading ? (
          <div className={s.homeRow}>
            {[0, 1].map((i) => <Skeleton key={i} height={72} borderRadius={12} />)}
          </div>
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
            {pets.slice(0, 4).map((pet) => (
              <Link key={pet.id} href={`/mascotas/${pet.id}`} className={s.homePet}>
                <span className={s.homePetAvatar}>
                  {pet.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pet.photo_url} alt="" width={48} height={48} />
                  ) : (
                    <PawPrint size={20} />
                  )}
                </span>
                <span>
                  <p className={s.homePetName}>{pet.name}</p>
                  <p className={s.homePetMeta}>{pet.breed || pet.species}</p>
                </span>
              </Link>
            ))}
            <button type="button" className={s.homePetAdd} onClick={() => router.push("/mascotas/nuevo")} aria-label="Agregar mascota">
              <Plus size={22} />
            </button>
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          title="Próximas citas"
          icon={<CalendarDays size={18} />}
          actionLabel="Ver citas"
          onAction={() => router.push("/directorio/citas")}
        />
        {appointmentsLoading ? (
          <Skeleton height={64} borderRadius={12} />
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

      <section>
        <SectionHeader title="Atajos" icon={<Sparkles size={18} />} />
        <div className={s.toolGrid}>
          {quickActions.map((action) => (
            <Link key={action.title} href={action.route || "/explorar"} className={s.toolLink}>
              <span className={s.toolDot} style={{ background: action.color }} aria-hidden />
              <action.icon size={18} color={action.color} />
              <span>{action.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </ScreenContainer>
  );
}
