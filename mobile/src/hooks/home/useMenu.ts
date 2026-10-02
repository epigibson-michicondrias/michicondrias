/**
 * useMenu — datos de la pestaña "Más" (Herramientas).
 * Más YA NO duplica Explorar: contiene solo (1) herramientas profesionales del rol, (2) administración,
 * (3) alta profesional / verificación y (4) soporte. Todo sale de roleTools.ts.
 */
import { useAuth } from '@/src/contexts/AuthContext';
import { normalizeRole, isProRole } from '@/src/constants/roles';
import { getRoleTools, getRouteRule } from '@/src/constants/roleTools';
import { showAlert } from '@/src/components/AppAlert';
import {
    HelpCircle, Shield, Briefcase, Handshake, ShieldCheck, Bell, Lock, Palette, Stethoscope, ShoppingBag, Activity,
    Building, Heart, Dumbbell, Scissors, FlaskConical, Award, Car, Store, ClipboardList,
} from 'lucide-react-native';

export interface MenuItem {
    id: string;
    icon: React.ComponentType<any>;
    label: string;
    route: string;
    color: string;
    desc: string;
    badge?: string;
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

const BANNERS: Record<string, BannerProps> = {
    admin: { title: 'Panel Admin', sub: 'Administración global', route: '/admin', colors: ['#7c3aed', '#6d28d9'], icon: Shield },
    veterinario: { title: 'Consultorio', sub: 'Operaciones clínicas', route: '/mi-clinica', colors: ['#06b6d4', '#0891b2'], icon: Stethoscope },
    hospital: { title: 'Mi clínica', sub: 'Sedes, médicos y agenda', route: '/mi-clinica', colors: ['#0ea5e9', '#0369a1'], icon: Building },
    paseador: { title: 'Mis tareas', sub: 'Solicitudes y servicios', route: '/servicios-pro/gestion', colors: ['#6366f1', '#4338ca'], icon: Activity },
    cuidador: { title: 'Mis tareas', sub: 'Solicitudes y servicios', route: '/servicios-pro/gestion', colors: ['#6366f1', '#4338ca'], icon: Activity },
    vendedor: { title: 'Mi tienda', sub: 'Catálogo, pedidos y ventas', route: '/tienda/vendedor', colors: ['#10b981', '#059669'], icon: ShoppingBag },
    refugio: { title: 'Mis publicaciones', sub: 'Adopciones y solicitudes', route: '/adopciones/mis-publicaciones', colors: ['#ec4899', '#be185d'], icon: Heart },
    hogar_temporal: { title: 'Mis publicaciones', sub: 'Adopciones y solicitudes', route: '/adopciones/mis-publicaciones', colors: ['#ec4899', '#be185d'], icon: Heart },
    aseguradora: { title: 'Mis planes', sub: 'Planes y reclamos', route: '/aseguradoras/gestion', colors: ['#0ea5e9', '#0369a1'], icon: Shield },
    funeraria: { title: 'Gestión funeraria', sub: 'Servicios y memoriales', route: '/funeraria/gestion', colors: ['#64748b', '#334155'], icon: Heart },
    entrenador: { title: 'Mis cursos', sub: 'Programas y alumnos', route: '/entrenadores/gestion', colors: ['#8b5cf6', '#6d28d9'], icon: Dumbbell },
    estilista: { title: 'Mi agenda', sub: 'Citas de estética', route: '/grooming/gestion', colors: ['#ec4899', '#be185d'], icon: Scissors },
    laboratorio: { title: 'Órdenes', sub: 'Resultados y análisis', route: '/laboratorio/gestion', colors: ['#10b981', '#047857'], icon: FlaskConical },
    patrocinador: { title: 'Mis campañas', sub: 'Impacto y estadísticas', route: '/patrocinadores/estadisticas', colors: ['#f59e0b', '#b45309'], icon: Award },
    transportista: { title: 'Mis viajes', sub: 'Solicitudes y conductor', route: '/transportistas/solicitudes', colors: ['#6366f1', '#4338ca'], icon: Car },
    establecimiento: { title: 'Mi establecimiento', sub: 'Locales pet-friendly', route: '/establecimientos', colors: ['#f59e0b', '#b45309'], icon: Store },
};

export function useMenu() {
    const { user, signOut } = useAuth();
    const roleName = normalizeRole(user?.role_name);
    const isUserAdmin = roleName === 'admin';
    const isProfessional = isProRole(roleName);

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

    const tools = getRoleTools(roleName);
    // Defensa: nunca mostrar una herramienta que el rol no puede abrir
    const toItems = (): MenuItem[] =>
        tools
            .filter((t) => { const r = getRouteRule(t.route); return !r || r.roles.map(normalizeRole).includes(roleName) || isUserAdmin; })
            .map((t) => ({ id: t.id, icon: t.icon, label: t.label, route: t.route, color: t.color, desc: t.desc }));

    const sections: MenuSection[] = [];

    if (isUserAdmin) {
        sections.push({ title: 'Administración', icon: Shield, data: toItems() });
    } else if (isProfessional) {
        sections.push({ title: 'Herramientas Pro', icon: Briefcase, data: toItems() });
    }

    // Cuenta profesional / verificación
    const vs = user?.verification_status;
    const accountItems: MenuItem[] = [];
    if (!isUserAdmin && !isProfessional) {
        accountItems.push({
            id: 'partner', icon: Handshake, label: 'Ser Profesional', route: '/perfil/partner', color: '#7c3aed',
            desc: vs === 'VERIFIED' ? 'Identidad aprobada: activa tu cuenta' : vs === 'PENDING' ? 'Documentos en revisión' : 'Ofrece tus servicios en Michicondrias',
            badge: vs === 'VERIFIED' ? 'Listo' : vs === 'PENDING' ? 'En revisión' : undefined,
        });
    }
    accountItems.push({
        id: 'verificacion', icon: ShieldCheck, label: 'Verificación de identidad', route: '/perfil/verificacion', color: '#16a34a',
        desc: vs === 'VERIFIED' ? 'Identidad verificada' : vs === 'PENDING' ? 'En revisión por un administrador' : vs === 'REJECTED' ? 'Rechazada: vuelve a subir tus documentos' : 'Sube tus documentos (KYC)',
        badge: vs === 'REJECTED' ? 'Revisar' : undefined,
    });
    accountItems.push({ id: '2fa', icon: Lock, label: 'Seguridad (2FA)', route: '/perfil/seguridad-2fa', color: '#0ea5e9', desc: 'Protege tu cuenta' });
    accountItems.push({ id: 'notif', icon: Bell, label: 'Notificaciones', route: '/notificaciones', color: '#f59e0b', desc: 'Avisos y novedades' });
    sections.push({ title: 'Cuenta', icon: ClipboardList, data: accountItems });

    sections.push({
        title: 'Soporte',
        icon: HelpCircle,
        data: [
            { id: 'ayuda', icon: HelpCircle, label: 'Centro de Ayuda', route: '/ayuda', color: '#64748b', desc: 'Soporte y preguntas frecuentes' },
            { id: 'paleta', icon: Palette, label: 'Apariencia', route: '/perfil/paleta', color: '#8b5cf6', desc: 'Tema y colores' },
        ],
    });

    return {
        user,
        roleName,
        isUserAdmin,
        isProfessional,
        allSections: sections,
        bannerProps: BANNERS[roleName] || null,
        handleSignOut,
    };
}
