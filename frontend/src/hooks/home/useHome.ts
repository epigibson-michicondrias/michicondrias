/**
 * useHome — Inicio (`(app)/inicio`): mascotas, próximas citas y atajos por rol.
 * Espejo de `mobile/src/hooks/home/useHome.ts`.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Stethoscope, Sparkles, AlertTriangle, Heart } from 'lucide-react';
import type { ComponentType } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPets } from '@/services/mascotas';
import { getUserAppointments } from '@/services/citas';
import { normalizeRole, isProRole } from '@/constants/roles';
import { getHomeTools, ROLE_PANEL_TITLE } from '@/constants/roleTools';

export interface QuickAction {
  title: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  route?: string;
}

const OWNER_ACTIONS: QuickAction[] = [
  { title: 'Veterinarios', icon: Stethoscope, color: 'var(--color-info)', route: '/directorio' },
  { title: 'Diagnóstico IA', icon: Sparkles, color: 'var(--color-secondary)', route: '/mascotas/diagnostico-ia' },
  { title: 'Perdidas', icon: AlertTriangle, color: 'var(--color-error)', route: '/perdidas' },
  { title: 'Adopciones', icon: Heart, color: 'var(--color-accent)', route: '/adopciones' },
];

export const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--color-warning)',
  scheduled: 'var(--color-warning)',
  confirmed: 'var(--color-success)',
  completed: 'var(--color-info)',
  cancelled: 'var(--color-error)',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Por confirmar',
  scheduled: 'Por confirmar',
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
  const role = normalizeRole(user?.role_name);

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

  const [now] = useState(() => Date.now());
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const t = new Date(a.appointment_date).getTime();
        return !isNaN(t) && t >= now && a.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 3);
  }, [appointments, now]);

  const tools = getHomeTools(role);
  const quickActions: QuickAction[] =
    tools.length > 0
      ? tools.map((t) => ({ title: t.label, icon: t.icon, color: t.color, route: t.route }))
      : OWNER_ACTIONS;

  return {
    user,
    role,
    greetingName: user?.full_name?.split(' ')[0] || '',
    pets,
    petsLoading,
    upcomingAppointments,
    appointmentsLoading,
    quickActions,
    panelTitle: ROLE_PANEL_TITLE[role] || 'Tu espacio',
    isPro: isProRole(role) || role === 'admin',
    goTools: () => router.push('/menu'),
  };
}

export type { Appointment } from '@/services/citas';
