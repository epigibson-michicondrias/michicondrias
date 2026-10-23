import { apiFetch } from "../lib/api";

export interface SystemSettings {
    maintenance_mode: boolean;
    debug_mode: boolean;
    ota_updates_enabled: boolean;
    push_notifications_enabled: boolean;
    cache_version: string;
    last_sync: string;
}

export const systemService = {
    getSettings: async (): Promise<SystemSettings> => {
        return apiFetch<SystemSettings>("core", "/admin/system/settings");
    },

    updateSettings: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
        return apiFetch<SystemSettings>("core", "/admin/system/settings", {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    syncDatabase: async (): Promise<{ message: string }> => {
        return apiFetch<{ message: string }>("core", "/admin/system/database/sync", {
            method: "POST",
        });
    },

    clearCache: async (): Promise<{ message: string }> => {
        return apiFetch<{ message: string }>("core", "/admin/system/cache/clear", {
            method: "POST",
        });
    },
};
