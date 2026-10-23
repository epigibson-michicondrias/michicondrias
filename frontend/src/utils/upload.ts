/**
 * Subida de imágenes a URL firmada (espejo de `mobile/src/utils/upload.ts`).
 * Lanza un error si el almacenamiento la rechaza: la foto guardada tiene que existir de verdad.
 */
import { getFileExtension, getImageMimeType } from '@/utils/helpers';

export async function uploadImageToPresignedUrl(imageUri: string, url: string, ext?: string): Promise<void> {
    const extension = ext || getFileExtension(imageUri);
    const blob = await (await fetch(imageUri)).blob();
    const res = await fetch(url, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': getImageMimeType(extension) },
    });
    if (!res.ok) {
        throw new Error('No se pudo subir la imagen. Revisa tu conexión e inténtalo de nuevo.');
    }
}
