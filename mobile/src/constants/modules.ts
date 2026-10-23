/**
 * Identidad de color por módulo y por rol — ÚNICA fuente de verdad.
 *
 * - `MODULE_ACCENTS`: color de cada módulo. Pinta su ícono en Explorar y la cabecera hero de TODAS sus pantallas
 *   (las internas lo heredan por la ruta: `/perdidas/nuevo` → `perdidas`).
 * - `ROLE_ACCENTS`: color de cada rol. Un rol con módulo propio usa el color de ese módulo; lo usan las pantallas de
 *   profesional/admin (rutas de `ROUTE_ACCESS`) y las insignias de rol.
 *
 * Para cambiar un color se cambia aquí y se actualiza en toda la app.
 */
import { accents } from '@/constants/design';

export const MODULE_ACCENTS = {
    // Salud
    directorio: accents.info,
    laboratorio: accents.cyan,
    aseguradoras: accents.indigo,
    // Servicios
    paseadores: accents.services,
    cuidadores: accents.brown,
    estilistas: accents.orchid,
    entrenadores: accents.orange,
    transportistas: accents.purple,
    petfriendly: accents.green,
    establecimientos: accents.teal,
    funeraria: accents.slate,
    // Comunidad
    adopciones: accents.rose,
    perdidas: accents.danger,
    donaciones: accents.yellow,
} as const;

export type ModuleKey = keyof typeof MODULE_ACCENTS;

/** Carpetas de `app/` que pertenecen a un módulo con otro nombre. */
const SEGMENT_ALIASES: Record<string, ModuleKey> = {
    grooming: 'estilistas',
};

/** Módulo al que pertenece una ruta (`/perdidas/nuevo` → `perdidas`), o null si no es de un módulo. */
export function getModuleForPath(path: string): ModuleKey | null {
    const segment = path.split('?')[0].split('/').filter(Boolean)[0] ?? '';
    if (segment in MODULE_ACCENTS) return segment as ModuleKey;
    return SEGMENT_ALIASES[segment] ?? null;
}

/** Carpetas de `app/` que son la vitrina de un rol sin módulo en Explorar (p. ej. campañas de patrocinadores). */
export const SEGMENT_ROLES: Record<string, string> = {
    patrocinadores: 'patrocinador',
};

export const ROLE_ACCENTS: Record<string, string> = {
    consumidor: accents.neutral,
    admin: accents.gold,
    veterinario: MODULE_ACCENTS.directorio,
    hospital: MODULE_ACCENTS.directorio,
    refugio: MODULE_ACCENTS.adopciones,
    hogar_temporal: MODULE_ACCENTS.adopciones,
    vendedor: accents.health,
    paseador: MODULE_ACCENTS.paseadores,
    cuidador: MODULE_ACCENTS.cuidadores,
    aseguradora: MODULE_ACCENTS.aseguradoras,
    funeraria: MODULE_ACCENTS.funeraria,
    entrenador: MODULE_ACCENTS.entrenadores,
    estilista: MODULE_ACCENTS.estilistas,
    laboratorio: MODULE_ACCENTS.laboratorio,
    patrocinador: accents.lime,
    transportista: MODULE_ACCENTS.transportistas,
    establecimiento: MODULE_ACCENTS.establecimientos,
};
