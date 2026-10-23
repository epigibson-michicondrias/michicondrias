"use client";

/**
 * Mis Reservas funerarias. Espejo de `mobile/app/funeraria/mis-reservas.tsx`.
 */
import { useRouter } from "next/navigation";
import { Calendar, FileText, Plus, Heart } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useFuneraryBooking } from "@/hooks/funerary/useFuneraryBooking";
import { formatDate, formatCurrency, sentenceCase } from "@/utils/formatters";
import local from "../funeraria.module.css";

function statusBadge(status?: string) {
  if (status === "completed") return <Badge label="Completada" color="var(--color-success)" />;
  if (status === "confirmed") return <Badge label="Confirmada" color="var(--color-info)" />;
  if (status === "cancelled") return <Badge label="Cancelada" color="var(--color-error)" />;
  return <Badge label="Pendiente" color="var(--color-warning)" />;
}

export default function MisReservasPage() {
  const router = useRouter();
  const {
    clientBookings,
    isLoadingBookings,
    handleCancel,
    isCancelling,
  } = useFuneraryBooking();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mis Reservas"
        subtitle="Historial de reservas funerarias"
        actions={[
          {
            icon: Plus,
            label: "Reservar servicio",
            onPress: () => router.push("/funeraria/reservar"),
          },
        ]}
      />

      {isLoadingBookings ? (
        <SkeletonList count={3} />
      ) : clientBookings.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Sin reservas"
          subtitle="Aún no tienes reservas de servicios funerarios."
          actionLabel="Reservar servicio"
          onAction={() => router.push("/funeraria/reservar")}
        />
      ) : (
        <div className={local.list}>
          {clientBookings.map((item) => {
            const canCancel = item.status === "pending" || item.status === "confirmed";
            return (
              <Card key={item.id}>
                <div className={local.cardBody}>
                  <div className={local.rowTop}>
                    <span className={local.iconBox} aria-hidden>
                      <Calendar size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={local.title}>{item.service_name || "Servicio funerario"}</p>
                      <p className={local.subtitle}>
                        {item.pet_name ? `Mascota: ${item.pet_name} · ` : ""}
                        {formatDate(item.scheduled_date)}
                        {item.service_price != null ? ` · ${formatCurrency(item.service_price)}` : ""}
                      </p>
                      {item.notes ? <p className={local.subtitle}>{item.notes}</p> : null}
                    </div>
                    {statusBadge(item.status)}
                  </div>
                  <div className={local.actionsRow}>
                    {canCancel ? (
                      <Button
                        label="Cancelar reserva"
                        size="sm"
                        variant="danger"
                        fullWidth={false}
                        loading={isCancelling}
                        onPress={() => handleCancel(item.id)}
                      />
                    ) : (
                      <span className={local.messageDate}>{sentenceCase(item.status)}</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "1.25rem" }}>
        <Button
          label="Ver servicios"
          variant="secondary"
          onPress={() => router.push("/funeraria")}
          icon={<FileText size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}
