import { apiFetch } from "../lib/api";

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

export async function getMyProducts(): Promise<Product[]> {
    return apiFetch<Product[]>("ecommerce", "/products/seller/me");
}

export async function getProduct(productId: string): Promise<Product> {
    return apiFetch<Product>("ecommerce", `/products/${productId}`);
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
    return apiFetch<Product>("ecommerce", "/products/", {
        method: "POST",
        body: JSON.stringify(productData),
    });
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    return apiFetch<Product>("ecommerce", `/products/${productId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteProduct(productId: string): Promise<void> {
    return apiFetch<void>("ecommerce", `/products/${productId}`, {
        method: "DELETE",
    });
}

// REVIEWS
export async function getReviews(productId: string): Promise<Review[]> {
    return apiFetch<Review[]>("ecommerce", `/products/${productId}/reviews`);
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

export async function getSellerOrders(): Promise<Order[]> {
    return apiFetch<Order[]>("ecommerce", "/orders/seller/me");
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return apiFetch<Order>("ecommerce", `/orders/${orderId}/status?status=${status}`, {
        method: "PATCH",
    });
}

// PAYMENTS & SUBSCRIPTIONS
export async function createCheckoutSession(orderId: string): Promise<{ sessionId: string, url: string }> {
    return apiFetch<{ sessionId: string, url: string }>("ecommerce", `/payments/create-checkout-session/${orderId}`, {
        method: "POST"
    });
}

// DONATIONS
export async function createDonation(amount: number, message?: string): Promise<Donation> {
    return apiFetch<Donation>("ecommerce", "/donations/", {
        method: "POST",
        body: JSON.stringify({ amount, currency: "MXN", message }),
    });
}

export async function getCategories(): Promise<Category[]> {
    return apiFetch<Category[]>("ecommerce", "/categories/");
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
    return apiFetch<Category>("ecommerce", "/categories/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return apiFetch<Category>("ecommerce", `/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteCategory(id: string): Promise<void> {
    return apiFetch<void>("ecommerce", `/categories/${id}`, {
        method: "DELETE",
    });
}
