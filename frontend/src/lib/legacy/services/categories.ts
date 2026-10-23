import { apiFetch } from "../api";

export interface Subcategory {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    category_id: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    subcategories: Subcategory[];
}

export interface CategoryCreate {
    name: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
}

export interface CategoryUpdate {
    name?: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
}

export interface SubcategoryCreate {
    name: string;
    description?: string;
    is_active?: boolean;
    category_id: string;
}

export interface SubcategoryUpdate {
    name?: string;
    description?: string;
    is_active?: boolean;
}

// ---- CATEGORIES ----
export async function getCategories(active_only: boolean = false): Promise<Category[]> {
    return apiFetch<Category[]>("ecommerce", `/categories/?active_only=${active_only}`);
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
    return apiFetch<Category>("ecommerce", "/categories/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateCategory(id: string, data: CategoryUpdate): Promise<Category> {
    return apiFetch<Category>("ecommerce", `/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteCategory(id: string): Promise<Category> {
    return apiFetch<Category>("ecommerce", `/categories/${id}`, {
        method: "DELETE",
    });
}

// ---- SUBCATEGORIES ----
export async function getSubcategories(categoryId: string, active_only: boolean = false): Promise<Subcategory[]> {
    return apiFetch<Subcategory[]>("ecommerce", `/categories/${categoryId}/subcategories?active_only=${active_only}`);
}

export async function createSubcategory(data: SubcategoryCreate): Promise<Subcategory> {
    return apiFetch<Subcategory>("ecommerce", "/categories/subcategories", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateSubcategory(id: string, data: SubcategoryUpdate): Promise<Subcategory> {
    return apiFetch<Subcategory>("ecommerce", `/categories/subcategories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteSubcategory(id: string): Promise<Subcategory> {
    return apiFetch<Subcategory>("ecommerce", `/categories/subcategories/${id}`, {
        method: "DELETE",
    });
}
