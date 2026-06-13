import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, createOrder, createCheckoutSession } from '../services/ecommerce';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    checkout: () => Promise<void>;
    isCheckingOut: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@michicondrias_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Load initial cart
    useEffect(() => {
        const loadCart = async () => {
            try {
                const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (storedCart) {
                    setItems(JSON.parse(storedCart));
                }
            } catch (err) {
                console.error("Failed to load cart", err);
            }
        };
        loadCart();
    }, []);

    // Save cart whenever it changes
    useEffect(() => {
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(console.error);
    }, [items]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { product, quantity }];
        });
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
            prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    const checkout = async () => {
        if (items.length === 0) return;
        setIsCheckingOut(true);
        try {
            // 1. Create order in backend
            const orderPayload = {
                items: items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                }))
            };
            const order = await createOrder(orderPayload);
            
            // 2. Create Stripe Checkout Session
            const session = await createCheckoutSession(order.id);
            
            // 3. Redirect to Stripe
            const supported = await Linking.canOpenURL(session.url);
            if (supported) {
                await Linking.openURL(session.url);
                // In a real flow, Stripe redirects back via deep links (success/cancel)
                // For now, we clear the cart assuming they will finish the flow.
                clearCart();
            } else {
                Alert.alert("Error", "No se puede abrir el enlace de pago.");
            }
        } catch (error: any) {
            Alert.alert("Error de Pago", error.message || "No se pudo iniciar el pago");
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
            isCheckingOut
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
