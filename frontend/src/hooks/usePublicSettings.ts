/**
 * usePublicSettings — ajustes públicos del sistema (`GET /system/public`, sin sesión).
 * El banner de mantenimiento y los clientes los leen al arrancar.
 */
import { useQuery } from '@tanstack/react-query';
import { systemService, type PublicSystemSettings } from '@/services/system';

export function usePublicSettings() {
    return useQuery<PublicSystemSettings>({
        queryKey: ['public-system-settings'],
        queryFn: systemService.getPublicSettings,
        staleTime: 60_000,
        retry: 1,
    });
}

/** `true` si la plataforma está en modo mantenimiento (solo informativo en la web). */
export function useMaintenanceMode(): boolean {
    const { data } = usePublicSettings();
    return !!data?.maintenance_mode;
}
