/**
 * useNotifications — Hook for notifications screen
 * Extracts data fetching from app/notificaciones.tsx
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyNotifications, markNotificationAsRead, Notification } from '@/src/services/notifications';

// ── Constants ──
export const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  lost: { icon: 'MapPin', color: '#ef4444' },
  adoption: { icon: 'Heart', color: '#ec4899' },
  store: { icon: 'Package', color: '#f59e0b' },
  system: { icon: 'ShieldCheck', color: '#10b981' },
  general: { icon: 'Bell', color: '#3b82f6' },
};

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

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    // Data
    notifications,
    isLoading,
    unreadCount,

    // Actions
    handleMarkAsRead,

    // Navigation
    router,
  };
}

