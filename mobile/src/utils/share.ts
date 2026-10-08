import { Share } from 'react-native';

/** Abre el menú nativo de compartir. Devuelve false si el sistema no pudo abrirlo (p. ej. web sin `navigator.share`). */
export async function shareContent(title: string, message: string): Promise<boolean> {
    try {
        await Share.share({ title, message });
        return true;
    } catch {
        // el sistema no pudo abrir el menú (el usuario también puede cancelarlo sin error)
        return false;
    }
}
