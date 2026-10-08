/**
 * useNotifications — lista de notificaciones, marcado de leídas y a dónde lleva cada una.
 * useUnreadNotificationCount — contador para el badge de la campana en Inicio.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { normalizeRole } from '@/src/constants/roles';
import { canAccessRoute } from '@/src/constants/roleTools';
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/src/services/notifications';
import type { Notification } from '@/src/types/notifications';

const NOTIFICATIONS_KEY = ['notifications'] as const;
const UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `Hace ${diffHrs} hora${diffHrs > 1 ? 's' : ''}`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
}

/**
 * Pantalla a la que lleva una notificación. Primero el `link` que manda el backend (si es una ruta interna que el rol
 * puede abrir); si no, se decide por tipo y rol, porque el mismo tipo llega al cliente y al profesional
 * (p. ej. "laboratorio" al dueño y al laboratorio). null = solo informativa.
 */
export function resolveNotificationRoute(notification: Notification, roleName?: string | null): string | null {
  const { link } = notification;
  if (link && link.startsWith('/') && !link.startsWith('//') && canAccessRoute(roleName, link)) return link;
  const role = normalizeRole(roleName);
  switch (notification.type) {
    case 'general': // adopciones
      return role === 'refugio' || role === 'hogar_temporal' ? '/adopciones/solicitudes' : '/adopciones/mis-solicitudes';
    case 'alert':
      return '/perdidas';
    case 'citas':
      return role === 'veterinario' || role === 'hospital' ? '/mi-clinica/agenda' : '/directorio/citas';
    case 'cirugias':
    case 'recetas':
    case 'vacunas':
      return '/mascotas';
    case 'kyc':
      return '/perfil/verificacion';
    case 'seguros':
      return role === 'aseguradora' ? '/aseguradoras/reclamos' : '/aseguradoras/mis-polizas';
    case 'laboratorio':
      if (role === 'laboratorio') return '/laboratorio/gestion';
      if (role === 'veterinario') return '/mi-clinica/laboratorio';
      return '/laboratorio';
    case 'funeraria':
      return role === 'funeraria' ? '/funeraria/gestion' : '/funeraria/mis-reservas';
    case 'transportistas':
      return role === 'transportista' ? '/transportistas/solicitudes' : '/transportistas/mis-viajes';
    case 'store':
      return role === 'vendedor' ? '/tienda/vendedor/ordenes' : '/tienda/compras';
    default:
      return null;
  }
}

/** Badge de la campana: no leídas. Se refresca cada minuto, con pull-to-refresh y al leer notificaciones. */
export function useUnreadNotificationCount() {
  const { user } = useAuth();
  const { data = 0 } = useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: getUnreadNotificationCount,
    enabled: !!user?.id,
    refetchInterval: 60_000,
    staleTime: 15_000,
    // Si falla, simplemente no se muestra el badge: no es motivo para el aviso de error de la pantalla
    meta: { silentError: true },
  });
  return data;
}

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notifications = [], isLoading, isError, refetch } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getMyNotifications,
  });

  /** Aplica "leída" en la caché al instante (lista y badge) y devuelve el estado previo para revertir. */
  const optimisticRead = async (ids: string[] | 'all') => {
    await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
    const previous = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);
    const previousCount = queryClient.getQueryData<number>(UNREAD_COUNT_KEY);
    queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (old) =>
      old?.map((n) => (ids === 'all' || ids.includes(n.id) ? { ...n, is_read: true } : n)) ?? [],
    );
    // El contador se descuenta (no se recalcula con la lista, que el backend corta en 100)
    const newlyRead = ids === 'all' ? Infinity : (previous ?? []).filter((n) => ids.includes(n.id) && !n.is_read).length;
    queryClient.setQueryData<number>(UNREAD_COUNT_KEY, Math.max(0, (previousCount ?? 0) - newlyRead));
    return { previous, previousCount };
  };

  const rollback = (context?: { previous?: Notification[]; previousCount?: number }) => {
    if (context?.previous) queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
    if (context?.previousCount !== undefined) queryClient.setQueryData(UNREAD_COUNT_KEY, context.previousCount);
  };

  // Invalida lista y contador (ambas keys empiezan con 'notifications')
  const refreshAll = () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onMutate: (notificationId: string) => optimisticRead([notificationId]),
    onError: (_err, _id, context) => rollback(context),
    onSettled: refreshAll,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => optimisticRead('all'),
    onError: (_err, _vars, context) => rollback(context),
    onSettled: refreshAll,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getRoute = (notification: Notification) => resolveNotificationRoute(notification, user?.role_name);

  /** Marca como leída y abre su pantalla (si tiene). */
  const openNotification = (notification: Notification) => {
    if (!notification.is_read) markAsReadMutation.mutate(notification.id);
    const route = getRoute(notification);
    if (route) router.push(route as any);
  };

  return {
    notifications,
    isLoading,
    isError,
    refetch,
    unreadCount,
    getRoute,
    openNotification,
    handleMarkAsRead: (id: string) => markAsReadMutation.mutate(id),
    handleMarkAllAsRead: () => { if (unreadCount > 0) markAllMutation.mutate(); },
    isMarkingAll: markAllMutation.isPending,
  };
}
