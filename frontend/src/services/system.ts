import { apiFetch } from "../lib/api";

export interface SystemSettings {
    maintenance_mode: boolean;
    debug_mode: boolean;
    ota_updates_enabled: boolean;
    push_notifications_enabled: boolean;
    cache_version: string;
    last_sync: string;
}

/** Ajustes públicos (`GET /system/public`): los que necesitan los clientes sin sesión. */
export interface PublicSystemSettings {
    maintenance_mode: boolean;
    ota_updates_enabled: boolean;
    push_notifications_enabled: boolean;
    cache_version: string;
}

/** Resultado de `POST /admin/system/database/sync`: conteos reales de las tablas clave. */
export interface SyncResult {
    message: string;
    last_sync: string;
    counts: Record<string, number | null>;
}

export const systemService = {
    getSettings: async (): Promise<SystemSettings> => {
        return apiFetch<SystemSettings>("core", "/admin/system/settings");
    },

    /** Sin sesión: el banner de mantenimiento y los clientes lo leen al arrancar. */
    getPublicSettings: async (): Promise<PublicSystemSettings> => {
        return apiFetch<PublicSystemSettings>("core", "/system/public");
    },

    updateSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
        return apiFetch<SystemSettings>("core", "/admin/system/settings", {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    syncDatabase: async (): Promise<SyncResult> => {
        return apiFetch<SyncResult>("core", "/admin/system/database/sync", {
            method: "POST",
        });
    },

    clearCache: async (): Promise<{ message: string }> => {
        return apiFetch<{ message: string }>("core", "/admin/system/cache/clear", {
            method: "POST",
        });
    },
};
