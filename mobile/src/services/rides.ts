import { apiFetch } from "../lib/api";

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

export async function requestRide(data: PetRideCreate): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", "/request", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateLocation(rideId: string, data: RideLocationUpdate): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/location`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function trackRide(rideId: string): Promise<RideTrack> {
    return apiFetch<RideTrack>("transportistas", `/${rideId}/track`);
}

export async function createOrUpdateDriverProfile(data: DriverProfileCreate): Promise<DriverProfile> {
    return apiFetch<DriverProfile>("transportistas", "/driver-profile", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMyDriverProfile(): Promise<DriverProfile> {
    return apiFetch<DriverProfile>("transportistas", "/driver-profile");
}

export async function getAvailableDrivers(): Promise<DriverProfile[]> {
    return apiFetch<DriverProfile[]>("transportistas", "/drivers/available");
}

export async function estimateFare(data: RideEstimateRequest): Promise<RideEstimateOut> {
    return apiFetch<RideEstimateOut>("transportistas", "/estimate", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function startRide(rideId: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/start`, {
        method: "POST",
    });
}

export async function finishRide(rideId: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/finish`, {
        method: "POST",
    });
}

export async function getDriverRideHistory(): Promise<{
    driver_id: string;
    total_earnings: number;
    rides_count: number;
    rides: PetRide[];
}> {
    return apiFetch("transportistas", "/history/driver");
}
