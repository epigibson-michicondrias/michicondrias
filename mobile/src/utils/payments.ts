/**
 * openStripeUrl — abre una pasarela de Stripe (checkout, suscripción o portal de facturación).
 * En nativo usa la sesión de navegador de `expo-web-browser`: se cierra sola cuando el pago
 * vuelve a la app por deep link (`michicondrias://…`), y si el usuario la cierra a mano no pasa
 * nada: el pedido y la bolsa siguen ahí. En web navega la pestaña como hasta ahora.
 */
import { Linking, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const APP_REDIRECT = 'michicondrias://';

export async function openStripeUrl(url: string): Promise<void> {
    if (!url) throw new Error('No se puede abrir el enlace de pago.');

    if (Platform.OS === 'web') {
        const supported = await Linking.canOpenURL(url);
        if (!supported) throw new Error('No se puede abrir el enlace de pago.');
        await Linking.openURL(url);
        return;
    }

    const result = await WebBrowser.openAuthSessionAsync(url, APP_REDIRECT);
    if (result.type !== 'success' && result.type !== 'cancel' && result.type !== 'dismiss') {
        throw new Error('No se puede abrir el enlace de pago.');
    }
}
