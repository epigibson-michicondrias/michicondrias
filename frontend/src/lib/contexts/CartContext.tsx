"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/services/ecommerce";
import { toast } from "react-hot-toast";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Initialize from localStorage only after component mounts (client-side)
    useEffect(() => {
        setMounted(true);
        try {
            const savedCart = localStorage.getItem("michicondrias_cart");
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Error loading cart from storage", error);
        }
    }, []);

    // Sync to localStorage whenever cart changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("michicondrias_cart", JSON.stringify(cartItems));
        }
    }, [cartItems, mounted]);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // If adding forces above stock, clamp it
                const newQuantity = Math.min(existing.quantity + quantity, product.stock);
                if (existing.quantity === product.stock) {
                    toast.error(`Ya tienes el máximo disponible (${product.stock}) en tu carrito.`);
                    return prev;
                }
                toast.success(`${product.name} actualizado en carrito.`);
                return prev.map(item =>
                    item.product.id === product.id ? { ...item, quantity: newQuantity } : item
                );
            }
            toast.success(`${product.name} agregado al carrito.`);
            return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                return { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem("michicondrias_cart");
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    // Provide empty default before mount to avoid hydration mismatch, or provide actual
    return (
        <CartContext.Provider value={{
            cartItems: mounted ? cartItems : [],
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount: mounted ? cartCount : 0,
            cartTotal: mounted ? cartTotal : 0,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
