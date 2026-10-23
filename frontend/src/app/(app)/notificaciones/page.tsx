"use client";

/**
 * Notificaciones — espejo de `mobile/app/notificaciones.tsx`. Lista con badge de no leídas,
 * marcar como leídas y navegación según `resolveNotificationRoute`.
 */
import {
  Bell,
  Calendar,
  Car,
  CheckCheck,
  ChevronRight,
  FlaskConical,
  Flower2,
  Heart,
  MapPin,
  Package,
  Pill,
  Shield,
  ShieldCheck,
  Stethoscope,
  Syringe,
} from "lucide-react";
import type { ComponentType } from "react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { useNotifications, formatTimeAgo } from "@/hooks/notifications/useNotifications";
import type { Notification } from "@/types/notifications";
import s from "./notificaciones.module.css";

type IconComp = ComponentType<{ size?: number; color?: string }>;
type ThemeColorKey = "primary" | "secondary" | "accent" | "error" | "success" | "info" | "textMuted";

const THEME_COLORS: Record<ThemeColorKey, string> = {
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
  error: "var(--color-error)",
  success: "var(--color-success)",
  info: "var(--color-info)",
  textMuted: "var(--color-text-muted)",
};

/** Ícono y color por tipo de notificación que emite el backend. */
const TYPE_CONFIG: Record<string, { icon: IconComp; color: ThemeColorKey }> = {
  general: { icon: Heart, color: "secondary" }, // adopciones
  alert: { icon: MapPin, color: "error" }, // mascotas perdidas
  citas: { icon: Calendar, color: "primary" },
  cirugias: { icon: Stethoscope, color: "primary" },
  recetas: { icon: Pill, color: "success" }, // dosis de medicamento (F14)
  vacunas: { icon: Syringe, color: "info" }, // refuerzos de vacuna (F14)
  kyc: { icon: ShieldCheck, color: "success" },
  seguros: { icon: Shield, color: "info" },
  laboratorio: { icon: FlaskConical, color: "success" },
  funeraria: { icon: Flower2, color: "textMuted" },
  transportistas: { icon: Car, color: "primary" },
  store: { icon: Package, color: "accent" },
};
const DEFAULT_CONFIG = { icon: Bell, color: "accent" as ThemeColorKey };

function NotificationRow({
  item,
  hasRoute,
  onOpen,
}: {
  item: Notification;
  hasRoute: boolean;
  onOpen: () => void;
}) {
  const config = TYPE_CONFIG[item.type] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const color = THEME_COLORS[config.color];
  const label = `${item.is_read ? "" : "No leída. "}${item.title}. ${item.message}`;

  return (
    <button
      type="button"
      className={`${s.notifCard} ${item.is_read ? s.notifCardRead : ""}`}
      onClick={onOpen}
      disabled={item.is_read && !hasRoute}
      aria-label={label}
      aria-description={item.is_read ? undefined : "Toca para marcarla como leída"}
    >
      <span className={s.iconBox}>
        <Icon size={18} color={color} />
      </span>
      <span className={s.notifContent}>
        <span className={s.notifHeader}>
          <span className={s.notifTitle}>{item.title}</span>
          {!item.is_read && <span className={s.unreadDot} aria-hidden />}
        </span>
        <span className={s.notifMessage}>{item.message}</span>
        <span className={s.notifTime}>{formatTimeAgo(item.created_at)}</span>
      </span>
      {hasRoute && <ChevronRight size={16} className={s.chevron} aria-hidden />}
    </button>
  );
}

export default function NotificacionesPage() {
  const { notifications, isLoading, isError, unreadCount, getRoute, openNotification, handleMarkAllAsRead, isMarkingAll } =
    useNotifications();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Notificaciones"
        actions={
          unreadCount > 0
            ? [
                {
                  icon: CheckCheck,
                  label: "Marcar todas como leídas",
                  onPress: handleMarkAllAsRead,
                  loading: isMarkingAll,
                },
              ]
            : undefined
        }
      />
      {isLoading ? (
        <SkeletonList count={4} />
      ) : notifications.length === 0 ? (
        // Si falló la carga, el aviso con "Reintentar" de ScreenContainer basta: "sin notificaciones" sería falso
        isError ? null : (
          <EmptyState
            icon={<Bell size={28} />}
            title="Sin notificaciones"
            subtitle="Aquí verás avisos de tus citas, adopciones, pedidos y más."
          />
        )
      ) : (
        <div className={s.list}>
          {notifications.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              hasRoute={!!getRoute(item)}
              onOpen={() => openNotification(item)}
            />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}
