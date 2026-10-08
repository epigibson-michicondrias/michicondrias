/**
 * roleTools — Arquitectura de navegación por rol (fuente única).
 *
 *  - ROLE_TOOLS: herramientas de cada rol. Alimentan (a) el panel de Inicio, (b) "Herramientas pro" en Más.
 *  - ROUTE_ACCESS: qué roles pueden abrir cada zona de la app (espeja los require_* del backend).
 *  - canAccessRoute(): verificación usada por RoleGuard y por scripts de validación.
 *
 * Regla: una ruta nueva de profesional/admin se registra AQUÍ y en ROUTE_ACCESS; nunca se hardcodea en un menú.
 */
import {
    Stethoscope, Calendar, Video, Building, Users, Heart, ClipboardList, ShoppingBag, Package, CreditCard,
    BarChart3, Activity, Shield, Plus, Dumbbell, Scissors, FlaskConical, Award, Zap, User, Clock, Store,
    ShieldCheck, Settings, UserCheck, Eye, FileText, Boxes, Syringe, MapPin,
} from 'lucide-react-native';
import { normalizeRole } from '@/src/constants/roles';
import { accents } from '@/constants/design';

export interface RoleTool {
    id: string;
    label: string;
    desc: string;
    route: string;
    color: string;
    icon: React.ComponentType<any>;
    /** Aparece como atajo en Inicio (máx. 4 por rol). */
    home?: boolean;
}

const t = (id: string, label: string, desc: string, route: string, color: string, icon: React.ComponentType<any>, home = false): RoleTool =>
    ({ id, label, desc, route, color, icon, home });

const refugioTools = (withApps: boolean): RoleTool[] => [
    t('ref-publicaciones', 'Mis publicaciones', 'Mascotas en adopción', '/adopciones/mis-publicaciones', accents.shop, Heart, true),
    t('ref-nuevo', 'Publicar mascota', 'Nueva mascota en adopción', '/adopciones/nuevo', accents.health, Plus, true),
    t('ref-solicitudes', 'Solicitudes recibidas', 'Interesados en adoptar', '/adopciones/solicitudes', accents.warning, ClipboardList, true),
    ...(withApps ? [t('ref-aplicaciones', 'Postulaciones', 'Revisar formularios de adopción', '/adopciones/refugio/aplicaciones', accents.services, FileText, true)] : []),
];

const servicioPro = (rolePath: 'paseadores' | 'cuidadores'): RoleTool[] => [
    t('p-tareas', 'Mis tareas', 'Servicios activos', '/servicios-pro/gestion', accents.services, Activity, true),
    t('p-solicitudes', 'Solicitudes', 'Solicitudes entrantes', `/${rolePath}/solicitudes`, accents.health, ClipboardList, true),
    t('p-calendario', 'Calendario', 'Tu agenda', `/${rolePath}/calendario`, accents.warning, Calendar, true),
    t('p-perfil', 'Mi perfil profesional', 'Tarifas, zonas y descripción', '/servicios-pro/perfil', accents.shop, UserCheck, true),
];

export const ROLE_TOOLS: Record<string, RoleTool[]> = {
    consumidor: [],

    veterinario: [
        t('v-clinica', 'Mi consultorio', 'Operación clínica', '/mi-clinica', accents.info, Building, true),
        t('v-agenda', 'Agenda', 'Citas y horarios', '/mi-clinica/agenda', accents.services, Calendar, true),
        t('v-pacientes', 'Pacientes', 'Historial de pacientes', '/mi-clinica/pacientes', accents.warning, ClipboardList, true),
        t('v-video', 'Videoconsultas', 'Pacientes virtuales', '/mi-clinica/consultas-video', accents.services, Video, true),
        t('v-recetas', 'Recetas', 'Prescripciones emitidas', '/mi-clinica/recetas', accents.health, FileText),
        t('v-lab', 'Laboratorio', 'Órdenes y resultados', '/mi-clinica/laboratorio', accents.info, FlaskConical),
        t('v-cirugias', 'Cirugías', 'Programación quirúrgica', '/mi-clinica/cirugias', accents.danger, Syringe),
        t('v-inventario', 'Inventario', 'Insumos y medicamentos', '/mi-clinica/inventario', accents.neutral, Boxes),
        t('v-servicios', 'Servicios', 'Catálogo y precios', '/mi-clinica/servicios', accents.shop, CreditCard),
        t('v-horarios', 'Horarios', 'Disponibilidad', '/mi-clinica/horarios', accents.teal, Clock),
        t('v-directorio', 'Mi directorio', 'Registrar mis lugares', '/directorio/nuevo', accents.info, Stethoscope),
    ],

    hospital: [
        t('h-clinica', 'Mi clínica', 'Operación clínica', '/mi-clinica', accents.info, Building, true),
        t('h-sucursales', 'Sucursales', 'Sedes y datos', '/mi-clinica/sucursales', accents.info, MapPin, true),
        t('h-vets', 'Médicos asociados', 'Gestionar veterinarios', '/mi-clinica/veterinarios', accents.health, Users, true),
        t('h-agenda', 'Agenda', 'Citas y horarios', '/mi-clinica/agenda', accents.services, Calendar, true),
        t('h-pacientes', 'Pacientes', 'Historial de pacientes', '/mi-clinica/pacientes', accents.warning, ClipboardList),
        t('h-inventario', 'Inventario', 'Insumos y medicamentos', '/mi-clinica/inventario', accents.neutral, Boxes),
        t('h-servicios', 'Servicios', 'Catálogo y precios', '/mi-clinica/servicios', accents.shop, CreditCard),
    ],

    refugio: [...refugioTools(true), t('ref-donaciones', 'Donaciones', 'Apoyo a refugios', '/donaciones', accents.warning, Heart)],
    hogar_temporal: refugioTools(false),

    vendedor: [
        t('vend-tienda', 'Mi tienda', 'Catálogo y estado', '/tienda/vendedor', accents.health, ShoppingBag, true),
        t('vend-pedidos', 'Pedidos', 'Ventas recibidas', '/tienda/vendedor/ordenes', accents.warning, Package, true),
        t('vend-productos', 'Productos', 'Gestión de inventario', '/tienda/vendedor/productos', accents.services, CreditCard, true),
        t('vend-analytics', 'Analíticas', 'Rendimiento de ventas', '/tienda/vendedor/analytics', accents.info, BarChart3, true),
    ],

    paseador: servicioPro('paseadores'),
    cuidador: servicioPro('cuidadores'),

    aseguradora: [
        t('aseg-gestion', 'Gestión de planes', 'Ver y crear planes', '/aseguradoras/gestion', accents.info, Shield, true),
        t('aseg-reclamos', 'Reclamos', 'Reclamos de pólizas', '/aseguradoras/reclamos', accents.warning, ClipboardList, true),
        t('aseg-nuevo', 'Nuevo plan', 'Publicar un plan', '/aseguradoras/nuevo', accents.health, Plus, true),
    ],

    funeraria: [
        t('fun-gestion', 'Gestión funeraria', 'Servicios y memoriales', '/funeraria/gestion', accents.neutral, Heart, true),
        t('fun-nuevo', 'Nuevo servicio', 'Crear paquete', '/funeraria/nuevo-servicio', accents.health, Plus, true),
        t('fun-reporte', 'Reportar defunción', 'Registrar un fallecimiento', '/funeraria/reporte-defuncion', accents.danger, ClipboardList, true),
    ],

    entrenador: [
        t('ent-gestion', 'Gestión de cursos', 'Cursos y alumnos', '/entrenadores/gestion', accents.services, Dumbbell, true),
        t('ent-nuevo', 'Nuevo programa', 'Crear curso de adiestramiento', '/entrenadores/nuevo-programa', accents.health, Plus, true),
    ],

    estilista: [
        t('groom-gestion', 'Gestión estilista', 'Agenda y citas', '/grooming/gestion', accents.shop, Scissors, true),
        t('groom-nuevo', 'Ofrecer servicio', 'Nuevo tipo de grooming', '/estilistas/nuevo', accents.health, Plus, true),
    ],

    laboratorio: [
        t('lab-gestion', 'Órdenes', 'Registrar resultados', '/laboratorio/gestion', accents.health, FlaskConical, true),
    ],

    patrocinador: [
        t('spons-campana', 'Nueva campaña', 'Crear campaña', '/patrocinadores/nueva-campana', accents.health, Award, true),
        t('spons-boost', 'Boost de alerta', 'Promocionar reportes perdidos', '/patrocinadores/boost-alerta', accents.warning, Zap, true),
        t('spons-stats', 'Estadísticas', 'Impacto de publicidad', '/patrocinadores/estadisticas', accents.info, BarChart3, true),
    ],

    transportista: [
        t('trans-solicitudes', 'Solicitudes de viaje', 'Viajes por aceptar y en curso', '/transportistas/solicitudes', accents.health, ClipboardList, true),
        t('trans-conductor', 'Perfil de conductor', 'Datos del conductor', '/transportistas/perfil-conductor', accents.services, User, true),
        t('trans-historial', 'Historial de viajes', 'Viajes realizados', '/transportistas/historial', accents.neutral, Clock, true),
    ],

    establecimiento: [
        t('est-nuevo', 'Registrar establecimiento', 'Alta de tu local pet-friendly', '/establecimientos/nuevo', accents.warning, Store, true),
        t('est-lista', 'Establecimientos', 'Ver y editar locales', '/establecimientos', accents.health, MapPin, true),
    ],

    admin: [
        t('admin-panel', 'Panel admin', 'Administración global', '/admin', accents.services, ShieldCheck, true),
        t('admin-kyc', 'Verificaciones', 'Identidad profesional', '/admin/verificaciones', accents.warning, UserCheck, true),
        t('admin-mod', 'Moderación', 'Contenido pendiente', '/admin/moderacion', accents.danger, Eye, true),
        t('admin-stats', 'Analíticas', 'Rendimiento global', '/admin/stats', accents.health, BarChart3, true),
        t('admin-users', 'Usuarios', 'Gestión de cuentas', '/admin/usuarios', accents.info, Users),
        t('admin-roles', 'Roles', 'Permisos y accesos', '/admin/roles', accents.services, Shield),
        t('admin-config', 'Configuración', 'Ajustes del sistema', '/admin/config', accents.neutral, Settings),
    ],
};

/** Título del panel de Inicio por rol. */
export const ROLE_PANEL_TITLE: Record<string, string> = {
    admin: 'Administración',
    veterinario: 'Tu consultorio',
    hospital: 'Tu clínica',
    refugio: 'Tu refugio',
    hogar_temporal: 'Tu hogar temporal',
    vendedor: 'Tu tienda',
    paseador: 'Tus paseos',
    cuidador: 'Tus cuidados',
    aseguradora: 'Tu aseguradora',
    funeraria: 'Tu funeraria',
    entrenador: 'Tu escuela',
    estilista: 'Tu estética',
    laboratorio: 'Tu laboratorio',
    patrocinador: 'Tus campañas',
    transportista: 'Tus viajes',
    establecimiento: 'Tu establecimiento',
};

export const getRoleTools = (role?: string | null): RoleTool[] => ROLE_TOOLS[normalizeRole(role)] || [];
export const getHomeTools = (role?: string | null): RoleTool[] => getRoleTools(role).filter((x) => x.home).slice(0, 4);

// ── Control de acceso por zona ──────────────────────────────────────
// Prefijo de ruta → roles permitidos (admin siempre pasa). Debe reflejar el backend (ver reporte de matriz).
// Cualquier ruta que no coincida con un prefijo es "abierta" a cualquier usuario autenticado
// (p. ej. /adopciones/mis-publicaciones y /funeraria/reporte-defuncion: los dueños también las usan).
export const ROUTE_ACCESS: { prefix: string; roles: string[] }[] = [
    { prefix: '/admin', roles: [] },
    { prefix: '/mi-clinica', roles: ['veterinario', 'hospital'] },
    { prefix: '/mi-clinica/sucursales', roles: ['hospital'] },
    { prefix: '/mi-clinica/veterinarios', roles: ['hospital'] },
    { prefix: '/mi-clinica/consultas-video', roles: ['veterinario'] },
    { prefix: '/mi-clinica/recetas', roles: ['veterinario'] },
    { prefix: '/mi-clinica/laboratorio', roles: ['veterinario'] },
    { prefix: '/mi-clinica/cirugias', roles: ['veterinario'] },
    { prefix: '/mi-clinica/horarios', roles: ['veterinario'] },
    { prefix: '/tienda/vendedor', roles: ['vendedor'] },
    { prefix: '/servicios-pro', roles: ['paseador', 'cuidador'] },
    { prefix: '/paseadores/solicitudes', roles: ['paseador'] },
    { prefix: '/paseadores/calendario', roles: ['paseador'] },
    { prefix: '/cuidadores/solicitudes', roles: ['cuidador'] },
    { prefix: '/cuidadores/calendario', roles: ['cuidador'] },
    { prefix: '/adopciones/refugio', roles: ['refugio'] },
    { prefix: '/aseguradoras/gestion', roles: ['aseguradora'] },
    { prefix: '/aseguradoras/reclamos', roles: ['aseguradora'] },
    { prefix: '/aseguradoras/nuevo', roles: ['aseguradora'] },
    { prefix: '/funeraria/gestion', roles: ['funeraria'] },
    { prefix: '/funeraria/nuevo-servicio', roles: ['funeraria'] },
    { prefix: '/entrenadores/gestion', roles: ['entrenador'] },
    { prefix: '/entrenadores/nuevo-programa', roles: ['entrenador'] },
    { prefix: '/grooming/gestion', roles: ['estilista'] },
    { prefix: '/estilistas/nuevo', roles: ['estilista'] },
    { prefix: '/laboratorio/gestion', roles: ['laboratorio'] },
    { prefix: '/patrocinadores/nueva-campana', roles: ['patrocinador'] },
    { prefix: '/patrocinadores/boost-alerta', roles: ['patrocinador'] },
    { prefix: '/patrocinadores/estadisticas', roles: ['patrocinador'] },
    { prefix: '/transportistas/solicitudes', roles: ['transportista'] },
    { prefix: '/transportistas/perfil-conductor', roles: ['transportista'] },
    { prefix: '/transportistas/historial', roles: ['transportista'] },
];

/** Devuelve la regla más específica (prefijo más largo) para una ruta, o null si es abierta. */
export function getRouteRule(path: string) {
    const clean = path.split('?')[0].replace(/\/$/, '') || '/';
    let best: { prefix: string; roles: string[] } | null = null;
    for (const r of ROUTE_ACCESS) {
        if ((clean === r.prefix || clean.startsWith(r.prefix + '/')) && (!best || r.prefix.length > best.prefix.length)) best = r;
    }
    return best;
}

export function canAccessRoute(role: string | null | undefined, path: string): boolean {
    const r = normalizeRole(role);
    if (r === 'admin') return true;
    const rule = getRouteRule(path);
    if (!rule) return true;
    return rule.roles.map(normalizeRole).includes(r);
}
