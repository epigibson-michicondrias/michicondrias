import { apiFetch, getToken } from '../lib/api';

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

    // Obtener usuarios pendientes de verificación
    async getPendingVerifications(): Promise<AdminUser[]> {
        return apiFetch('core', `${this.baseUrl}/pending-verifications`);
    }

    // Verificar/rechazar KYC de usuario
    async verifyUserKYC(userId: string, status: 'VERIFIED' | 'REJECTED'): Promise<AdminUser> {
        return apiFetch('core', `${this.baseUrl}/${userId}/verify?status=${status}`, {
            method: 'POST',
        });
    }
}

export const adminUsersService = new AdminUsersService();
