/**
 * useHome — Hook for home dashboard screen
 * Extracts data fetching, role-based actions, and handlers from app/(tabs)/index.tsx
 */
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { getUserPets } from '@/src/services/mascotas';
import { getUserAppointments } from '@/src/services/citas';
import { normalizeRole, isProRole } from '@/src/constants/roles';
import { getHomeTools, ROLE_PANEL_TITLE } from '@/src/constants/roleTools';
import { useUnreadNotificationCount } from '@/src/hooks/notifications/useNotifications';
import { Stethoscope, ShoppingBag, AlertTriangle, Calendar } from 'lucide-react-native';

// ── Types ──
export interface QuickAction {
  title: string;
  icon: any;
  color: string;
  route?: string;
  alert?: string;
}

// ── Constants ──
/** Atajos de dueño de mascota en Inicio (las herramientas de cada rol salen de ROLE_TOOLS en roleTools.ts). */
const OWNER_ACTIONS: QuickAction[] = [
  { title: 'Buscar Vet', icon: Stethoscope, color: '#0ea5e9', route: '/directorio' },
  { title: 'Mis Citas', icon: Calendar, color: '#8b5cf6', route: '/directorio/citas' },
  { title: 'Michi-Shop', icon: ShoppingBag, color: '#ec4899', route: '/tienda' },
  { title: 'Perdidos', icon: AlertTriangle, color: '#ef4444', route: '/perdidas' },
];

export const STATUS_COLORS: Record<string, string> = {
  scheduled: '#f59e0b',
  confirmed: '#10b981',
  completed: '#3b82f6',
  cancelled: '#ef4444',
};

export const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} · ${hours}:${mins}`;
}

export function useHome() {
  const router = useRouter();
  const { user } = useAuth();

  // ── Data queries ──
  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['user-appointments'],
    queryFn: getUserAppointments,
    enabled: !!user?.id,
  });

  // Only upcoming (scheduled / confirmed), sorted soonest first, max 3
  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'scheduled' || a.status === 'confirmed')
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 3),
    [appointments],
  );

  const unreadNotifications = useUnreadNotificationCount();

  const roleName = normalizeRole(user?.role_name);
  const isPro = isProRole(roleName);
  const isUserAdmin = roleName === 'admin';

  // Panel propio del rol (atajos a sus herramientas) + atajos de dueño de mascota para todos
  const roleTools = useMemo(() => getHomeTools(roleName), [roleName]);
  const panelTitle = ROLE_PANEL_TITLE[roleName];
  const actions = OWNER_ACTIONS;

  // Estado del alta profesional (solo para cuentas consumidor)
  const proOnboarding: 'none' | 'pending' | 'approved' | 'rejected' =
    roleName !== 'consumidor' ? 'none'
    : user?.verification_status === 'PENDING' ? 'pending'
    : user?.verification_status === 'VERIFIED' ? 'approved'
    : user?.verification_status === 'REJECTED' ? 'rejected'
    : 'none';

  // ── Handlers ──
  const handleAction = useCallback(
    (action: QuickAction) => {
      if (action.alert) {
        showAlert({ type: 'info', title: 'Michicondrias', message: action.alert });
      } else if (action.route) {
        router.push(action.route as any);
      }
    },
    [router],
  );

  return {
    // User
    user,

    // Data
    pets,
    petsLoading,
    upcomingAppointments,
    appointmentsLoading,
    unreadNotifications,
    actions,
    roleName,
    isPro,
    isUserAdmin,
    roleTools,
    panelTitle,
    proOnboarding,

    // Helpers
    handleAction,

    // Navigation
    router,
  };
}
