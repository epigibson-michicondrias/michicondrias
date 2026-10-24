"use client";

/**
 * Laboratorio — catálogo de estudios y mis citas.
 * Espejo de `mobile/app/laboratorio/index.tsx`.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FlaskConical,
  Calendar,
  CheckCircle,
  X,
  Clock,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/constants/roles";
import { useLabOrders } from "@/hooks/laboratorio/useLabOrders";
import { formatDate, formatCurrency } from "@/utils/formatters";
import local from "./laboratorio.module.css";

type View = "estudios" | "citas";

function statusBadge(status?: string) {
  if (status === "completed") return <Badge label="Completada" color="var(--color-success)" />;
  if (status === "confirmed") return <Badge label="Confirmada" color="var(--color-info)" />;
  if (status === "cancelled") return <Badge label="Cancelada" color="var(--color-error)" />;
  return <Badge label="Pendiente" color="var(--color-warning)" />;
}

export default function LaboratorioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = normalizeRole(user?.role_name);
  const canManageLab = role === "laboratorio" || role === "admin";
  const [view, setView] = useState<View>("estudios");
  const {
    appointments,
    tests,
    isLoadingAppointments,
    isLoadingTests,
    cancelAppointment,
    isCancelling,
  } = useLabOrders();

  const confirmCancel = (id: string) => {
    showAlert({
      type: "warning",
      title: "¿Cancelar la cita?",
      message: "El laboratorio será notificado.",
      buttonText: "Sí, cancelar",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => cancelAppointment(id),
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Laboratorio"
        subtitle="Estudios clínicos para tu mascota"
        showBack={false}
        actions={
          canManageLab
            ? [
                {
                  icon: FlaskConical,
                  label: "Gestión de laboratorio",
                  onPress: () => router.push("/laboratorio/gestion"),
                },
              ]
            : undefined
        }
      />

      <div className={local.toolbar}>
        <FilterChip label="Estudios" active={view === "estudios"} onPress={() => setView("estudios")} />
        <FilterChip
          label={`Mis citas${appointments.length ? ` (${appointments.length})` : ""}`}
          active={view === "citas"}
          onPress={() => setView("citas")}
        />
      </div>

      {view === "estudios" ? (
        isLoadingTests ? (
          <div className={local.grid}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={170} borderRadius={16} />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <EmptyState
            icon={<FlaskConical size={28} />}
            title="Aún no hay estudios disponibles"
            subtitle="Los laboratorios publicarán su catálogo pronto."
          />
        ) : (
          <div className={local.grid}>
            {tests.map((test: Record<string, unknown>) => (
              <Card key={String(test.id)}>
                <div className={local.cardBody}>
                  <div className={local.rowTop}>
                    <span className={local.iconBox} aria-hidden>
                      <FlaskConical size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={local.title}>{String(test.name || "Estudio de laboratorio")}</p>
                      {test.description ? (
                        <p className={local.subtitle}>{String(test.description)}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className={local.metaRow}>
                    <span className={local.priceTag}>{formatCurrency(Number(test.price || 0))}</span>
                    {test.unit ? <Badge label={String(test.unit)} color="var(--color-secondary)" /> : null}
                  </div>
                  <div className={local.actionsRow}>
                    <Button
                      label="Agendar estudio"
                      size="sm"
                      fullWidth={false}
                      onPress={() => router.push(`/laboratorio/agendar?test_id=${String(test.id)}`)}
                      icon={<Calendar size={16} />}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : isLoadingAppointments ? (
        <div className={local.list}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={120} borderRadius={16} />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No tienes citas"
          subtitle="Agenda un estudio del catálogo para tu mascota."
          actionLabel="Ver estudios"
          onAction={() => setView("estudios")}
        />
      ) : (
        <div className={local.list}>
          {appointments.map((appt: Record<string, unknown>) => {
            const id = String(appt.id);
            const canCancel = appt.status === "pending" || appt.status === "confirmed";
            return (
              <Card key={id}>
                <div className={local.cardBody}>
                  <div className={local.rowTop}>
                    <span className={local.iconBox} aria-hidden>
                      <Calendar size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={local.title}>
                        {String(appt.test_name || "Prueba de laboratorio")}
                      </p>
                      <p className={local.subtitle}>
                        {formatDate(String(appt.scheduled_date || "")) || "Sin fecha"}
                        {appt.scheduled_time ? ` · ${String(appt.scheduled_time).slice(0, 5)}` : ""}
                        {appt.pet_name ? ` · ${String(appt.pet_name)}` : ""}
                      </p>
                    </div>
                    {statusBadge(appt.status as string | undefined)}
                  </div>
                  <div className={local.actionsRow}>
                    {canCancel ? (
                      <Button
                        label="Cancelar cita"
                        size="sm"
                        variant="danger"
                        fullWidth={false}
                        loading={isCancelling}
                        onPress={() => confirmCancel(id)}
                        icon={<X size={16} />}
                      />
                    ) : null}
                    {appt.status === "completed" ? (
                      <Badge
                        label="Resultados listos"
                        color="var(--color-success)"
                        icon={<CheckCircle size={12} aria-hidden />}
                      />
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {view === "estudios" && tests.length > 0 ? (
        <div style={{ marginTop: "1.25rem" }}>
          <Button
            label="Mis citas"
            variant="secondary"
            onPress={() => setView("citas")}
            icon={<Clock size={18} />}
          />
        </div>
      ) : null}
    </ScreenContainer>
  );
}
