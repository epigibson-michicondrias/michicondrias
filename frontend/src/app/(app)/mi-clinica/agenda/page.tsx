"use client";

/**
 * Agenda de la clínica (`/mi-clinica/agenda`): confirmar, finalizar (y abrir la ficha) o declinar citas.
 * Espejo de `mobile/app/mi-clinica/agenda.tsx`.
 */
import { CheckCircle2, ClipboardList, Clock, MessageSquare, Stethoscope, X } from "lucide-react";
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
import { statusTone } from "@/features/mi-clinica/format";
import { useAgenda } from "@/hooks/clinica/useAgenda";
import s from "@/features/mi-clinica/clinica.module.css";

const TABS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Finalizadas" },
  { key: "cancelled", label: "Canceladas" },
];

export default function AgendaPage() {
  return <Agenda />;
}

function Agenda() {
  const a = useAgenda();
  const filtering = a.filter !== "all" || !!a.searchQuery;

  return (
    <ScreenContainer>
      <ScreenHeader title="Agenda" subtitle="Control de citas recibidas" />

      <div className={s.filters}>
        <SearchBar value={a.searchQuery} onChangeText={a.setSearchQuery} placeholder="Buscar por servicio, paciente o nota..." />
        <div className={s.chips}>
          {TABS.map((t) => (
            <FilterChip key={t.key} label={t.label} active={a.filter === t.key} onPress={() => a.setFilter(t.key)} />
          ))}
        </div>
      </div>

      {a.loadingAppts ? (
        <SkeletonList count={4} />
      ) : a.filtered.length === 0 ? (
        <EmptyState
          icon={<Clock size={28} />}
          title={filtering ? "Sin citas con ese filtro" : "Aún no tienes citas"}
          subtitle={filtering ? "Prueba con otro estado o búsqueda." : "Cuando un dueño agende en tu clínica, la cita aparecerá aquí."}
          actionLabel={filtering ? "Ver todas" : undefined}
          onAction={filtering ? () => { a.setFilter("all"); a.setSearchQuery(""); } : undefined}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {a.filtered.map((item) => {
            const tone = statusTone(item.status);
            const date = new Date(`${item.date}T12:00`);
            const busy = a.actionLoading === item.id;
            return (
              <article key={item.id} className={s.card}>
                <div className={s.cardHead}>
                  <div className={s.dateBox}>
                    <span className={s.dateDay}>{date.getDate()}</span>
                    <span className={s.dateMonth}>{date.toLocaleDateString("es-MX", { month: "short" }).replace(".", "")}</span>
                  </div>
                  <div className={s.cardInfo}>
                    <span className={s.cardTitle}>
                      {item.service_name || "Cita"}
                      {item.is_emergency ? " · Urgencia" : ""}
                    </span>
                    {item.pet_name ? <span className={s.cardSub}>Paciente: {item.pet_name}</span> : null}
                    <span className={s.cardSub}>
                      {item.start_time?.slice(0, 5)} – {item.end_time?.slice(0, 5)}
                    </span>
                  </div>
                  <Badge label={tone.label} color={tone.color} size="sm" />
                </div>

                {item.notes ? (
                  <div className={s.note}>
                    <MessageSquare size={14} />
                    <span>{item.notes}</span>
                  </div>
                ) : null}

                {["pending", "confirmed", "completed"].includes(item.status) ? (
                  <div className={s.actions}>
                    {item.status === "pending" ? (
                      <Button label="Confirmar" icon={<CheckCircle2 size={16} />} size="sm" onPress={() => a.handleConfirm(item.id)} loading={busy} disabled={!!a.actionLoading} />
                    ) : null}
                    {item.status === "confirmed" ? (
                      <Button label="Finalizar y recetar" icon={<Stethoscope size={16} />} size="sm" onPress={() => a.handleComplete(item.id)} loading={busy} disabled={!!a.actionLoading} />
                    ) : null}
                    {["pending", "confirmed"].includes(item.status) ? (
                      <Button label="Declinar" icon={<X size={16} />} size="sm" variant="ghost" onPress={() => a.openCancelModal(item.id)} disabled={!!a.actionLoading} />
                    ) : null}
                    {item.status === "completed" ? (
                      <Button label="Ver ficha" icon={<ClipboardList size={16} />} size="sm" variant="secondary" onPress={() => a.goToRecord(item.id)} />
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={a.cancelModal.visible}
        title="Declinar cita"
        subtitle="El dueño verá el motivo. No se puede deshacer."
        onClose={a.closeCancelModal}
        footer={
          <>
            <Button label="Mantener" variant="secondary" onPress={a.closeCancelModal} />
            <Button
              label="Declinar cita"
              variant="danger"
              onPress={a.handleCancelSubmit}
              loading={!!a.cancelModal.apptId && a.actionLoading === a.cancelModal.apptId}
            />
          </>
        }
      >
        <FormField
          label="Motivo"
          value={a.cancelReason}
          onChangeText={a.setCancelReason}
          placeholder="Ej: el veterinario no estará disponible ese día"
          multiline
        />
      </Modal>
    </ScreenContainer>
  );
}
