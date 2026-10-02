import { Share } from 'react-native';

/** Abre el menú nativo de compartir. Ignora la cancelación del usuario. */
export async function shareContent(title: string, message: string): Promise<void> {
    try {
        await Share.share({ title, message });
    } catch {
        // el usuario cerró el menú o el sistema no pudo abrirlo
    }
}
