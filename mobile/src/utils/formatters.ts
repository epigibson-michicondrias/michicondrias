/**
 * Shared formatting utilities
 * Centralized to avoid duplication across screens
 */

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string | undefined | null, options?: { includeTime?: boolean }): string {
    if (!dateStr) return 'Sin fecha';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Fecha inválida';

        const dateFormatted = date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        if (options?.includeTime) {
            const time = date.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
            });
            return `${dateFormatted} ${time}`;
        }

        return dateFormatted;
    } catch {
        return 'Fecha inválida';
    }
}

/**
 * Format a date to relative time (e.g., "hace 2 horas")
 */
export function getTimeAgo(dateStr: string | undefined | null): string {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Justo ahora';
        if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
        return formatDate(dateStr);
    } catch {
        return '';
    }
}

/**
 * Format currency in MXN
 */
export function formatCurrency(amount: number | undefined | null): string {
    if (amount == null) return '$0.00';
    return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format age in months to a readable string
 */
export function formatAge(months: number | undefined | null): string {
    if (!months) return 'Edad desconocida';
    if (months < 12) return `${months} mes${months > 1 ? 'es' : ''}`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} año${years > 1 ? 's' : ''}`;
    return `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
}

/**
 * Get emoji for pet species
 */
export function getSpeciesEmoji(species: string | undefined | null): string {
    switch (species?.toLowerCase()) {
        case 'perro': return '🐕';
        case 'gato': return '🐈';
        case 'ave': return '🐦';
        case 'conejo': return '🐰';
        case 'hamster': return '🐹';
        case 'pez': return '🐟';
        case 'reptil': return '🦎';
        default: return '🐾';
    }
}

/**
 * Get species display label with emoji
 */
export function getSpeciesLabel(species: string | undefined | null): string {
    if (!species) return '🐾 Sin especie';
    const emoji = getSpeciesEmoji(species);
    const label = species.charAt(0).toUpperCase() + species.slice(1);
    return `${emoji} ${label}`;
}

/**
 * Get gender display label
 */
export function getGenderLabel(gender: string | undefined | null): string {
    switch (gender?.toLowerCase()) {
        case 'macho': return '♂️ Macho';
        case 'hembra': return '♀️ Hembra';
        default: return 'Sin definir';
    }
}

/**
 * Get color for a status string
 */
export function getStatusColor(status: string | undefined | null): { color: string; bg: string } {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
        case 'ACTIVO':
        case 'VERIFIED':
        case 'APROBADO':
        case 'COMPLETED':
        case 'COMPLETADO':
            return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
        case 'PENDING':
        case 'PENDIENTE':
        case 'EN_REVISION':
        case 'EN_PROCESO':
            return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
        case 'REJECTED':
        case 'RECHAZADO':
        case 'CANCELLED':
        case 'CANCELADO':
        case 'INACTIVE':
        case 'INACTIVO':
            return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
        case 'UNVERIFIED':
        case 'SIN_VERIFICAR':
            return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
        default:
            return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string | undefined | null, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + '...';
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | undefined | null): string {
    if (!phone) return '';
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
}

/**
 * Format weight in kg
 */
export function formatWeight(kg: number | undefined | null): string {
    if (kg == null) return 'Sin peso';
    return `${kg.toFixed(1)} kg`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string | undefined | null): string {
    if (!text) return '';
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
}
