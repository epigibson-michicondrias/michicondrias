/**
 * useScreenAccent — Color de identidad de la pantalla actual, deducido de la ruta. Así las cabeceras (y cualquier
 * componente que quiera teñirse con el módulo) heredan el color sin que cada pantalla lo declare.
 *
 * Orden:
 * 1. Zona de profesional/admin (`ROUTE_ACCESS`): color del rol. Si el usuario tiene uno de los roles de la zona, el
 *    suyo; si no (p. ej. un admin revisando), el primer rol de la zona; `/admin` usa el del admin.
 * 2. Módulo de la ruta (`/perdidas/nuevo` → `perdidas`): su color de `MODULE_ACCENTS`.
 * 3. Vitrina de un rol (`SEGMENT_ROLES`, p. ej. `/patrocinadores`): el color de ese rol.
 * 4. Ninguno: `undefined` (se usa el `heroGradient` azul de la marca).
 */
import { useState } from 'react';
import { usePathname } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getRouteRule } from '@/src/constants/roleTools';
import { normalizeRole } from '@/src/constants/roles';
import { MODULE_ACCENTS, ROLE_ACCENTS, SEGMENT_ROLES, getModuleForPath } from '@/src/constants/modules';

export function useScreenAccent(): string | undefined {
    // `usePathname` es la ruta ENFOCADA (global): las pantallas que quedan debajo en la pila tomarían el color de la
    // de encima. Se fija la ruta del primer render, que es la de esta pantalla.
    const currentPath = usePathname();
    const [pathname] = useState(currentPath);
    const { user } = useAuth();

    const rule = getRouteRule(pathname);
    if (rule) {
        const userRole = normalizeRole(user?.role_name);
        const allowed = rule.roles.map(normalizeRole);
        const role = allowed.length === 0 ? 'admin' : allowed.includes(userRole) ? userRole : allowed[0];
        return ROLE_ACCENTS[role];
    }

    const module = getModuleForPath(pathname);
    if (module) return MODULE_ACCENTS[module];

    const segmentRole = SEGMENT_ROLES[pathname.split('/').filter(Boolean)[0] ?? ''];
    return segmentRole ? ROLE_ACCENTS[segmentRole] : undefined;
}
