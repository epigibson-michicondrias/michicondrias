/**
 * useAdminConfig — Business logic for the admin config screen
 * Manages system settings, toggle updates, sync, and cache operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService, SystemSettings } from '@/src/services/system';
import { showAlert } from '@/src/components/AppAlert';

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
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const syncMutation = useMutation({
        mutationFn: systemService.syncDatabase,
        onSuccess: (data) => showAlert({ type: 'success', title: 'Éxito', message: data.message || 'Sincronización completada.' }),
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
    });

    const cacheMutation = useMutation({
        mutationFn: systemService.clearCache,
        onSuccess: (data) => showAlert({ type: 'success', title: 'Éxito', message: data.message || 'Caché global limpiada.' }),
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message })
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
