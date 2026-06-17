/**
 * useMenu — Hook for menu screen data and actions
 * Extracts section building, role logic, and sign-out from app/(tabs)/menu.tsx
 */
import { useAuth } from '@/src/contexts/AuthContext';
import { isAdmin } from '@/src/constants/roles';
import { showAlert } from '@/src/components/AppAlert';
import {
    Heart, ShoppingBag,
    Stethoscope, Activity,
    HelpCircle, LogOut, ChevronRight,
    Users, Calendar,
    UserCheck, Crown,
    Building, Package, Briefcase,
    Shield, BarChart3, Settings2,
    Video, ClipboardList, Eye, Handshake,
    Dumbbell, Scissors, Car, Award,
    FlaskConical, Zap, User, Clock, Plus
} from 'lucide-react-native';

export interface MenuItem {
    id: string;
    icon: React.ComponentType<any>;
    label: string;
    route: string;
    color: string;
    desc: string;
}

export interface MenuSection {
    title: string;
    icon: React.ComponentType<any>;
    data: MenuItem[];
}

export interface BannerProps {
    title: string;
    sub: string;
    route: string;
    colors: [string, string];
    icon: React.ComponentType<any>;
}

export function useMenu() {
    const { user, signOut } = useAuth();
    const isUserAdmin = isAdmin(user?.role_id, user?.role_name);

    const handleSignOut = () => {
        showAlert({
            type: 'warning',
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que quieres cerrar sesión?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Cerrar Sesión',
            onButtonPress: () => signOut(),
        });
    };

    // Normalize roles to handle API/DB role names properly
    const rawRole = user?.role_name || '';
    const roleName = rawRole === 'walker' ? 'paseador' :
                     rawRole === 'sitter' ? 'cuidador' :
                     rawRole === 'sponsor' ? 'patrocinador' :
                     rawRole === 'driver' ? 'transportista' :
                     rawRole;

    // ── PRO TOOLS (only for professional roles) ──────────────────────
    const isProfessional = roleName !== 'consumidor' && roleName !== 'admin' && !!roleName;

    const PRO_SECTIONS: MenuSection[] = isProfessional
        ? [
              {
                  title: 'Herramientas Pro',
                  icon: Briefcase,
                  data: [
                      ...(roleName === 'veterinario'
                          ? [
                                { id: 'directorio-v', icon: Stethoscope, label: 'Mi Directorio', route: '/directorio/nuevo', color: '#06b6d4', desc: 'Gestionar lugares' },
                                { id: 'citas-v', icon: Calendar, label: 'Agenda Citas', route: '/directorio/citas', color: '#10b981', desc: 'Pacientes y horarios' },
                                { id: 'telemedicina-v', icon: Video, label: 'Videoconsultas', route: '/mi-clinica/consultas-video', color: '#6366f1', desc: 'Pacientes virtuales' },
                            ]
                          : []),
                      ...(roleName === 'hospital'
                          ? [
                                { id: 'h-clinicas', icon: Building, label: 'Mis Clínicas', route: '/mi-clinica/sucursales', color: '#06b6d4', desc: 'Sucursales y sedes' },
                                { id: 'h-vets', icon: Users, label: 'Asociar Médicos', route: '/mi-clinica/veterinarios', color: '#10b981', desc: 'Gestionar veterinarios' },
                            ]
                          : []),
                      ...(roleName === 'refugio'
                          ? [
                                { id: 'ref-publicaciones', icon: Heart, label: 'Mis Mascotas', route: '/adopciones/mis-publicaciones', color: '#ec4899', desc: 'Gestionar publicaciones' },
                                { id: 'ref-solicitudes', icon: ClipboardList, label: 'Solicitudes Recibidas', route: '/adopciones/solicitudes', color: '#10b981', desc: 'Ver solicitudes' },
                                { id: 'ref-aplicaciones', icon: ClipboardList, label: 'Postulaciones de Adopción', route: '/adopciones/refugio/aplicaciones', color: '#8b5cf6', desc: 'Revisar postulaciones' },
                            ]
                          : []),
                      ...(roleName === 'vendedor'
                          ? [
                                { id: 'v-pedidos', icon: Package, label: 'Pedidos Recibidos', route: '/tienda/vendedor/ordenes', color: '#10b981', desc: 'Gestión de ventas' },
                            ]
                          : []),
                      ...(roleName === 'paseador' || roleName === 'cuidador'
                          ? [
                                { id: 'p-servicios', icon: Activity, label: 'Mis Servicios', route: '/servicios-pro', color: '#6366f1', desc: 'Perfil profesional' },
                                { id: 'p-tareas', icon: Activity, label: 'Mis Tareas', route: '/servicios-pro/gestion', color: '#10b981', desc: 'Servicios activos' },
                                { id: 'p-solicitudes', icon: ClipboardList, label: 'Solicitudes', route: roleName === 'paseador' ? '/paseadores/solicitudes' : '/cuidadores/solicitudes', color: '#f59e0b', desc: 'Solicitudes entrantes' },
                                { id: 'p-calendario', icon: Calendar, label: 'Calendario', route: roleName === 'paseador' ? '/paseadores/calendario' : '/cuidadores/calendario', color: '#8b5cf6', desc: 'Mi agenda' },
                            ]
                          : []),
                      ...(roleName === 'aseguradora'
                          ? [
                                { id: 'aseg-gestion', icon: Shield, label: 'Gestión de Planes', route: '/aseguradoras/gestion', color: '#0ea5e9', desc: 'Ver y crear planes' },
                                { id: 'aseg-reclamos', icon: ClipboardList, label: 'Reclamos Recibidos', route: '/aseguradoras/reclamos', color: '#f59e0b', desc: 'Ver reclamos de pólizas' },
                            ]
                          : []),
                      ...(roleName === 'funeraria'
                          ? [
                                { id: 'fun-gestion', icon: Heart, label: 'Gestión Funeraria', route: '/funeraria/gestion', color: '#64748b', desc: 'Gestionar servicios y memoriales' },
                                { id: 'fun-nuevo', icon: Plus, label: 'Nuevo Servicio', route: '/funeraria/nuevo-servicio', color: '#10b981', desc: 'Crear paquete funerario' },
                                { id: 'fun-reporte', icon: ClipboardList, label: 'Reportar Defunción', route: '/funeraria/reporte-defuncion', color: '#ef4444', desc: 'Registrar un fallecimiento' },
                            ]
                          : []),
                      ...(roleName === 'entrenador'
                          ? [
                                { id: 'ent-gestion', icon: Dumbbell, label: 'Gestión de Cursos', route: '/entrenadores/gestion', color: '#8b5cf6', desc: 'Mis cursos y alumnos' },
                                { id: 'ent-nuevo', icon: Plus, label: 'Nuevo Programa', route: '/entrenadores/nuevo-programa', color: '#10b981', desc: 'Crear curso de adiestramiento' },
                            ]
                          : []),
                      ...(roleName === 'estilista'
                          ? [
                                { id: 'groom-gestion', icon: Scissors, label: 'Gestión Estilista', route: '/grooming/gestion', color: '#ec4899', desc: 'Agenda y citas de estética' },
                                { id: 'groom-nuevo', icon: Plus, label: 'Ofrecer Servicio', route: '/estilistas/nuevo', color: '#10b981', desc: 'Registrar nuevo tipo de grooming' },
                            ]
                          : []),
                      ...(roleName === 'laboratorio'
                          ? [
                                { id: 'lab-gestion', icon: Activity, label: 'Gestión de Órdenes', route: '/laboratorio/gestion', color: '#10b981', desc: 'Registrar resultados y análisis' },
                            ]
                          : []),
                      ...(roleName === 'patrocinador'
                          ? [
                                { id: 'spons-campana', icon: Award, label: 'Nueva Campaña', route: '/patrocinadores/nueva-campana', color: '#10b981', desc: 'Crear campaña publicitaria' },
                                { id: 'spons-boost', icon: Zap, label: 'Boost de Alerta', route: '/patrocinadores/boost-alerta', color: '#f59e0b', desc: 'Promocionar reportes perdidos' },
                                { id: 'spons-stats', icon: BarChart3, label: 'Estadísticas', route: '/patrocinadores/estadisticas', color: '#0ea5e9', desc: 'Impacto de publicidad' },
                            ]
                          : []),
                      ...(roleName === 'transportista'
                          ? [
                                { id: 'trans-conductor', icon: User, label: 'Perfil de Conductor', route: '/transportistas/perfil-conductor', color: '#6366f1', desc: 'Ajustes del conductor' },
                                { id: 'trans-historial', icon: Clock, label: 'Historial de Viajes', route: '/transportistas/historial', color: '#64748b', desc: 'Viajes realizados y activos' },
                            ]
                          : []),
                  ],
              },
          ]
        : [];

    // ── ADMIN TOOLS (only for admin) ─────────────────────────────────
    const ADMIN_SECTIONS: MenuSection[] = isUserAdmin
        ? [
              {
                  title: 'Administración',
                  icon: Shield,
                  data: [
                      { id: 'admin-stats', icon: BarChart3, label: 'Analíticas', route: '/admin/stats', color: '#10b981', desc: 'Rendimiento global' },
                      { id: 'admin-config', icon: Settings2, label: 'Configuración', route: '/admin/config', color: '#64748b', desc: 'Ajustes del sistema' },
                      { id: 'admin-users', icon: Users, label: 'Usuarios', route: '/admin/usuarios', color: '#3b82f6', desc: 'Gestión de cuentas' },
                      { id: 'admin-roles', icon: UserCheck, label: 'Roles', route: '/admin/roles', color: '#8b5cf6', desc: 'Permisos y accesos' },
                      { id: 'admin-mod', icon: Eye, label: 'Moderación', route: '/admin/moderacion', color: '#ef4444', desc: 'Contenido reportado' },
                      { id: 'admin-kyc', icon: Shield, label: 'Verificaciones KYC', route: '/admin/verificaciones', color: '#f59e0b', desc: 'Identidad profesional' },
                  ],
              },
          ]
        : [];

    // ── SOPORTE (visible for all) ────────────────────────────────────
    const SUPPORT_SECTIONS: MenuSection[] = [
        {
            title: 'Soporte',
            icon: HelpCircle,
            data: [
                { id: 'ayuda', icon: HelpCircle, label: 'Centro de Ayuda', route: '/ayuda', color: '#64748b', desc: 'Soporte y FAQ' },
                { id: 'partner', icon: Handshake, label: 'Ser Profesional', route: '/perfil/partner', color: '#7c3aed', desc: 'Únete como partner' },
            ],
        },
    ];

    // ── SERVICES (visible for all) ──────────────────────────────────
    const SERVICES_SECTIONS: MenuSection[] = [
        {
            title: 'Servicios',
            icon: Briefcase,
            data: [
                { id: 'aseguradoras', icon: Shield, label: 'Aseguradoras', route: '/aseguradoras', color: '#0ea5e9', desc: 'Seguros para mascotas' },
                { id: 'entrenadores', icon: Dumbbell, label: 'Entrenadores', route: '/entrenadores', color: '#8b5cf6', desc: 'Adiestramiento canino' },
                { id: 'establecimientos', icon: Building, label: 'Establecimientos', route: '/establecimientos', color: '#f59e0b', desc: 'Lugares y comercios' },
                { id: 'estilistas', icon: Scissors, label: 'Estilistas', route: '/estilistas', color: '#ec4899', desc: 'Peluquería canina' },
                { id: 'funeraria', icon: Heart, label: 'Funeraria', route: '/funeraria', color: '#64748b', desc: 'Servicios funerarios' },
                { id: 'laboratorio', icon: FlaskConical, label: 'Laboratorios', route: '/laboratorio', color: '#10b981', desc: 'Análisis clínicos y resultados' },
                { id: 'patrocinadores', icon: Award, label: 'Patrocinadores', route: '/patrocinadores', color: '#10b981', desc: 'Aliados comerciales' },
                { id: 'transportistas', icon: Car, label: 'Transportistas', route: '/transportistas', color: '#6366f1', desc: 'Transporte de mascotas' },
            ],
        },
    ];

    // ── All sections combined ────────────────────────────────────────
    const allSections = [...SERVICES_SECTIONS, ...PRO_SECTIONS, ...ADMIN_SECTIONS, ...SUPPORT_SECTIONS];

    // ── Role-based quick-access banner ───────────────────────────────
    const getBannerProps = (): BannerProps | null => {
        if (isUserAdmin) {
            return { title: 'Panel Admin', sub: 'Administración global', route: '/admin', colors: ['#7c3aed', '#6d28d9'], icon: Shield };
        } else if (roleName === 'veterinario') {
            return { title: 'Consultorio', sub: 'Operaciones clínicas', route: '/mi-clinica', colors: ['#06b6d4', '#0891b2'], icon: Stethoscope };
        } else if (roleName === 'paseador' || roleName === 'cuidador') {
            return { title: 'Mis Tareas', sub: 'Solicitudes y servicios', route: '/servicios-pro/gestion', colors: ['#6366f1', '#4338ca'], icon: Activity };
        } else if (roleName === 'vendedor') {
            return { title: 'Mi Tienda', sub: 'Gestión de catálogo', route: '/tienda/vendedor', colors: ['#10b981', '#059669'], icon: ShoppingBag };
        }
        return null;
    };

    return {
        // Data
        user,
        isUserAdmin,
        allSections,
        bannerProps: getBannerProps(),

        // Actions
        handleSignOut,
    };
}
