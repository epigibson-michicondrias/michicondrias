/**
 * 🏥 Constantes de Roles para Michicondrias
 * Basado en la estructura real de la base de datos
 */

// IDs de roles según la tabla roles
export const ROLE_IDS = {
    VETERINARIO: "920fa098-bc65-461d-8ef9-dd0118e983ef",
    ADMIN: "b7e20dc7-732e-4fa8-90d9-8553f21688a6", 
    CONSUMIDOR: "d981e55c-efb2-4495-b9d4-e0fd7821d937",
    PASEADOR: "ef24d39d-50b6-44f4-8388-e72bf8a949a4",
} as const;

// Nombres de roles por id (solo para getRoleName)
const ROLE_NAMES = {
    [ROLE_IDS.VETERINARIO]: "veterinario",
    [ROLE_IDS.ADMIN]: "admin",
    [ROLE_IDS.CONSUMIDOR]: "consumidor", 
    [ROLE_IDS.PASEADOR]: "paseador",
} as const;

export const getRoleName = (roleId?: string, roleName?: string): string => {
    // Priorizar role_name (viene de la API); si no, traducir el role_id
    if (roleName) return roleName;
    if (roleId) return ROLE_NAMES[roleId as keyof typeof ROLE_NAMES] || "desconocido";
    return "desconocido";
};

// Tipo para role_id
export type RoleId = typeof ROLE_IDS[keyof typeof ROLE_IDS];

// ═══════════════════════════════════════════════════════════════════
//  Registro canónico de roles (nombres EXACTOS que guarda el backend en roles.name
//  y que viajan en el claim `role` del JWT). Fuente única para menús, Inicio y guardas.
// ═══════════════════════════════════════════════════════════════════

/** Alias heredados que algunas pantallas/APIs antiguas usan → nombre canónico. */
const ROLE_ALIASES: Record<string, string> = {
    walker: 'paseador',
    sitter: 'cuidador',
    sponsor: 'patrocinador',
    driver: 'transportista',
    clinica: 'hospital',
    user: 'consumidor',
};

/** Roles profesionales (todos los que se obtienen con "Ser Profesional" + KYC aprobado). */
const PRO_ROLES = [
    'veterinario', 'hospital', 'refugio', 'hogar_temporal', 'vendedor', 'paseador', 'cuidador',
    'aseguradora', 'funeraria', 'entrenador', 'estilista', 'laboratorio', 'patrocinador',
    'transportista', 'establecimiento',
] as const;
export type ProRole = typeof PRO_ROLES[number];

/** Todos los roles que la app conoce. */
export const ALL_ROLES = ['consumidor', ...PRO_ROLES, 'admin'] as const;

export interface RoleMeta { label: string; color: string; }

const ROLE_META: Record<string, RoleMeta> = {
    consumidor: { label: 'Dueño de mascota', color: '#6b7280' },
    admin: { label: 'Administrador', color: '#ef4444' },
    veterinario: { label: 'Veterinario', color: '#06b6d4' },
    hospital: { label: 'Clínica / Hospital', color: '#0ea5e9' },
    refugio: { label: 'Refugio', color: '#ec4899' },
    hogar_temporal: { label: 'Hogar temporal', color: '#f472b6' },
    vendedor: { label: 'Vendedor', color: '#10b981' },
    paseador: { label: 'Paseador', color: '#6366f1' },
    cuidador: { label: 'Cuidador', color: '#8b5cf6' },
    aseguradora: { label: 'Aseguradora', color: '#0ea5e9' },
    funeraria: { label: 'Funeraria', color: '#64748b' },
    entrenador: { label: 'Entrenador', color: '#8b5cf6' },
    estilista: { label: 'Estilista', color: '#ec4899' },
    laboratorio: { label: 'Laboratorio', color: '#10b981' },
    patrocinador: { label: 'Patrocinador', color: '#f59e0b' },
    transportista: { label: 'Transportista', color: '#6366f1' },
    establecimiento: { label: 'Establecimiento pet-friendly', color: '#f59e0b' },
};

/** Normaliza el nombre de rol (alias → canónico, vacío → consumidor). */
export const normalizeRole = (role?: string | null): string => {
    const r = (role || '').trim().toLowerCase();
    if (!r) return 'consumidor';
    return ROLE_ALIASES[r] || r;
};

export const isProRole = (role?: string | null): boolean =>
    (PRO_ROLES as readonly string[]).includes(normalizeRole(role));

export const getRoleLabelFor = (role?: string | null): string => {
    const r = normalizeRole(role);
    return ROLE_META[r]?.label || r;
};

export const getRoleColorFor = (role?: string | null): string =>
    ROLE_META[normalizeRole(role)]?.color || '#6b7280';
