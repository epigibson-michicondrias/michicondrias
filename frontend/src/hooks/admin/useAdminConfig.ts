/**
 * useAdminConfig — Business logic for the admin config screen
 * Manages system settings, toggle updates, sync, and cache operations
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService, SystemSettings, type SyncResult } from '@/services/system';
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

/** Etiquetas en español de las tablas que cuenta la sincronización. */
const TABLE_LABELS: Record<string, string> = {
    users: 'Usuarios',
    pets: 'Mascotas',
    clinics: 'Clínicas',
    products: 'Productos',
    orders: 'Pedidos',
    notifications: 'Notificaciones',
};

export function useAdminConfig() {
    const queryClient = useQueryClient();
    const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

    const { data: settings, isLoading, isError, refetch } = useQuery({
        queryKey: SETTINGS_KEY,
        queryFn: systemService.getSettings,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<SystemSettings>) => systemService.updateSettings(data),
        onSuccess: (data) => {
            queryClient.setQueryData(SETTINGS_KEY, data);
            // Los clientes (banner de mantenimiento, OTA, push) leen los ajustes públicos: se actualizan al momento.
            queryClient.invalidateQueries({ queryKey: ['public-system-settings'] });
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se guardó el cambio', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    // El backend responde con la fecha y los conteos reales de las tablas: se muestran en la pantalla.
    const syncMutation = useMutation({
        mutationFn: systemService.syncDatabase,
        onSuccess: (data) => {
            setLastSyncResult(data);
            queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
            showAlert({ type: 'success', title: 'Base de datos sincronizada', message: data.message || 'Se actualizó la fecha de la última sincronización.' });
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo sincronizar', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const cacheMutation = useMutation({
        mutationFn: systemService.clearCache,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
            // `cache_version` también viaja en los ajustes públicos que leen los clientes.
            queryClient.invalidateQueries({ queryKey: ['public-system-settings'] });
            showAlert({ type: 'success', title: 'Caché limpiada', message: 'Ya hay una nueva versión de caché.' });
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo limpiar la caché', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const currentSettings = settings || DEFAULT_SETTINGS;

    const toggleSetting = (key: ToggleKey) => {
        if (updateMutation.isPending) return;
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
        /** Los ajustes no se pudieron cargar: no hay que mostrar valores inventados. */
        isError,
        refetchSettings: refetch,
        toggleSetting,
        /** `true` mientras se guarda un interruptor: se deshabilitan todos para no pisar respuestas. */
        isUpdating: updateMutation.isPending,
        syncDatabase,
        clearCache,
        isSyncing: syncMutation.isPending,
        isClearing: cacheMutation.isPending,
        /** Conteos de la última sincronización en esta sesión, para mostrarlos en la pantalla. */
        lastSyncResult,
        tableLabel: (key: string) => TABLE_LABELS[key] ?? key,
    };
}
