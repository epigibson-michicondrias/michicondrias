import { apiFetch } from "../api";

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category: string | null;
    image_url: string | null;
    is_active: boolean;
    seller_id: string | null;
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

export async function getProducts(category?: string, sellerId?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (sellerId) params.append("seller_id", sellerId);

    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiFetch<Product[]>("ecommerce", `/products/${qs}`);
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
    return apiFetch<Product>("ecommerce", "/products/", {
        method: "POST",
        body: JSON.stringify(product),
    });
}

export async function getDonations(): Promise<Donation[]> {
    return apiFetch<Donation[]>("ecommerce", "/donations/");
}

export async function createDonation(amount: number, message?: string): Promise<Donation> {
    return apiFetch<Donation>("ecommerce", "/donations/", {
        method: "POST",
        body: JSON.stringify({ amount, currency: "MXN", message }),
    });
}
