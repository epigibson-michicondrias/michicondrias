import { apiFetch } from "../lib/api";

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

export interface ClaimedCoupon {
    id: string;
    client_id: string;
    venue_id: string;
    coupon_code: string;
    status: string;
    claimed_at: string;
}

export async function searchVenues(params?: {
    q?: string;
    name?: string;
    address?: string;
    amenity?: string;
    skip?: number;
    limit?: number;
}): Promise<Venue[]> {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) searchParams.append(key, String(value));
        });
    }
    const query = searchParams.toString();
    return apiFetch<Venue[]>("establecimientos", `/search${query ? `?${query}` : ""}`);
}

export async function getVenue(venueId: string): Promise<Venue> {
    return apiFetch<Venue>("establecimientos", `/${venueId}`);
}

export async function createVenue(data: VenueCreate): Promise<Venue> {
    return apiFetch<Venue>("establecimientos", "/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateVenue(venueId: string, data: VenueUpdate): Promise<Venue> {
    return apiFetch<Venue>("establecimientos", `/${venueId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteVenue(venueId: string): Promise<void> {
    return apiFetch("establecimientos", `/${venueId}`, {
        method: "DELETE",
    });
}

export async function claimCoupon(venueId: string): Promise<ClaimedCoupon> {
    return apiFetch<ClaimedCoupon>("establecimientos", `/${venueId}/coupons/claim`, {
        method: "POST",
    });
}

export async function createReview(venueId: string, data: VenueReviewCreate): Promise<VenueReview> {
    return apiFetch<VenueReview>("establecimientos", `/${venueId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getVenueReviews(venueId: string): Promise<VenueReview[]> {
    return apiFetch<VenueReview[]>("establecimientos", `/${venueId}/reviews`);
}

export async function redeemCoupon(couponCode: string): Promise<ClaimedCoupon> {
    return apiFetch<ClaimedCoupon>("establecimientos", `/coupons/redeem?coupon_code=${couponCode}`, {
        method: "POST",
    });
}

export async function getVenueScore(venueId: string): Promise<{ venue_id: string; average_rating: number; reviews_count: number }> {
    return apiFetch("establecimientos", `/${venueId}/score`);
}
