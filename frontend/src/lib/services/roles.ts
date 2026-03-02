import { apiFetch } from "../api";

export interface Role {
    id: string;
    name: string;
    description?: string;
}

export interface RoleCreate {
    name: string;
    description?: string;
}

export interface RoleUpdate {
    name?: string;
    description?: string;
}

export async function getRoles(): Promise<Role[]> {
    return apiFetch<Role[]>("core", "/roles/");
}

export async function createRole(data: RoleCreate): Promise<Role> {
    return apiFetch<Role>("core", "/roles/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateRole(id: string, data: RoleUpdate): Promise<Role> {
    return apiFetch<Role>("core", `/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteRole(id: string): Promise<Role> {
    return apiFetch<Role>("core", `/roles/${id}`, {
        method: "DELETE",
    });
}
