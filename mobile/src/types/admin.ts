/**
 * @module types/admin
 * @description Types for the admin domain — user management, statistics,
 * and verification workflows.
 */

// ─── Admin Users ────────────────────────────────────────────────────────────────

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

// ─── User Statistics ────────────────────────────────────────────────────────────

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

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Verification status options */
export const VERIFICATION_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Verificado', value: 'verified' },
    { label: 'Rechazado', value: 'rejected' },
] as const;
