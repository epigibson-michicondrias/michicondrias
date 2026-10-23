/**
 * Utilidades compartidas (espejo de `mobile/src/utils/helpers.ts`).
 */

/** Base URL pública del storage (debe coincidir con STORAGE_PUBLIC_BASE_URL del backend). */
export const S3_BUCKET_URL = (
    process.env.NEXT_PUBLIC_STORAGE_URL || 'https://objectstorage.us-ashburn-1.oraclecloud.com/n/idoshxlv8ry1/b/michicondrias-storage/o'
).replace(/\/+$/, '');

/** URL completa del objeto a partir de su clave. Tolera que el backend ya devuelva la URL. */
export function getS3Url(objectKey: string): string {
    if (/^https?:\/\//i.test(objectKey)) return objectKey;
    return `${S3_BUCKET_URL}/${objectKey.replace(/^\/+/, '')}`;
}

/** Extensión del archivo en una URI/nombre. */
export function getFileExtension(uri: string): string {
    const match = uri.match(/\.(\w+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : 'jpg';
}

/** Copia texto al portapapeles del navegador. */
export async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export function getImageMimeType(ext: string): string {
    const map: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
    };
    return map[ext.toLowerCase()] || 'image/jpeg';
}
