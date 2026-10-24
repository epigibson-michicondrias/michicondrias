import React from 'react';
import { Stack, usePathname } from 'expo-router';
import RoleGuard from '@/src/components/RoleGuard';
import { getRouteRule } from '@/src/constants/roleTools';

/**
 * Zona `/mi-clinica`: veterinario y hospital (el backend exige los mismos roles).
 * La regla más específica de `ROUTE_ACCESS` decide cada sub-ruta: sucursales y médicos asociados solo
 * hospital; videoconsultas, recetas, laboratorio, cirugías y horarios solo veterinario. El admin pasa siempre.
 */
export default function MiClinicaLayout() {
    const pathname = usePathname();
    const rule = getRouteRule(pathname)!;
    return (
        <RoleGuard roles={rule.roles} message="Esta sección de clínica no está disponible para tu cuenta.">
            <Stack screenOptions={{ headerShown: false }} />
        </RoleGuard>
    );
}
