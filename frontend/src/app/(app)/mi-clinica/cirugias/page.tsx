"use client";

/**
 * Quirófano (`/mi-clinica/cirugias`): cirugías programadas, en curso y completadas; agendar nuevas.
 * Espejo de `mobile/app/mi-clinica/cirugias.tsx`.
 */
import { CalendarDays, Clock, HeartPulse, MapPin, Plus } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import DateTimeField from "@/features/mi-clinica/DateTimeField";
import PatientPicker from "@/features/mi-clinica/PatientPicker";
import { useSurgeries } from "@/hooks/clinica/useSurgeries";
import s from "@/features/mi-clinica/clinica.module.css";

const STATUS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Programada", color: "var(--color-info)" },
  "in-progress": { label: "En curso", color: "var(--color-warning)" },
  completed: { label: "Completada", color: "var(--color-success)" },
  cancelled: { label: "Cancelada", color: "var(--color-error)" },
};

const TYPES = [
  { id: "elective", label: "Electiva", color: "var(--color-info)" },
  { id: "preventive", label: "Preventiva", color: "var(--color-success)" },
  { id: "emergency", label: "Emergencia", color: "var(--color-error)" },
];

const TABS = [
  { key: "all", label: "Todas" },
  { key: "scheduled", label: "Programadas" },
  { key: "in-progress", label: "En curso" },
  { key: "completed", label: "Completadas" },
];

export default function CirugiasPage() {
  return <Cirugias />;
}

function Cirugias() {
  const c = useSurgeries();
  const open = () => c.setModalVisible(true);
  const filtering = c.filter !== "all" || !!c.searchQuery;

  return (
    <ScreenContainer>
      <ScreenHeader title="Quirófano" subtitle="Gestión de cirugías" actions={[{ icon: Plus, label: "Agendar cirugía", onPress: open }]} />

      <div className={s.filters}>
        <SearchBar value={c.searchQuery} onChangeText={c.setSearchQuery} placeholder="Buscar cirugía o sala..." />
        <div className={s.chips}>
          {TABS.map((t) => (
            <FilterChip key={t.key} label={t.label} active={c.filter === t.key} onPress={() => c.setFilter(t.key)} />
          ))}
        </div>
      </div>

      {c.isLoading ? (
        <SkeletonList count={3} />
      ) : c.filtered.length === 0 ? (
        <EmptyState
          icon={<HeartPulse size={28} />}
          title={filtering ? "Sin cirugías con ese filtro" : "No hay cirugías programadas"}
          subtitle={filtering ? "Prueba con otro estado o búsqueda." : "Agenda una intervención para verla aquí."}
          actionLabel={filtering ? "Ver todas" : "Agendar cirugía"}
          onAction={filtering ? () => { c.setFilter("all"); c.setSearchQuery(""); } : open}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {c.filtered.map((item, i) => {
            const st = STATUS[item.status] ?? STATUS.scheduled;
            const type = TYPES.find((t) => t.id === item.surgery_type) ?? TYPES[0];
            const d = new Date(item.scheduled_date);
            return (
              <article key={item.id || `surgery-${i}`} className={s.card}>
                <div className={s.cardHead}>
                  <div className={s.cardInfo}>
                    <Badge label={type.label} color={type.color} size="sm" variant="outlined" />
                    <span className={s.cardTitle}>{item.surgery_name}</span>
                    <span className={s.cardSub}>
                      <MapPin size={12} /> {item.operating_room || "Sala por asignar"}
                    </span>
                  </div>
                  <Badge label={st.label} color={st.color} size="sm" />
                </div>
                <div className={s.cardSub}>
                  <CalendarDays size={14} /> {d.toLocaleDateString("es-MX", { day: "numeric", month: "short" })} ·{" "}
                  {d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} · <Clock size={14} /> ~
                  {item.estimated_duration ?? "—"} min
                </div>
                {item.id && (item.status === "scheduled" || item.status === "in-progress") ? (
                  <div className={s.actions}>
                    {item.status === "scheduled" ? (
                      <Button label="Iniciar" size="sm" onPress={() => c.changeStatus(item.id!, "in-progress")} disabled={c.isChangingStatus} />
                    ) : (
                      <Button label="Finalizar" size="sm" onPress={() => c.changeStatus(item.id!, "completed")} disabled={c.isChangingStatus} />
                    )}
                    <Button label="Cancelar cirugía" size="sm" variant="ghost" onPress={() => c.changeStatus(item.id!, "cancelled")} disabled={c.isChangingStatus} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={c.modalVisible}
        title="Agendar cirugía"
        subtitle="Programa una nueva intervención"
        onClose={() => c.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => c.setModalVisible(false)} />
            <Button label="Agendar" onPress={c.handleCreate} loading={c.isCreating} />
          </>
        }
      >
        <FormField label="Procedimiento *" value={c.surgName} onChangeText={c.setSurgName} placeholder="Ej: esterilización de gata, profilaxis" />
        <PatientPicker value={c.selectedPatientId} onChange={c.setSelectedPatientId} label="Paciente" />
        <div className={s.field}>
          <span className={s.fieldLabel}>Tipo de cirugía</span>
          <div className={s.chips}>
            {TYPES.map((t) => (
              <FilterChip key={t.id} label={t.label} color={t.color} active={c.surgType === t.id} onPress={() => c.setSurgType(t.id)} />
            ))}
          </div>
        </div>
        <DateTimeField value={c.surgDate} onChange={c.setSurgDate} min={new Date()} />
        <div className={s.row2}>
          <FormField label="Duración (min)" value={c.surgDuration} onChangeText={(v) => c.setSurgDuration(v.replace(/\D/g, ""))} keyboardType="numeric" placeholder="60" />
          <FormField label="Quirófano" value={c.surgRoom} onChangeText={c.setSurgRoom} placeholder="Opcional" />
        </div>
      </Modal>
    </ScreenContainer>
  );
}
