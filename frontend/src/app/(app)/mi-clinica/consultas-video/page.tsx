"use client";

/**
 * Videoconsultas (`/mi-clinica/consultas-video`): el veterinario inicia y finaliza la sala; el dueño agenda y se une.
 * Espejo de `mobile/app/mi-clinica/consultas-video.tsx`.
 */
import { CalendarDays, Clock, ExternalLink, Plus, Video, VideoOff } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";
import FormSelect from "@/components/forms/FormSelect";
import Modal from "@/components/Modal";
import { SkeletonList } from "@/components/Skeleton";
import DateTimeField from "@/features/mi-clinica/DateTimeField";
import { useVideoConsultations } from "@/hooks/clinica/useVideoConsultations";
import s from "@/features/mi-clinica/clinica.module.css";

const STATUS: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Programada", color: "var(--color-info)" },
  active: { label: "En curso", color: "var(--color-success)" },
  completed: { label: "Finalizada", color: "var(--color-primary)" },
  cancelled: { label: "Cancelada", color: "var(--color-error)" },
};

export default function ConsultasVideoPage() {
  const v = useVideoConsultations();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Videoconsultas"
        actions={!v.isVet ? [{ icon: Plus, label: "Agendar videoconsulta", onPress: v.openBookingModal }] : undefined}
      />

      {v.isLoading ? (
        <SkeletonList count={3} />
      ) : v.consultations.length === 0 ? (
        <EmptyState
          icon={<VideoOff size={28} />}
          title={v.isVet ? "No tienes videoconsultas asignadas" : "No tienes videoconsultas programadas"}
          subtitle={v.isVet ? "Cuando un dueño agende contigo aparecerá aquí." : "Agenda una con tu veterinario sin salir de casa."}
          actionLabel={v.isVet ? undefined : "Agendar videoconsulta"}
          onAction={v.isVet ? undefined : v.openBookingModal}
        />
      ) : (
        <div className={`${s.list} ${s.listWide}`}>
          {v.consultations.map((item) => {
            const st = STATUS[item.status] ?? { label: item.status, color: "var(--color-text-muted)" };
            const d = new Date(item.scheduled_at);
            const canCancel = (item.status === "scheduled" || item.status === "active") && !(v.isVet && item.status === "active");
            return (
              <article key={item.id} className={s.card}>
                <div className={s.cardHead}>
                  <span className={s.iconBox}>
                    <Video size={18} />
                  </span>
                  <div className={s.cardInfo}>
                    <span className={s.cardTitle}>Videoconsulta</span>
                    <span className={s.cardSub}>
                      <CalendarDays size={12} /> {d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })} ·{" "}
                      <Clock size={12} /> {d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <Badge label={st.label} color={st.color} size="sm" />
                </div>
                {item.notes ? (
                  <div className={s.note}>
                    <span>
                      <strong>Síntomas / notas:</strong> {item.notes}
                    </span>
                  </div>
                ) : null}
                <div className={s.actions}>
                  {item.status === "active" && item.room_url ? (
                    <Button label="Unirse al video" icon={<ExternalLink size={16} />} size="sm" onPress={() => v.launchVideoRoom(item.room_url)} />
                  ) : null}
                  {v.isVet && item.status === "scheduled" ? (
                    <Button label="Iniciar sala" size="sm" onPress={() => v.handleStatusUpdate(item.id, "active")} disabled={v.loadingAction} />
                  ) : null}
                  {v.isVet && item.status === "active" ? (
                    <Button label="Finalizar consulta" size="sm" variant="secondary" onPress={() => v.handleStatusUpdate(item.id, "completed")} disabled={v.loadingAction} />
                  ) : null}
                  {canCancel ? (
                    <Button label="Cancelar" size="sm" variant="ghost" onPress={() => v.handleStatusUpdate(item.id, "cancelled")} disabled={v.loadingAction} />
                  ) : null}
                  {item.status === "scheduled" && !v.isVet ? <span className={s.muted}>La sala se abre cuando el veterinario la inicie.</span> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={v.modalVisible}
        title="Agendar videoconsulta"
        onClose={() => v.setModalVisible(false)}
        footer={
          <>
            <Button label="Cancelar" variant="secondary" onPress={() => v.setModalVisible(false)} />
            <Button label="Agendar" onPress={v.handleBook} loading={v.loadingAction} />
          </>
        }
      >
        <FormSelect
          label="Mascota *"
          options={[{ label: "Elige una mascota", value: "" }, ...v.pets.map((p) => ({ label: p.name, value: p.id }))]}
          value={v.selectedPetId}
          onChange={v.setSelectedPetId}
        />
        <FormSelect
          label="Clínica"
          options={[{ label: "Elige una clínica (opcional)", value: "" }, ...v.clinics.map((c) => ({ label: c.name, value: c.id }))]}
          value={v.selectedClinicId}
          onChange={v.setSelectedClinicId}
        />
        {v.selectedClinicId ? (
          <FormSelect
            label="Veterinario"
            options={[
              { label: "Elige un veterinario (opcional)", value: "" },
              ...v.vets.map((vet) => ({ label: `${vet.first_name} ${vet.last_name || ""}`.trim(), value: vet.id })),
            ]}
            value={v.selectedVetId}
            onChange={v.setSelectedVetId}
          />
        ) : null}
        <DateTimeField value={v.scheduledAt} onChange={v.setScheduledAt} min={new Date()} />
        <FormField label="Síntomas o motivo" value={v.notes} onChangeText={v.setNotes} placeholder="Cuéntale al veterinario qué le pasa a tu mascota" multiline />
      </Modal>
    </ScreenContainer>
  );
}
