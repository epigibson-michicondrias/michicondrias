import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import { useAuth } from '@/src/contexts/AuthContext';
import { cartKey, addressKey, removeLegacyCartKeys } from '../lib/cartStorage';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    /** Devuelve false si no se pudo agregar (agotado o límite de stock alcanzado). */
    addToCart: (product: Product, quantity?: number) => boolean;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    /** Actualiza precio y stock de los productos en la bolsa (los que no lleguen se quedan como están). */
    syncProducts: (products: Product[]) => void;
    cartTotal: number;
    cartCount: number;
    /** Última dirección de envío usada por este usuario (se guarda al pagar). */
    savedAddress: string;
    rememberAddress: (address: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Carrito y dirección se guardan por usuario (src/lib/cartStorage): nunca se muestran a otra cuenta en el mismo
// teléfono. Si la sesión vence se conservan; solo se borran al cerrar sesión a propósito (AuthContext.signOut).
// Aquí NO hay red: el checkout vive en `hooks/ecommerce/useCheckout` y el refresco de precio/stock en
// `hooks/ecommerce/useCartProducts`.

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [items, setItems] = useState<CartItem[]>([]);
    const [savedAddress, setSavedAddress] = useState('');
    // Usuario cuyo carrito ya se cargó; evita guardar el carrito vacío encima del guardado antes de leerlo.
    const loadedFor = useRef<string | null>(null);

    // Cambio de sesión: se vacía lo visible y se carga lo del usuario nuevo.
    useEffect(() => {
        loadedFor.current = null;
        setItems([]);
        setSavedAddress('');
        if (!userId) return;

        let cancelled = false;
        (async () => {
            await removeLegacyCartKeys();
            try {
                const [[, storedCart], [, storedAddress]] = await AsyncStorage.multiGet([cartKey(userId), addressKey(userId)]);
                if (cancelled) return;
                const stored: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
                // Si el usuario agregó algo mientras se leía, se conserva junto a lo guardado
                setItems((current) => [...stored.filter((s) => !current.some((c) => c.product.id === s.product.id)), ...current]);
                if (storedAddress) setSavedAddress(storedAddress);
                loadedFor.current = userId;
            } catch {
                // Lectura fallida: no se marca como cargado para no sobrescribir lo guardado con un carrito parcial
            }
        })();
        return () => { cancelled = true; };
    }, [userId]);

    // Guardar el carrito del usuario actual cada vez que cambia
    useEffect(() => {
        if (!userId || loadedFor.current !== userId) return;
        AsyncStorage.setItem(cartKey(userId), JSON.stringify(items)).catch(() => {});
    }, [items, userId]);

    const rememberAddress = (address: string) => {
        setSavedAddress(address);
        if (userId) AsyncStorage.setItem(addressKey(userId), address).catch(() => {});
    };

    const addToCart = (product: Product, quantity: number = 1): boolean => {
        const stock = product.stock ?? 0;
        const inCart = items.find(item => item.product.id === product.id)?.quantity ?? 0;
        if (stock <= 0) {
            showAlert({ type: 'warning', title: 'Producto agotado', message: 'Por ahora no hay unidades disponibles de este producto.' });
            return false;
        }
        if (inCart >= stock) {
            showAlert({ type: 'info', title: 'Ya tienes todo el stock', message: `Solo hay ${stock} ${stock === 1 ? 'unidad disponible' : 'unidades disponibles'} y ya están en tu bolsa.` });
            return false;
        }
        const toAdd = Math.max(1, Math.min(quantity, stock - inCart));
        if (toAdd < quantity) {
            showAlert({ type: 'info', title: 'Cantidad ajustada', message: `Solo hay ${stock} ${stock === 1 ? 'unidad disponible' : 'unidades disponibles'}; agregamos ${toAdd}.` });
        }
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, product, quantity: item.quantity + toAdd }
                        : item
                );
            }
            return [...prevItems, { product, quantity: toAdd }];
        });
        return true;
    };

    const removeFromCart = (productId: string) => {
        setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item => {
                if (item.product.id !== productId) return item;
                const stock = item.product.stock ?? 0;
                // No se permite pedir más unidades que el stock conocido del producto
                return { ...item, quantity: stock > 0 ? Math.min(quantity, stock) : quantity };
            })
        );
    };

    const clearCart = useCallback(() => setItems([]), []);

    /**
     * Precio y stock frescos para lo que hay en la bolsa (el snapshot del carrito puede quedar viejo):
     * se ajusta la cantidad al stock y se retiran los que ya no están disponibles.
     */
    const syncProducts = useCallback((products: Product[]) => {
        const byId = new Map(products.map((p) => [p.id, p]));
        let removed = 0;
        let changed = false;
        const next = items.flatMap((item) => {
            const fresh = byId.get(item.product.id);
            if (!fresh) return [item]; // sin actualización: se queda como estaba
            const stock = fresh.stock ?? 0;
            if (stock <= 0) {
                removed += 1;
                changed = true;
                return [];
            }
            const quantity = Math.min(item.quantity, stock);
            if (quantity !== item.quantity || fresh.price !== item.product.price) changed = true;
            return [{ product: fresh, quantity }];
        });
        if (removed > 0) {
            showAlert({
                type: 'info',
                title: 'Bolsa actualizada',
                message: removed === 1
                    ? 'Un producto ya no está disponible y se quitó de tu bolsa.'
                    : `${removed} productos ya no están disponibles y se quitaron de tu bolsa.`,
            });
        }
        if (changed) setItems(next);
    }, [items]);

    const cartTotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            syncProducts,
            cartTotal,
            cartCount,
            savedAddress,
            rememberAddress,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
