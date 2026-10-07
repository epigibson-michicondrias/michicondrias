import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, createOrder, createCheckoutSession, updateOrderStatus } from '../services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { cartKey, addressKey, removeLegacyCartKeys } from '@/src/lib/cartStorage';

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
    cartTotal: number;
    cartCount: number;
    checkout: (shippingAddress?: string) => Promise<void>;
    isCheckingOut: boolean;
    /** Última dirección de envío usada por este usuario (se guarda al pagar). */
    savedAddress: string;
    rememberAddress: (address: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Carrito y dirección se guardan por usuario (src/lib/cartStorage): nunca se muestran a otra cuenta en el mismo
// teléfono. Si la sesión vence se conservan; solo se borran al cerrar sesión a propósito (AuthContext.signOut).

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [items, setItems] = useState<CartItem[]>([]);
    const [savedAddress, setSavedAddress] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
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

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    const checkout = async (shippingAddress?: string) => {
        if (items.length === 0) return;
        setIsCheckingOut(true);
        let orderId: string | null = null;
        try {
            // 1. Crear el pedido (aparta el stock mientras se paga)
            const orderPayload = {
                items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                })),
                shipping_address: shippingAddress?.trim() || undefined,
            };
            const order = await createOrder(orderPayload);
            orderId = order.id;

            // 2. Crear la sesión de pago en Stripe
            const session = await createCheckoutSession(order.id);

            // 3. Abrir la página de pago
            const supported = await Linking.canOpenURL(session.url);
            if (!supported) throw new Error('No se puede abrir el enlace de pago.');
            await Linking.openURL(session.url);
            // El pago se completa fuera de la app: se vacía el carrito al abrir la pasarela y se lleva al usuario
            // al pedido, donde verá su estado (pendiente → pagado) y podrá reintentar el pago o cancelar.
            clearCart();
            router.push(`/tienda/pedido/${order.id}` as any);
        } catch (error: any) {
            // Si el pedido se creó pero el pago no pudo iniciar, se cancela para devolver el stock apartado.
            // El carrito se conserva para que el usuario pueda reintentar.
            if (orderId) {
                try { await updateOrderStatus(orderId, 'cancelled'); } catch { /* si falla, el pedido pendiente se puede cancelar desde Mis compras */ }
            }
            const message = String(error?.message || '');
            const unavailable = /no est[aá]n disponibles|no se pudo iniciar el pago/i.test(message);
            showAlert({
                type: 'error',
                title: unavailable ? 'Pagos no disponibles' : 'No se pudo iniciar el pago',
                message: unavailable
                    ? 'Por el momento no podemos procesar pagos. Tu carrito se conservó; inténtalo más tarde.'
                    : (message || 'Inténtalo de nuevo en unos minutos. Tu carrito se conservó.'),
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            checkout,
            isCheckingOut,
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
