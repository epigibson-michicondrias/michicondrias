/**
 * Shared helper utilities
 */
import { Platform } from 'react-native';

/**
 * Base URL pública del storage de archivos (AWS S3, Oracle Object Storage, etc.).
 * Configurable con EXPO_PUBLIC_STORAGE_URL; debe coincidir con STORAGE_PUBLIC_BASE_URL del backend.
 */
export const S3_BUCKET_URL = (
    process.env.EXPO_PUBLIC_STORAGE_URL || 'https://objectstorage.us-ashburn-1.oraclecloud.com/n/idoshxlv8ry1/b/michicondrias-storage/o'
).replace(/\/+$/, '');

/**
 * Build full S3 URL from object key
 */
export function getS3Url(objectKey: string): string {
    // Tolera que el backend devuelva la URL completa: antes se concatenaba y quedaba https://…/https://… (foto rota)
    if (/^https?:\/\//i.test(objectKey)) return objectKey;
    return `${S3_BUCKET_URL}/${objectKey.replace(/^\/+/, '')}`;
}

/**
 * Get file extension from URI
 */
export function getFileExtension(uri: string): string {
    const match = uri.match(/\.(\w+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Copia texto al portapapeles. En web usa el API del navegador; en nativo devuelve false
 * (sin `expo-clipboard` todavía: va en el APK de U10) y el llamador decide la alternativa.
 */
export async function copyText(text: string): Promise<boolean> {
    if (Platform.OS !== 'web') return false;
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate a placeholder image URL based on type
 */
export function getPlaceholderImage(type: 'pet' | 'user' | 'clinic' | 'product' | 'generic' = 'generic'): string {
    switch (type) {
        case 'pet': return 'https://via.placeholder.com/150/e2e8f0/94a3b8?text=🐾';
        case 'user': return 'https://via.placeholder.com/150/e2e8f0/94a3b8?text=👤';
        case 'clinic': return 'https://via.placeholder.com/150/e2e8f0/94a3b8?text=🏥';
        case 'product': return 'https://via.placeholder.com/150/e2e8f0/94a3b8?text=📦';
        default: return 'https://via.placeholder.com/150';
    }
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Filter an array by multiple text fields matching a search query
 */
export function filterBySearch<T>(
    items: T[],
    query: string,
    fields: (keyof T)[]
): T[] {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase().trim();
    return items.filter((item) =>
        fields.some((field) => {
            const value = item[field];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(lowerQuery);
            }
            return false;
        })
    );
}

/**
 * Group an array by a key
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return items.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

/**
 * Sort array by date field (newest first)
 */
export function sortByDate<T>(items: T[], field: keyof T, ascending: boolean = false): T[] {
    return [...items].sort((a, b) => {
        const dateA = new Date(a[field] as any).getTime();
        const dateB = new Date(b[field] as any).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

/**
 * Check if user has one of the specified roles
 */
export function hasRole(userRole: string | undefined | null, allowedRoles: string[]): boolean {
    if (!userRole) return false;
    return allowedRoles.includes(userRole.toLowerCase());
}

/**
 * Generate initials from a full name
 */
export function getInitials(name: string | undefined | null): string {
    if (!name) return '?';
    return name
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0].toUpperCase())
        .slice(0, 2)
        .join('');
}

const IMAGE_MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
};

/**
 * Tipo MIME de una imagen según su extensión. El backend firma la URL de subida con este mismo tipo
 * y el almacenamiento rechaza (403) la subida si el Content-Type enviado no coincide: 'jpg' debe ser 'image/jpeg', no 'image/jpg'.
 */
export function getImageMimeType(ext?: string): string {
    return IMAGE_MIME_TYPES[(ext || 'jpg').replace('.', '').toLowerCase()] || 'image/jpeg';
}
