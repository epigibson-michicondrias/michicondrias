/**
 * useAdminConfig — Business logic for the admin config screen
 * Manages system settings, toggle updates, sync, and cache operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService, SystemSettings } from '@/services/system';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

const DEFAULT_SETTINGS: SystemSettings = {
    maintenance_mode: false,
    debug_mode: false,
    ota_updates_enabled: true,
    push_notifications_enabled: true,
} as SystemSettings;

export function useAdminConfig() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['admin-system-settings'],
        queryFn: systemService.getSettings,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<SystemSettings>) => systemService.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
        },
        onError: (error) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const syncMutation = useMutation({
        mutationFn: systemService.syncDatabase,
        onSuccess: (data) => showAlert({ type: 'success', title: 'Éxito', message: errorMessage(data, 'Sincronización completada.') }),
        onError: (error) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const cacheMutation = useMutation({
        mutationFn: systemService.clearCache,
        onSuccess: (data) => showAlert({ type: 'success', title: 'Éxito', message: errorMessage(data, 'Caché global limpiada.') }),
        onError: (error) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const currentSettings = settings || DEFAULT_SETTINGS;

    const toggleSetting = (key: keyof SystemSettings) => {
        updateMutation.mutate({ [key]: !currentSettings[key] });
    };

    const syncDatabase = () => syncMutation.mutate();
    const clearCache = () => cacheMutation.mutate();

    return {
        currentSettings,
        isLoading,
        toggleSetting,
        syncDatabase,
        clearCache,
        isSyncing: syncMutation.isPending,
        isClearing: cacheMutation.isPending,
    };
}
