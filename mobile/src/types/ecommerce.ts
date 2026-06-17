/**
 * @module types/ecommerce
 * @description Types for the e-commerce domain — product categories, products,
 * reviews, orders, and donations.
 */

// ─── Categories ─────────────────────────────────────────────────────────────────

export interface Category {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
}

// ─── Products ───────────────────────────────────────────────────────────────────

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category_id: string | null;
    category?: Category;
    image_url: string | null;
    is_active: boolean;
    seller_id: string | null;
    specifications: string | null;
    average_rating: number;
    review_count: number;
}

// ─── Reviews ────────────────────────────────────────────────────────────────────

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface ReviewCreate {
    rating: number;
    comment?: string;
}

// ─── Orders ─────────────────────────────────────────────────────────────────────

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_address?: string;
    created_at: string;
}

export interface OrderCreate {
    items: { product_id: string; quantity: number }[];
    shipping_address?: string;
}

// ─── Donations ──────────────────────────────────────────────────────────────────

export interface Donation {
    id: string;
    user_id: string | null;
    amount: number;
    currency: string;
    message: string | null;
    date: string;
    status: string;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Order status options */
export const ORDER_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Confirmado', value: 'confirmed' },
    { label: 'Enviado', value: 'shipped' },
    { label: 'Entregado', value: 'delivered' },
    { label: 'Cancelado', value: 'cancelled' },
] as const;

/** Default donation currency */
export const DEFAULT_DONATION_CURRENCY = 'MXN';
