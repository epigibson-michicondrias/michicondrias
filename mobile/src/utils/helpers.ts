/**
 * Shared helper utilities
 */

/**
 * S3 bucket base URL for uploaded assets
 */
export const S3_BUCKET_URL = 'https://michicondrias-storage-1.s3.us-east-1.amazonaws.com';

/**
 * Build full S3 URL from object key
 */
export function getS3Url(objectKey: string): string {
    return `${S3_BUCKET_URL}/${objectKey}`;
}

/**
 * Get file extension from URI
 */
export function getFileExtension(uri: string): string {
    const match = uri.match(/\.(\w+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : 'jpg';
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
