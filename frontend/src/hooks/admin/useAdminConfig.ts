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
    cache_version: '',
    last_sync: '',
};

export type ToggleKey = 'maintenance_mode' | 'debug_mode' | 'ota_updates_enabled' | 'push_notifications_enabled';

const SETTINGS_KEY = ['admin-system-settings'];

export function useAdminConfig() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: SETTINGS_KEY,
        queryFn: systemService.getSettings,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<SystemSettings>) => systemService.updateSettings(data),
        onSuccess: (data) => queryClient.setQueryData(SETTINGS_KEY, data),
        onError: (error) => showAlert({ type: 'error', title: 'No se guardó el cambio', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    // El backend responde en inglés: se muestra un texto propio y se recargan los ajustes (última sincronización / versión).
    const syncMutation = useMutation({
        mutationFn: systemService.syncDatabase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
            showAlert({ type: 'success', title: 'Sincronización registrada', message: 'Se actualizó la fecha de la última sincronización.' });
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo sincronizar', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const cacheMutation = useMutation({
        mutationFn: systemService.clearCache,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
            showAlert({ type: 'success', title: 'Caché limpiada', message: 'Ya hay una nueva versión de caché.' });
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo limpiar la caché', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const currentSettings = settings || DEFAULT_SETTINGS;

    const toggleSetting = (key: ToggleKey) => {
        updateMutation.mutate({ [key]: !currentSettings[key] });
    };

    const syncDatabase = () =>
        showAlert({
            type: 'warning',
            title: 'Sincronizar base de datos',
            message: '¿Sincronizar la base de datos ahora?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Sincronizar',
            onButtonPress: () => syncMutation.mutate(),
        });

    const clearCache = () =>
        showAlert({
            type: 'warning',
            title: 'Limpiar caché',
            message: 'Se generará una nueva versión de caché y los datos guardados quedarán obsoletos. ¿Continuar?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Limpiar caché',
            onButtonPress: () => cacheMutation.mutate(),
        });

    return {
        currentSettings,
        hasSettings: !!settings,
        isLoading,
        toggleSetting,
        /** Clave que se está guardando ahora (para deshabilitar ese interruptor). */
        updatingKey: updateMutation.isPending ? (Object.keys(updateMutation.variables ?? {})[0] as ToggleKey | undefined) : undefined,
        syncDatabase,
        clearCache,
        isSyncing: syncMutation.isPending,
        isClearing: cacheMutation.isPending,
    };
}
