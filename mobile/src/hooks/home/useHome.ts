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
import {
  Stethoscope, ShoppingBag, AlertTriangle, Activity,
  Settings, Calendar, UserCheck, ShieldCheck,
  Building, Package, BarChart3, CreditCard, ClipboardList,
  Plus, Clock, Zap, Heart, Shield, Dumbbell, Scissors, Car, FlaskConical
} from 'lucide-react-native';

// ── Types ──
export interface QuickAction {
  title: string;
  icon: any;
  color: string;
  route?: string;
  alert?: string;
}

// ── Constants ──
export const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  consumidor: [
    { title: 'Buscar Vet', icon: Stethoscope, color: '#0ea5e9', route: '/directorio' },
    { title: 'Mis Citas', icon: Calendar, color: '#8b5cf6', route: '/directorio/citas' },
    { title: 'Michi-Shop', icon: ShoppingBag, color: '#ec4899', route: '/tienda' },
    { title: 'Perdidos', icon: AlertTriangle, color: '#ef4444', route: '/perdidas' },
  ],
  veterinario: [
    { title: 'Mi Clínica', icon: Building, color: '#06b6d4', route: '/mi-clinica' },
    { title: 'Agenda', icon: Calendar, color: '#8b5cf6', route: '/mi-clinica/agenda' },
    { title: 'Laboratorio', icon: Activity, color: '#10b981', route: '/mi-clinica/laboratorio' },
    { title: 'Pacientes', icon: ClipboardList, color: '#f59e0b', route: '/mi-clinica/pacientes' },
  ],
  paseador: [
    { title: 'Mis Tareas', icon: Activity, color: '#6366f1', route: '/servicios-pro/gestion' },
    { title: 'Solicitudes', icon: ClipboardList, color: '#10b981', route: '/paseadores/solicitudes' },
    { title: 'Calendario', icon: Calendar, color: '#f59e0b', route: '/paseadores/calendario' },
    { title: 'Perfil Pro', icon: UserCheck, color: '#ec4899', route: '/servicios-pro/perfil' },
  ],
  cuidador: [
    { title: 'Mis Tareas', icon: Activity, color: '#6366f1', route: '/servicios-pro/gestion' },
    { title: 'Solicitudes', icon: ClipboardList, color: '#10b981', route: '/cuidadores/solicitudes' },
    { title: 'Calendario', icon: Calendar, color: '#f59e0b', route: '/cuidadores/calendario' },
    { title: 'Perfil Pro', icon: UserCheck, color: '#ec4899', route: '/servicios-pro/perfil' },
  ],
  admin: [
    { title: 'Panel', icon: ShieldCheck, color: '#7c3aed', route: '/admin' },
    { title: 'Verificaciones', icon: UserCheck, color: '#8b5cf6', route: '/admin/verificaciones' },
    { title: 'Analíticas', icon: BarChart3, color: '#0ea5e9', route: '/admin/stats' },
    { title: 'Config', icon: Settings, color: '#64748b', route: '/admin/config' },
  ],
  vendedor: [
    { title: 'Mi Tienda', icon: ShoppingBag, color: '#10b981', route: '/tienda/vendedor' },
    { title: 'Pedidos', icon: Package, color: '#f59e0b', route: '/tienda/vendedor/ordenes' },
    { title: 'Productos', icon: CreditCard, color: '#8b5cf6', route: '/tienda/vendedor/productos' },
    { title: 'Analíticas', icon: BarChart3, color: '#0ea5e9', route: '/tienda/vendedor/analytics' },
  ],
  aseguradora: [
    { title: 'Planes', icon: Shield, color: '#0ea5e9', route: '/aseguradoras/gestion' },
    { title: 'Reclamos', icon: ClipboardList, color: '#f59e0b', route: '/aseguradoras/reclamos' },
  ],
  funeraria: [
    { title: 'Gestión', icon: Heart, color: '#64748b', route: '/funeraria/gestion' },
    { title: 'Nuevo Servicio', icon: Plus, color: '#10b981', route: '/funeraria/nuevo-servicio' },
    { title: 'Reportar', icon: ClipboardList, color: '#ef4444', route: '/funeraria/reporte-defuncion' },
  ],
  entrenador: [
    { title: 'Cursos', icon: Dumbbell, color: '#8b5cf6', route: '/entrenadores/gestion' },
    { title: 'Nuevo Curso', icon: Plus, color: '#10b981', route: '/entrenadores/nuevo-programa' },
  ],
  estilista: [
    { title: 'Citas', icon: Scissors, color: '#ec4899', route: '/grooming/gestion' },
    { title: 'Nuevo Servicio', icon: Plus, color: '#10b981', route: '/estilistas/nuevo' },
  ],
  laboratorio: [
    { title: 'Órdenes', icon: FlaskConical, color: '#10b981', route: '/laboratorio/gestion' },
  ],
  patrocinador: [
    { title: 'Nueva Campaña', icon: Plus, color: '#10b981', route: '/patrocinadores/nueva-campana' },
    { title: 'Boost Alerta', icon: Zap, color: '#f59e0b', route: '/patrocinadores/boost-alerta' },
    { title: 'Estadísticas', icon: BarChart3, color: '#0ea5e9', route: '/patrocinadores/estadisticas' },
  ],
  transportista: [
    { title: 'Conductor', icon: UserCheck, color: '#6366f1', route: '/transportistas/perfil-conductor' },
    { title: 'Historial', icon: Clock, color: '#64748b', route: '/transportistas/historial' },
  ],
};

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

  const rawRole = user?.role_name || '';
  const roleName = rawRole === 'walker' ? 'paseador' :
                   rawRole === 'sitter' ? 'cuidador' :
                   rawRole === 'sponsor' ? 'patrocinador' :
                   rawRole === 'driver' ? 'transportista' :
                   rawRole || 'consumidor';

  const actions = QUICK_ACTIONS[roleName] || QUICK_ACTIONS.consumidor;

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
    actions,

    // Helpers
    handleAction,

    // Navigation
    router,
  };
}
