"use client";

/**
 * Gestión Funeraria — solicitudes de reserva y servicios propios.
 * Espejo de `mobile/app/funeraria/gestion.tsx`.
 */
import { useRouter } from "next/navigation";
import { Calendar, Clock, Inbox, PawPrint, Plus, Check, X } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import RoleGuard from "@/components/RoleGuard";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { useFuneraryProvider } from "@/hooks/funerary/useFuneraryProvider";
import { cremationLabel } from "@/services/funerary";
import { formatDate, formatCurrency } from "@/utils/formatters";
import local from "../funeraria.module.css";

function statusBadge(status?: string) {
  if (status === "completed") return <Badge label="Completada" color="var(--color-success)" />;
  if (status === "confirmed") return <Badge label="Confirmada" color="var(--color-info)" />;
  if (status === "cancelled") return <Badge label="Cancelada" color="var(--color-error)" />;
  return <Badge label="Pendiente" color="var(--color-warning)" />;
}

function GestionContent() {
  const router = useRouter();
  const {
    providerBookings,
    isLoadingBookings,
    isRefetching,
    refetchBookings,
    changeBookingStatus,
    isChangingStatus,
    myServices,
    toggleServiceActive,
  } = useFuneraryProvider();

  const confirmReject = (id: string) => {
    showAlert({
      type: "warning",
      title: "¿Rechazar la solicitud?",
      message: "La familia será notificada de la cancelación.",
      buttonText: "Sí, rechazar",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => changeBookingStatus(id, "cancelled"),
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Solicitudes"
        subtitle="Reservas y servicios de tu funeraria"
        actions={[
          {
            icon: Plus,
            label: "Nuevo servicio",
            onPress: () => router.push("/funeraria/nuevo-servicio"),
          },
        ]}
      />

      {isLoadingBookings ? (
        <SkeletonList count={3} />
      ) : providerBookings.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="Sin solicitudes"
          subtitle="Cuando un cliente reserve un servicio aparecerá aquí."
          actionLabel="Crear servicio"
          onAction={() => router.push("/funeraria/nuevo-servicio")}
        />
      ) : (
        <div className={local.list}>
          {providerBookings.map((item) => (
            <Card key={item.id}>
              <div className={local.cardBody}>
                <div className={local.rowTop}>
                  <span className={local.iconBox} aria-hidden>
                    <Calendar size={20} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className={local.title}>{item.service_name || "Servicio funerario"}</p>
                    <p className={local.subtitle}>
                      {item.pet_name ? `Mascota: ${item.pet_name}` : "Mascota no disponible"}
                      {item.scheduled_date ? ` · ${formatDate(item.scheduled_date)}` : ""}
                      {item.service_price != null ? ` · ${formatCurrency(item.service_price)}` : ""}
                    </p>
                    {item.notes ? <p className={local.subtitle}>{item.notes}</p> : null}
                  </div>
                  {statusBadge(item.status)}
                </div>
                <div className={local.actionsRow}>
                  {item.status === "pending" ? (
                    <>
                      <Button
                        label="Confirmar"
                        size="sm"
                        fullWidth={false}
                        loading={isChangingStatus}
                        onPress={() => changeBookingStatus(item.id, "confirmed")}
                        icon={<Check size={16} />}
                      />
                      <Button
                        label="Rechazar"
                        size="sm"
                        variant="danger"
                        fullWidth={false}
                        loading={isChangingStatus}
                        onPress={() => confirmReject(item.id)}
                        icon={<X size={16} />}
                      />
                    </>
                  ) : null}
                  {item.status === "confirmed" ? (
                    <>
                      <Button
                        label="Marcar completada"
                        size="sm"
                        fullWidth={false}
                        loading={isChangingStatus}
                        onPress={() => changeBookingStatus(item.id, "completed")}
                        icon={<Check size={16} />}
                      />
                      <Button
                        label="Cancelar"
                        size="sm"
                        variant="danger"
                        fullWidth={false}
                        loading={isChangingStatus}
                        onPress={() => confirmReject(item.id)}
                        icon={<X size={16} />}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem", color: "var(--color-text)" }}>
          Mis servicios
        </h2>
        {myServices.length === 0 ? (
          <p className={local.subtitle}>Publica tu primer servicio con el botón «Nuevo servicio».</p>
        ) : (
          <div className={local.list}>
            {myServices.map((svc) => (
              <Card key={svc.id}>
                <div className={local.cardBody}>
                  <div className={local.rowTop}>
                    <span className={local.iconBox} aria-hidden>
                      <PawPrint size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className={local.title}>{svc.name}</p>
                      <p className={local.subtitle}>
                        {formatCurrency(svc.price)}
                        {svc.cremation_type ? ` · ${cremationLabel(svc.cremation_type)}` : ""}
                        {svc.urn_included ? " · Urna incluida" : ""}
                        {" · "}
                        {svc.is_active ? "Visible" : "Oculto"}
                      </p>
                    </div>
                  </div>
                  <div className={local.actionsRow}>
                    <Button
                      label={svc.is_active ? "Ocultar" : "Publicar"}
                      size="sm"
                      variant="secondary"
                      fullWidth={false}
                      onPress={() => toggleServiceActive(svc.id, !svc.is_active)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <Button
          label={isRefetching ? "Actualizando…" : "Actualizar solicitudes"}
          variant="ghost"
          onPress={() => refetchBookings()}
          icon={<Clock size={18} />}
        />
      </div>
    </ScreenContainer>
  );
}

export default function GestionFunerariaPage() {
  return (
    <RoleGuard roles={["funeraria"]} message="Esta sección es para cuentas de funeraria.">
      <GestionContent />
    </RoleGuard>
  );
}
