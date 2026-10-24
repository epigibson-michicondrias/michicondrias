"use client";

/**
 * Mis citas de grooming (`/grooming/mis-citas`): próximas e historial, cancelar y reseñar.
 * Espejo de `mobile/app/grooming/mis-citas.tsx`.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Scissors, Calendar, Clock, ChevronRight, Plus, X } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import IconButton from "@/components/IconButton";
import { SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import Button from "@/components/Button";
import ReviewsSection from "@/features/directorio/ReviewsSection";
import { createAppointmentReview } from "@/services/grooming";
import type { GroomingAppointment } from "@/services/grooming";
import { useGroomingClient } from "@/hooks/grooming/useGroomingClient";
import type { AppointmentTab } from "@/hooks/grooming/useGroomingClient";
import l from "../../estilistas/estilistas.module.css";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Programada", color: "var(--color-info)" },
  scheduled: { label: "Programada", color: "var(--color-info)" },
  confirmed: { label: "Confirmada", color: "var(--color-success)" },
  in_progress: { label: "En progreso", color: "var(--color-warning)" },
  completed: { label: "Completada", color: "var(--color-primary)" },
  cancelled: { label: "Cancelada", color: "var(--color-error)" },
};

export default function MisCitasGroomingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    activeTab,
    setActiveTab,
    displayedAppointments,
    appointmentsLoading,
    cancelAppointment,
    cancellingId,
    upcomingAppointments,
    pastAppointments,
  } = useGroomingClient();

  const [reviewing, setReviewing] = useState<GroomingAppointment | null>(null);
  const reviewMutation = useMutation({
    mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment: string }) =>
      createAppointmentReview(id, rating, comment),
    onSuccess: () => {
      setReviewing(null);
      queryClient.invalidateQueries({ queryKey: ["grooming-client-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["grooming-services"] });
      showAlert({
        type: "success",
        title: "¡Gracias por tu reseña!",
        message: "Tu opinión ayuda a otros dueños a elegir estilista.",
      });
    },
    onError: (e: Error) =>
      showAlert({ type: "error", title: "No se pudo enviar", message: e?.message || "Inténtalo de nuevo." }),
  });

  const tabs: { key: AppointmentTab; label: string; count: number }[] = [
    { key: "upcoming", label: "Próximas", count: upcomingAppointments.length },
    { key: "history", label: "Historial", count: pastAppointments.length },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis Citas"
        subtitle="Grooming & Estética"
        actionIcon={Plus}
        actionLabel="Agendar cita"
        onAction={() => router.push("/grooming/agendar")}
      />

      <div className={l.tabsRow} role="tablist" aria-label="Filtro de citas">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${l.tab} ${active ? l.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count > 0 ? <span className={l.tabCount}>{tab.count}</span> : null}
            </button>
          );
        })}
      </div>

      {appointmentsLoading ? (
        <SkeletonList count={3} />
      ) : displayedAppointments.length === 0 ? (
        <EmptyState
          icon={<Scissors size={28} />}
          title={activeTab === "upcoming" ? "No tienes citas próximas" : "Sin historial aún"}
          subtitle={activeTab === "upcoming" ? "Agenda una cita de grooming para tu mascota" : undefined}
          actionLabel={activeTab === "upcoming" ? "Agendar cita" : undefined}
          onAction={activeTab === "upcoming" ? () => router.push("/grooming/agendar") : undefined}
        />
      ) : (
        <div className={l.list}>
          {displayedAppointments.map((item) => {
            const status = STATUS_MAP[item.status || "scheduled"] ?? STATUS_MAP.scheduled;
            const cancellable = ["scheduled", "pending", "confirmed"].includes(item.status || "scheduled");
            return (
              <Card key={item.id}>
                <div className={l.card}>
                  <button
                    type="button"
                    className={l.cardTop}
                    style={{ background: "none", border: 0, padding: 0, cursor: "pointer", width: "100%" }}
                    onClick={() => item.pet_id && router.push(`/grooming/historial/${item.pet_id}`)}
                    aria-label={`Ver historial de ${item.pet_name || "la mascota"}`}
                  >
                    <div className={l.iconBox}>
                      <Scissors size={20} />
                    </div>
                    <div className={l.cardInfo}>
                      <p className={l.cardTitle}>
                        {item.service_type || "Grooming"}
                        {item.pet_name ? ` · ${item.pet_name}` : ""}
                      </p>
                      <div className={l.dateRow}>
                        <Calendar size={13} />
                        <span>{item.date}</span>
                        <Clock size={13} />
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} color="var(--color-text-muted)" aria-hidden />
                  </button>
                  <div className={l.cardActions} style={{ justifyContent: "space-between" }}>
                    <Badge label={status.label} color={status.color} size="sm" />
                    <div className={l.cardActions}>
                      {item.skin_report ? <p className={l.skinReport}>{item.skin_report}</p> : null}
                      {item.status === "completed" ? (
                        item.reviewed ? (
                          <span className={l.metaItem}>Reseñada</span>
                        ) : (
                          <button type="button" className={l.linkBtn} onClick={() => setReviewing(item)}>
                            Calificar
                          </button>
                        )
                      ) : null}
                      {cancellable ? (
                        <button
                          type="button"
                          className={`${l.linkBtn} ${l.linkBtnDanger}`}
                          disabled={cancellingId === item.id}
                          onClick={() =>
                            showAlert({
                              type: "warning",
                              title: "Cancelar cita",
                              message: "¿Quieres cancelar esta cita? El horario quedará libre.",
                              showCancel: true,
                              cancelText: "Volver",
                              buttonText: "Cancelar cita",
                              onButtonPress: () => cancelAppointment(item.id),
                            })
                          }
                        >
                          {cancellingId === item.id ? "Cancelando..." : "Cancelar"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {reviewing ? (
        <div className={l.sheetBackdrop} role="presentation" onClick={() => setReviewing(null)}>
          <div
            className={l.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Calificar servicio"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={l.sheetHeader}>
              <h2 className={l.sheetTitle}>Calificar servicio</h2>
              <IconButton icon={X} accessibilityLabel="Cerrar" onPress={() => setReviewing(null)} variant="subtle" />
            </div>
            <ReviewsSection
              title={
                reviewing.groomer_name
                  ? `¿Cómo fue el servicio de ${reviewing.groomer_name}?`
                  : "¿Cómo fue el servicio?"
              }
              average={0}
              count={0}
              reviews={[]}
              canReview
              submitting={reviewMutation.isPending}
              onSubmit={(rating, comment) => reviewMutation.mutate({ id: reviewing.id, rating, comment })}
              formPrompt="Tu calificación"
            />
            <Button label="Ahora no" variant="ghost" onPress={() => setReviewing(null)} />
          </div>
        </div>
      ) : null}
    </ScreenContainer>
  );
}
