"use client";

/**
 * Horarios de la clínica (`/mi-clinica/horarios`): semana de atención, días festivos y aviso de urgencias.
 * Espejo de `mobile/app/mi-clinica/horarios.tsx`. Las horas se editan con `<input type="time">` (sin modal).
 */
import { useRouter } from "next/navigation";
import { Calendar, Clock, Globe, Info, Plus, X } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSwitch from "@/components/forms/FormSwitch";
import IconButton from "@/components/IconButton";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import { formatDateMx, toISODate } from "@/features/mi-clinica/format";
import { useSchedule } from "@/hooks/clinica/useSchedule";
import s from "@/features/mi-clinica/clinica.module.css";

export default function HorariosPage() {
  return <Horarios />;
}

function Horarios() {
  const router = useRouter();
  const h = useSchedule();

  if (h.loadingClinics) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Horarios" />
        <SkeletonList count={7} />
      </ScreenContainer>
    );
  }

  if (!h.clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Horarios" />
        <EmptyState
          icon={<Clock size={28} />}
          title="No tienes clínicas registradas"
          subtitle="Registra tu clínica para configurar tu disponibilidad."
          actionLabel="Registrar clínica"
          onAction={() => router.push("/directorio/nuevo")}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Horarios" subtitle="Disponibilidad para agendar citas" />

      <div className={s.form}>
        <div className={s.banner}>
          <Info size={20} />
          <span className={s.muted}>Los dueños solo ven horarios disponibles dentro de estos días y horas.</span>
        </div>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Horario semanal</h2>
          {h.schedule.map((day, index) => (
            <Card key={day.day}>
              <div className={s.cardHead}>
                <span className={s.cardInfo}>
                  <span className={s.strong}>{day.day}</span>
                </span>
                <Badge label={day.isOpen ? "Abierto" : "Cerrado"} color={day.isOpen ? "var(--color-success)" : "var(--color-error)"} size="sm" />
              </div>
              <FormSwitch label={`Atender en ${day.day.toLowerCase()}`} value={day.isOpen} onChange={(v) => h.updateDaySchedule(index, "isOpen", v)} />
              {day.isOpen ? (
                <div className={s.row2}>
                  <label className={s.field}>
                    <span className={s.fieldLabel}>Apertura</span>
                    <input type="time" className={s.input} value={day.openTime} onChange={(e) => h.updateDaySchedule(index, "openTime", e.target.value)} />
                  </label>
                  <label className={s.field}>
                    <span className={s.fieldLabel}>Cierre</span>
                    <input type="time" className={s.input} value={day.closeTime} onChange={(e) => h.updateDaySchedule(index, "closeTime", e.target.value)} />
                  </label>
                </div>
              ) : null}
            </Card>
          ))}
        </section>

        <section className={s.section}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>Días festivos y cierres</h2>
            <Button label="Agregar" icon={<Plus size={16} />} size="sm" variant="secondary" fullWidth={false} onPress={() => h.setHolidayModalVisible(true)} />
          </div>
          {h.holidays.length === 0 ? (
            <div className={s.dashed}>No has registrado días festivos ni cierres.</div>
          ) : (
            h.holidays.map((hol) => (
              <div key={hol.id} className={s.subCard}>
                <div className={s.subCardHead}>
                  <Calendar size={16} />
                  <span>
                    {hol.name} · <span className={s.muted}>{formatDateMx(hol.date)}</span>
                  </span>
                  <IconButton icon={X} accessibilityLabel={`Eliminar ${hol.name}`} onPress={() => h.handleDeleteHoliday(hol.id)} color="var(--color-error)" size="sm" />
                </div>
              </div>
            ))
          )}
        </section>

        <Card>
          <div className={s.cardHead}>
            <span className={s.iconBox} style={{ ["--c" as string]: "var(--color-error)" }}>
              <Globe size={20} />
            </span>
            <div className={s.cardInfo}>
              <span className={s.strong}>Urgencias 24/7: {h.clinic.has_emergency ? "activas" : "no ofrecidas"}</span>
              <span className={s.muted}>
                {h.clinic.has_emergency ? `Teléfono: ${h.clinic.phone || "no configurado"} · ` : ""}Se cambia en la configuración de la clínica.
              </span>
            </div>
          </div>
        </Card>

        <Button label="Guardar horarios" onPress={h.handleSaveSchedule} loading={h.loading} disabled={h.loading} size="lg" />
      </div>

      <Modal
        open={h.holidayModalVisible}
        title="Agregar día festivo"
        subtitle="Ese día no se podrán agendar citas."
        onClose={() => h.setHolidayModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => h.setHolidayModalVisible(false)} />
            <Button label="Guardar" onPress={h.handleAddHoliday} loading={h.isAddingException} />
          </>
        }
      >
        <FormField label="Nombre *" value={h.holidayName} onChangeText={h.setHolidayName} placeholder="Ej: Navidad" />
        <label className={s.field}>
          <span className={s.fieldLabel}>Fecha *</span>
          <input type="date" className={s.input} value={h.holidayDate} min={toISODate(new Date())} onChange={(e) => h.setHolidayDate(e.target.value)} />
        </label>
        <FormField label="Motivo" value={h.holidayReason} onChangeText={h.setHolidayReason} placeholder="Opcional" multiline />
      </Modal>
    </ScreenContainer>
  );
}
