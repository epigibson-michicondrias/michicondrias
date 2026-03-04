import { apiFetch } from "../api";

export interface Category {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
}

export interface Subcategory {
    id: string;
    name: string;
    description: string | null;
    category_id: string;
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
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    shipping_address?: string;
    created_at: string;
    items: OrderItem[];
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
    status: string;
}

// PRODUCTS
export async function getProducts(category?: string, sellerId?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (sellerId) params.append("seller_id", sellerId);

    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<Product[]>("ecommerce", `/products/${qs}`);
}

export async function getProduct(productId: string): Promise<Product> {
    return apiFetch<Product>("ecommerce", `/products/${productId}`);
}

export async function getEcommercePresignedUrl(extension: string): Promise<{ url: string; object_key: string; public_url: string }> {
    return apiFetch<{ url: string; object_key: string; public_url: string }>("ecommerce", `/products/presigned-url?file_extension=${extension}`);
}

export async function createProduct(productData: Partial<Product> & { image_url?: string }): Promise<Product> {
    return apiFetch<Product>("ecommerce", "/products/", {
        method: "POST",
        body: JSON.stringify(productData),
    });
}

// REVIEWS
export async function getReviews(productId: string): Promise<Review[]> {
    return apiFetch<Review[]>("ecommerce", `/products/${productId}/reviews`);
}

export async function createReview(productId: string, review: ReviewCreate): Promise<Review> {
    return apiFetch<Review>("ecommerce", `/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify(review),
    });
}

// ORDERS
export async function createOrder(data: OrderCreate): Promise<Order> {
    return apiFetch<Order>("ecommerce", "/orders/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMyOrders(): Promise<Order[]> {
    return apiFetch<Order[]>("ecommerce", "/orders/me");
}

// DONATIONS
export async function getDonations(): Promise<Donation[]> {
    return apiFetch<Donation[]>("ecommerce", "/donations/");
}

export async function createCheckoutSession(orderId: string): Promise<{ sessionId: string, url: string }> {
    return apiFetch<{ sessionId: string, url: string }>("ecommerce", `/payments/create-checkout-session/${orderId}`, {
        method: "POST"
    });
}

export async function createDonation(amount: number, message?: string): Promise<Donation> {
    return apiFetch<Donation>("ecommerce", "/donations/", {
        method: "POST",
        body: JSON.stringify({ amount, currency: "MXN", message }),
    });
}

// CATEGORIES
export async function getCategories(): Promise<Category[]> {
    return apiFetch<Category[]>("ecommerce", "/categories/");
}
