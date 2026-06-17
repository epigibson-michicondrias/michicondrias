/**
 * @module types/venues
 * @description Types for the venues/establishments domain — venue profiles,
 * reviews, and discount coupon system.
 */

// ─── Venues ─────────────────────────────────────────────────────────────────────

export interface Venue {
    id: string;
    owner_id: string;
    name: string;
    address: string;
    amenities?: Record<string, any>;
    discount_coupon?: string;
    discount_description?: string;
}

export interface VenueCreate {
    name: string;
    address: string;
    amenities?: Record<string, any>;
    discount_coupon?: string;
    discount_description?: string;
}

export interface VenueUpdate {
    name?: string;
    address?: string;
    amenities?: Record<string, any>;
    discount_coupon?: string;
    discount_description?: string;
}

// ─── Reviews ────────────────────────────────────────────────────────────────────

export interface VenueReview {
    id: string;
    client_id: string;
    venue_id: string;
    rating: number;
    review_text?: string;
    created_at: string;
}

export interface VenueReviewCreate {
    rating: number;
    review_text?: string;
}

// ─── Coupons ────────────────────────────────────────────────────────────────────

export interface ClaimedCoupon {
    id: string;
    client_id: string;
    venue_id: string;
    coupon_code: string;
    status: string;
    claimed_at: string;
}

// ─── Score ──────────────────────────────────────────────────────────────────────

export interface VenueScore {
    venue_id: string;
    average_rating: number;
    reviews_count: number;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Coupon status options */
export const COUPON_STATUS_OPTIONS = [
    { label: 'Disponible', value: 'available' },
    { label: 'Reclamado', value: 'claimed' },
    { label: 'Canjeado', value: 'redeemed' },
    { label: 'Expirado', value: 'expired' },
] as const;
