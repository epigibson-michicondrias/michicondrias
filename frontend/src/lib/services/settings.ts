import { apiFetch } from "../api";

export interface GlobalSetting {
    id: string;
    key: string;
    value: string;
    description?: string;
    is_public: boolean;
    type: string;
}

export interface GlobalSettingCreate {
    key: string;
    value: string;
    description?: string;
    is_public?: boolean;
    type?: string;
}

export interface GlobalSettingUpdate {
    value?: string;
    description?: string;
    is_public?: boolean;
    type?: string;
}

export async function getSettings(public_only: boolean = false): Promise<GlobalSetting[]> {
    return apiFetch<GlobalSetting[]>("core", `/settings/?public_only=${public_only}`);
}

export async function createSetting(data: GlobalSettingCreate): Promise<GlobalSetting> {
    return apiFetch<GlobalSetting>("core", "/settings/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSetting(id: string, data: GlobalSettingUpdate): Promise<GlobalSetting> {
    return apiFetch<GlobalSetting>("core", `/settings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSetting(id: string): Promise<GlobalSetting> {
    return apiFetch<GlobalSetting>("core", `/settings/${id}`, {
        method: "DELETE",
    });
}
