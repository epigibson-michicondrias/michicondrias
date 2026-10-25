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
import { getTreatments } from '@/services/reminders';
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

  const { data: pets = [], isLoading: petsLoading, isError: petsError } = useQuery({
    queryKey: ['user-pets', user?.id],
    queryFn: () => getUserPets(user!.id),
    enabled: !!user?.id,
  });

  const { data: appointments = [], isLoading: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ['user-appointments'],
    queryFn: getUserAppointments,
    enabled: !!user?.id,
  });

  // Recordatorios de dosis: tratamientos de todas las mascotas
  const petIds = pets.map((p: { id: string }) => p.id).filter(Boolean);
  const { data: allTreatments = [], isLoading: treatmentsLoading } = useQuery({
    queryKey: ['home-treatments', petIds.join(',')],
    queryFn: async () => {
      const lists = await Promise.all(petIds.map((id: string) => getTreatments(id).catch(() => [])));
      return lists.flat();
    },
    enabled: petIds.length > 0,
    select: (data) => data.map((t) => ({
      ...t,
      doses: t.doses.map((d) => ({
        ...d,
        isDue: new Date(d.remind_at).getTime() - Date.now() <= 3_600_000,
        isOverdue: new Date(d.remind_at).getTime() < Date.now(),
        isToday: new Date(d.remind_at).toDateString() === new Date().toDateString(),
      })),
    })),
  });

  // Dosis de hoy (atrasadas + las que caen hoy)
  const todayDoses = useMemo(() => {
    const list: { dose: typeof allTreatments[0]["doses"][0]; treatment: typeof allTreatments[0] }[] = [];
    for (const t of allTreatments) {
      for (const d of t.doses) {
        if (!d.sent && (d.isOverdue || d.isToday)) {
          list.push({ dose: d, treatment: t });
        }
      }
    }
    return list.sort((a, b) => new Date(a.dose.remind_at).getTime() - new Date(b.dose.remind_at).getTime());
  }, [allTreatments]);

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
    petsError,
    upcomingAppointments,
    appointmentsLoading,
    appointmentsError,
    todayDoses,
    treatmentsLoading,
    quickActions,
    panelTitle: ROLE_PANEL_TITLE[role] || 'Tu espacio',
    isPro: isProRole(role) || role === 'admin',
    goTools: () => router.push('/menu'),
  };
}

export type { Appointment } from '@/services/citas';
