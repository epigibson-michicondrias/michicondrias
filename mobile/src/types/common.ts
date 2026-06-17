/**
 * Common shared types used across the app
 */

/** Standard paginated API response */
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

/** Standard API error shape */
export interface ApiError {
    detail: string;
    status_code?: number;
}

/** Generic select option for dropdowns */
export interface SelectOption {
    label: string;
    value: string;
}

/** Generic filter chip option */
export interface FilterOption {
    label: string;
    value: string;
    icon?: string;
}

/** Generic form field error */
export interface FieldError {
    field: string;
    message: string;
}

/** Image upload result */
export interface UploadResult {
    url: string;
    object_key: string;
}

/** Date range for filters */
export interface DateRange {
    start: Date;
    end: Date;
}

/** Status badge configuration */
export interface StatusConfig {
    label: string;
    color: string;
    backgroundColor: string;
}

/** Common entity with timestamps */
export interface BaseEntity {
    id: string;
    created_at?: string;
    updated_at?: string;
}

/** User reference (minimal user info for display) */
export interface UserRef {
    id: string;
    full_name: string;
    email: string;
    photo_url?: string;
}
