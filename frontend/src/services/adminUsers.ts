import { apiFetch } from '../lib/api';

export interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
    role_id?: string;
    role_name?: string;
    verification_status?: string;
    created_at: string;
    last_login?: string;
    phone?: string;
    clinic_id?: string;
    specialty?: string;
}

export interface AdminRole {
    id: string;
    name: string;
    description?: string | null;
    /** Solo en `GET /roles/`. */
    users_count?: number | null;
    /** Rol que la plataforma usa por nombre: no se borra ni se renombra. */
    is_system?: boolean | null;
}

export interface AdminUserDetail extends AdminUser {
    id_front_url?: string | null;
    id_back_url?: string | null;
    proof_of_address_url?: string | null;
}

export interface UserSearchParams {
    skip?: number;
    limit?: number;
    role?: string;
    q?: string;
    is_active?: boolean;
    verification_status?: string;
    order_by?: 'created_at_desc' | 'created_at_asc' | 'name_asc' | 'name_desc' | 'email_asc';
}

export interface UserPage {
    items: AdminUser[];
    total: number;
}

export interface UserStats {
    total_users: number;
    active_users: number;
    inactive_users: number;
    role_distribution: Record<string, number>;
    verification_status: {
        pending: number;
        verified: number;
        rejected: number;
    };
}

class AdminUsersService {
    private baseUrl = '/users';

    // Obtener todos los usuarios
    async getUsers(skip: number = 0, limit: number = 100): Promise<AdminUser[]> {
        return apiFetch('core', `${this.baseUrl}/?skip=${skip}&limit=${limit}`);
    }

    // Búsqueda paginada con filtros en el servidor (`GET /users/search`)
    async searchUsers(params: UserSearchParams = {}): Promise<UserPage> {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
        });
        return apiFetch('core', `${this.baseUrl}/search?${qs}`);
    }

    // Detalle de un usuario con documentos KYC firmados
    async getUser(userId: string): Promise<AdminUserDetail> {
        return apiFetch('core', `${this.baseUrl}/${userId}`);
    }

    // Obtener estadísticas de usuarios
    async getUsersStats(): Promise<UserStats> {
        return apiFetch('core', `${this.baseUrl}/stats/summary`);
    }

    // Activar/desactivar usuario
    async toggleUserStatus(userId: string): Promise<AdminUser> {
        return apiFetch('core', `${this.baseUrl}/${userId}/toggle-status`, {
            method: 'POST',
        });
    }

    // Eliminar usuario
    async deleteUser(userId: string): Promise<{ message: string; user_id: string }> {
        return apiFetch('core', `${this.baseUrl}/${userId}`, {
            method: 'DELETE',
        });
    }

    // Crear nuevo usuario
    async createUser(userData: {
        email: string;
        full_name: string;
        password: string;
        role_id?: string;
        is_active?: boolean;
    }): Promise<AdminUser> {
        return apiFetch('core', `${this.baseUrl}/`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    // Actualizar usuario existente
    async updateUser(userId: string, userData: Partial<AdminUser> & { password?: string }): Promise<AdminUser> {
        return apiFetch('core', `${this.baseUrl}/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
    }

    // Obtener usuarios pendientes de verificación
    async getPendingVerifications(): Promise<AdminUser[]> {
        return apiFetch('core', `${this.baseUrl}/pending-verifications`);
    }

    // --- Roles ---
    async getRoles(): Promise<AdminRole[]> {
        return apiFetch('core', '/roles/');
    }

    async createRole(data: Pick<AdminRole, 'name' | 'description'>): Promise<AdminRole> {
        return apiFetch('core', '/roles/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateRole(id: string, data: Partial<Pick<AdminRole, 'name' | 'description'>>): Promise<AdminRole> {
        return apiFetch('core', `/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteRole(id: string): Promise<void> {
        return apiFetch('core', `/roles/${id}`, {
            method: 'DELETE',
        });
    }
}

export const adminUsersService = new AdminUsersService();
