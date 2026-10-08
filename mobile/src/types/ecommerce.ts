/**
 * @module types/ecommerce
 * @description Types for the e-commerce domain — product categories, products,
 * reviews, orders, and donations.
 */

export interface Category {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
}

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
    /** Los productos nuevos esperan aprobación de un admin antes de verse en la tienda. */
    is_approved?: boolean | null;
    subcategory_id?: string | null;
    seller_id: string | null;
    specifications: string | null;
    average_rating: number;
    review_count: number;
}

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

export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    product?: Product;
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_address?: string;
    created_at: string;
    items?: OrderItem[];
}

export interface OrderCreate {
    items: { product_id: string; quantity: number }[];
    shipping_address?: string;
}

export interface Donation {
    id: string;
    user_id: string | null;
    amount: number;
    currency: string;
    message: string | null;
    date: string;
    /** pending (esperando pago) | paid | expired | failed ("completed" = registros anteriores al cobro real) */
    status: string;
    paid_at?: string | null;
}

/** ¿Puede el usuario opinar sobre el producto? (`GET /products/{id}/review-eligibility`) */
export interface ReviewEligibility {
    can_review: boolean;
    reason: 'not_purchased' | 'already_reviewed' | null;
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
