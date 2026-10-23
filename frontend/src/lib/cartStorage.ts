/** Carrito y dirección por usuario (espejo de `mobile/src/lib/cartStorage.ts`). En la web: `localStorage`. */
export const CART_STORAGE_KEY = "@michicondrias_cart";
export const ADDRESS_STORAGE_KEY = "@michicondrias_shipping_address";

export const cartKey = (userId: string) => `${CART_STORAGE_KEY}:${userId}`;
export const addressKey = (userId: string) => `${ADDRESS_STORAGE_KEY}:${userId}`;

export async function removeLegacyCartKeys() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(ADDRESS_STORAGE_KEY);
  } catch {
    // Sin almacenamiento.
  }
}

export async function clearStoredCart(userId: string) {
  try {
    localStorage.removeItem(cartKey(userId));
    localStorage.removeItem(addressKey(userId));
  } catch {
    // Sin almacenamiento.
  }
}
