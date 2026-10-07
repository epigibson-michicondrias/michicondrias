/**
 * Almacenamiento local del carrito y la dirección de envío, separado por usuario.
 * Lo usan CartContext (leer/guardar) y AuthContext (borrar al cerrar sesión a propósito).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@michicondrias_cart';
const ADDRESS_STORAGE_KEY = '@michicondrias_shipping_address';

export const cartKey = (userId: string) => `${CART_STORAGE_KEY}:${userId}`;
export const addressKey = (userId: string) => `${ADDRESS_STORAGE_KEY}:${userId}`;

/** Claves sin usuario de versiones anteriores: no se sabe de quién son, se descartan. */
export async function removeLegacyCartKeys() {
    try {
        await AsyncStorage.multiRemove([CART_STORAGE_KEY, ADDRESS_STORAGE_KEY]);
    } catch { /* si falla se reintenta en el siguiente arranque */ }
}

export async function clearStoredCart(userId: string) {
    try {
        await AsyncStorage.multiRemove([cartKey(userId), addressKey(userId)]);
    } catch { /* nada que borrar */ }
}
