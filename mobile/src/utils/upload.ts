import { getFileExtension, getImageMimeType } from '@/src/utils/helpers';

/**
 * Sube una imagen local a una URL firmada de almacenamiento.
 * Lanza un error si el almacenamiento la rechaza: antes la respuesta no se revisaba y la app guardaba
 * la mascota/reporte con una foto que en realidad no existía.
 */
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
