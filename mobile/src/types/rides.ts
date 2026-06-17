/**
 * @module types/rides
 * @description Types for the pet rides/transportation domain — ride requests,
 * driver profiles, location tracking, and fare estimation.
 */

// ─── Pet Rides ──────────────────────────────────────────────────────────────────

export interface PetRide {
    id: string;
    driver_id: string;
    pet_id: string;
    origin_address: string;
    destination_address: string;
    price?: number;
    requires_carrier: boolean;
    current_lat?: number;
    current_lng?: number;
    status: string;
}

export interface PetRideCreate {
    driver_id: string;
    pet_id: string;
    origin_address: string;
    destination_address: string;
    price?: number;
    requires_carrier?: boolean;
    current_lat?: number;
    current_lng?: number;
}

// ─── Location Tracking ─────────────────────────────────────────────────────────

export interface RideLocationUpdate {
    current_lat: number;
    current_lng: number;
}

export interface RideTrack {
    id: string;
    status: string;
    current_lat?: number;
    current_lng?: number;
}

// ─── Driver Profiles ────────────────────────────────────────────────────────────

export interface DriverProfile {
    id: string;
    driver_id: string;
    vehicle_model: string;
    vehicle_plate: string;
    max_capacity: number;
    has_air_conditioning: boolean;
    has_carriers: boolean;
    is_available: boolean;
    updated_at: string;
}

export interface DriverProfileCreate {
    vehicle_model: string;
    vehicle_plate: string;
    max_capacity?: number;
    has_air_conditioning?: boolean;
    has_carriers?: boolean;
    is_available?: boolean;
}

// ─── Fare Estimation ────────────────────────────────────────────────────────────

export interface RideEstimateRequest {
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
    requires_carrier?: boolean;
}

export interface RideEstimateOut {
    distance_km: number;
    estimated_duration_minutes: number;
    estimated_fare: number;
}

// ─── Driver History ─────────────────────────────────────────────────────────────

export interface DriverRideHistory {
    driver_id: string;
    total_earnings: number;
    rides_count: number;
    rides: PetRide[];
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Ride status options */
export const RIDE_STATUS_OPTIONS = [
    { label: 'Solicitado', value: 'requested' },
    { label: 'Aceptado', value: 'accepted' },
    { label: 'En camino', value: 'en-route' },
    { label: 'Recogido', value: 'picked-up' },
    { label: 'Completado', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' },
] as const;
