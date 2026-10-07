/**
 * useMenu — pestaña Herramientas (solo profesionales y admin): las herramientas del rol, nada más.
 * Cuenta, soporte y cierre de sesión viven en la pestaña Perfil. Todo sale de ROLE_TOOLS (roleTools.ts).
 */
import { useAuth } from '@/src/contexts/AuthContext';
import { normalizeRole, getRoleLabelFor } from '@/src/constants/roles';
import { getRoleTools, canAccessRoute, ROLE_PANEL_TITLE, type RoleTool } from '@/src/constants/roleTools';

export function useMenu() {
    const { user } = useAuth();
    const roleName = normalizeRole(user?.role_name);
    const isUserAdmin = roleName === 'admin';

    // Defensa: nunca mostrar una herramienta que el rol no puede abrir
    const tools: RoleTool[] = getRoleTools(roleName).filter((t) => canAccessRoute(roleName, t.route));
    // Las de Inicio (atajos principales) primero; el resto después
    const mainTools = tools.filter((t) => t.home);
    const moreTools = tools.filter((t) => !t.home);

    return {
        isUserAdmin,
        title: isUserAdmin ? 'Administración' : 'Herramientas',
        subtitle: ROLE_PANEL_TITLE[roleName] || getRoleLabelFor(roleName),
        mainTools,
        moreTools,
    };
}
