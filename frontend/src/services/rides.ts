import { apiFetch } from "../lib/api";
import type {
    PetRide,
    PetRideCreate,
    RideLocationUpdate,
    RideTrack,
    DriverProfile,
    DriverProfileCreate,
    RideEstimateRequest,
    RideEstimateOut,
    DriverRideHistory,
    RideListFilter,
} from "../types/rides";

// Re-export types for backward compatibility
export type {
    PetRide,
    PetRideCreate,
    RideLocationUpdate,
    RideTrack,
    DriverProfile,
    DriverProfileCreate,
    RideEstimateRequest,
    RideEstimateOut,
    DriverRideHistory,
    RideListFilter,
};

const json = (data: unknown) => JSON.stringify(data);

// ── Cliente ──────────────────────────────────────────────────────────────────

export async function requestRide(data: PetRideCreate): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", "/request", { method: "POST", body: json(data) });
}

export async function getMyRides(status: RideListFilter | string = "all"): Promise<PetRide[]> {
    return apiFetch<PetRide[]>("transportistas", `/my?status=${encodeURIComponent(status)}`);
}

export async function rateRide(rideId: string, rating: number, comment?: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/rate`, {
        method: "POST",
        body: json({ rating, comment: comment?.trim() || undefined }),
    });
}

// ── Ambos ────────────────────────────────────────────────────────────────────

export async function getRide(rideId: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}?_=${Date.now()}`);
}

export async function cancelRide(rideId: string, reason?: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/cancel`, {
        method: "POST",
        body: json({ reason: reason?.trim() || undefined }),
    });
}

/** El parámetro `_` evita la caché GET de 30 s de apiFetch para que el sondeo vea datos frescos. */
export async function trackRide(rideId: string): Promise<RideTrack> {
    return apiFetch<RideTrack>("transportistas", `/${rideId}/track?_=${Date.now()}`);
}

// ── Conductor ────────────────────────────────────────────────────────────────

export async function getDriverRequests(coords?: { lat: number; lng: number } | null): Promise<PetRide[]> {
    const qs = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
    const sep = qs ? "&" : "?";
    return apiFetch<PetRide[]>("transportistas", `/driver/requests${qs}${sep}_=${Date.now()}`);
}

export async function getDriverRides(status: RideListFilter | string = "active"): Promise<PetRide[]> {
    return apiFetch<PetRide[]>("transportistas", `/driver/mine?status=${encodeURIComponent(status)}&_=${Date.now()}`);
}

export async function acceptRide(rideId: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/accept`, { method: "POST" });
}

export async function rejectRide(rideId: string, reason?: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/reject`, {
        method: "POST",
        body: json({ reason: reason?.trim() || undefined }),
    });
}

export async function startRide(rideId: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/start`, { method: "POST" });
}

export async function finishRide(rideId: string): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/finish`, { method: "POST" });
}

export async function updateLocation(rideId: string, data: RideLocationUpdate): Promise<PetRide> {
    return apiFetch<PetRide>("transportistas", `/${rideId}/location`, { method: "PATCH", body: json(data) });
}

export async function getDriverRideHistory(): Promise<DriverRideHistory> {
    return apiFetch<DriverRideHistory>("transportistas", `/history/driver?_=${Date.now()}`);
}

export async function createOrUpdateDriverProfile(data: DriverProfileCreate): Promise<DriverProfile> {
    return apiFetch<DriverProfile>("transportistas", "/driver-profile", { method: "POST", body: json(data) });
}

export async function getMyDriverProfile(): Promise<DriverProfile> {
    return apiFetch<DriverProfile>("transportistas", "/driver-profile");
}

// ── Catálogo / tarifa ────────────────────────────────────────────────────────

export async function getAvailableDrivers(): Promise<DriverProfile[]> {
    return apiFetch<DriverProfile[]>("transportistas", "/drivers/available");
}

export async function estimateFare(data: RideEstimateRequest): Promise<RideEstimateOut> {
    return apiFetch<RideEstimateOut>("transportistas", "/estimate", { method: "POST", body: json(data) });
}
