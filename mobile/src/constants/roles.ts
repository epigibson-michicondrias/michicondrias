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

// Nombres de roles por ID
export const ROLE_NAMES = {
    [ROLE_IDS.VETERINARIO]: "veterinario",
    [ROLE_IDS.ADMIN]: "admin",
    [ROLE_IDS.CONSUMIDOR]: "consumidor", 
    [ROLE_IDS.PASEADOR]: "paseador",
} as const;

// Descripciones de roles
export const ROLE_DESCRIPTIONS = {
    veterinario: "Profesional veterinario. Puede registrar clínicas, crear historiales y publicar adopciones.",
    admin: "Administrador. Acceso completo al sistema.",
    consumidor: "Usuario final. Puede buscar, adoptar, donar, comprar y reportar.",
    paseador: "Paseador o cuidador. Puede crear anuncios de sus servicio y aceptar solicitudes de oportunidades de oferta o trabajo.",
} as const;

// Emojis para roles
export const ROLE_EMOJIS = {
    admin: "👑",
    veterinario: "👨‍⚕️",
    consumidor: "👤", 
    paseador: "🚶",
} as const;

// Colores para roles
export const ROLE_COLORS = {
    admin: "#ef4444",
    veterinario: "#3b82f6", 
    consumidor: "#6b7280",
    paseador: "#10b981",
} as const;

// Funciones helper
export const getRoleName = (roleId: string): string => {
    return ROLE_NAMES[roleId as keyof typeof ROLE_NAMES] || "desconocido";
};

export const getRoleDescription = (roleId: string): string => {
    const roleName = getRoleName(roleId);
    return ROLE_DESCRIPTIONS[roleName as keyof typeof ROLE_DESCRIPTIONS] || "Rol no definido";
};

export const getRoleEmoji = (roleId: string): string => {
    const roleName = getRoleName(roleId);
    return ROLE_EMOJIS[roleName as keyof typeof ROLE_EMOJIS] || "❓";
};

export const getRoleColor = (roleId: string): string => {
    const roleName = getRoleName(roleId);
    return ROLE_COLORS[roleName as keyof typeof ROLE_COLORS] || "#6b7280";
};

export const isAdmin = (roleId: string): boolean => {
    return roleId === ROLE_IDS.ADMIN;
};

export const isVeterinario = (roleId: string): boolean => {
    return roleId === ROLE_IDS.VETERINARIO;
};

export const isConsumidor = (roleId: string): boolean => {
    return roleId === ROLE_IDS.CONSUMIDOR;
};

export const isPaseador = (roleId: string): boolean => {
    return roleId === ROLE_IDS.PASEADOR;
};

export const isProfesional = (roleId: string): boolean => {
    return isVeterinario(roleId) || isPaseador(roleId);
};

// Tipo para role_id
export type RoleId = typeof ROLE_IDS[keyof typeof ROLE_IDS];
