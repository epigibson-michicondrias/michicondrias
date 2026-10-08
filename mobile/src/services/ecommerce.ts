import { apiFetch } from "../lib/api";
import type {
    Category, Product, Review, ReviewCreate, ReviewEligibility, OrderItem, Order, OrderCreate, Donation,
} from "@/src/types/ecommerce";

export type { Category, Product, Review, ReviewCreate, ReviewEligibility, OrderItem, Order, OrderCreate, Donation };

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

export async function getProductPresignedUrl(ext: string): Promise<{ url: string; object_key: string; public_url: string }> {
    return apiFetch<{ url: string; object_key: string; public_url: string }>("ecommerce", `/products/presigned-url?file_extension=${encodeURIComponent(ext)}`);
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

export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
    return apiFetch<ReviewEligibility>("ecommerce", `/products/${productId}/review-eligibility`);
}

// ORDERS
export async function createOrder(data: OrderCreate): Promise<Order> {
    return apiFetch<Order>("ecommerce", "/orders/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/** Página de "Mis compras" (el backend devuelve como máximo 50 por página). */
export const MY_ORDERS_PAGE_SIZE = 20;

export async function getMyOrders(skip = 0, limit = MY_ORDERS_PAGE_SIZE): Promise<Order[]> {
    return apiFetch<Order[]>("ecommerce", `/orders/me?skip=${skip}&limit=${limit}`);
}

export async function getSellerOrders(): Promise<Order[]> {
    return apiFetch<Order[]>("ecommerce", "/orders/seller/me");
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return apiFetch<Order>("ecommerce", `/orders/${orderId}/status?status=${status}`, {
        method: "PATCH",
    });
}

export async function getOrder(orderId: string): Promise<Order> {
    return apiFetch<Order>("ecommerce", `/orders/${orderId}`);
}

// PAYMENTS & SUBSCRIPTIONS
export async function createCheckoutSession(orderId: string): Promise<{ sessionId: string, url: string }> {
    return apiFetch<{ sessionId: string, url: string }>("ecommerce", `/payments/create-checkout-session/${orderId}?source=app`, {
        method: "POST"
    });
}

export async function createSubscriptionSession(petId: string): Promise<{ sessionId: string, url: string }> {
    return apiFetch<{ sessionId: string, url: string }>("ecommerce", `/payments/create-subscription-session/${petId}?source=app`, {
        method: "POST"
    });
}

export async function createBillingPortalSession(): Promise<{ url: string }> {
    return apiFetch<{ url: string }>("ecommerce", "/payments/billing/portal-session", {
        method: "POST"
    });
}


// DONATIONS
/** Crea la donación (pendiente) y la sesión de Stripe Checkout; se marca "paid" por webhook. */
export async function createDonationCheckout(amount: number, message?: string): Promise<{ donation_id: string; sessionId: string; url: string }> {
    return apiFetch<{ donation_id: string; sessionId: string; url: string }>("ecommerce", "/donations/checkout", {
        method: "POST",
        body: JSON.stringify({ amount, message: message?.trim() || undefined, source: "app" }),
    });
}

/** Estado de una donación (el backend verifica con Stripe si sigue pendiente). */
export async function getDonation(donationId: string): Promise<Donation> {
    return apiFetch<Donation>("ecommerce", `/donations/${donationId}`);
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

// --- Subcategories ---

export interface Subcategory {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    image_url?: string | null;
}

export async function getSubcategories(categoryId: string): Promise<Subcategory[]> {
    return apiFetch<Subcategory[]>("ecommerce", `/categories/${categoryId}/subcategories`);
}

export async function createSubcategory(data: Partial<Subcategory>): Promise<Subcategory> {
    return apiFetch<Subcategory>("ecommerce", "/categories/subcategories", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSubcategory(id: string, data: Partial<Subcategory>): Promise<Subcategory> {
    return apiFetch<Subcategory>("ecommerce", `/categories/subcategories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSubcategory(id: string): Promise<void> {
    return apiFetch<void>("ecommerce", `/categories/subcategories/${id}`, {
        method: "DELETE",
    });
}

// --- Admin Orders ---

export async function getAdminOrders(): Promise<Order[]> {
    return apiFetch<Order[]>("ecommerce", "/orders/admin/all");
}

export async function adminUpdateOrderStatus(orderId: string, status: string): Promise<Order> {
    return apiFetch<Order>("ecommerce", `/orders/admin/${orderId}/status?status=${status}`, {
        method: "PATCH",
    });
}

// --- Product Reviews (create) ---

export async function createProductReview(
    productId: string,
    data: ReviewCreate
): Promise<Review> {
    return apiFetch<Review>("ecommerce", `/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
