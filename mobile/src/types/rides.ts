/**
 * @module types/rides
 * @description Tipos del dominio de transporte de mascotas: viajes, perfiles de conductor,
 * seguimiento y tarifas. El servidor calcula precio y distancia; el cliente solo envía la ruta.
 */

// ─── Estados ────────────────────────────────────────────────────────────────────

export type RideStatus = 'pending' | 'accepted' | 'in_transit' | 'completed' | 'cancelled' | 'rejected';

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
    pending: 'Buscando conductor',
    accepted: 'Conductor asignado',
    in_transit: 'En camino',
    completed: 'Completado',
    cancelled: 'Cancelado',
    rejected: 'Rechazado',
};

/** Estados "vivos" de un viaje. */
export const ACTIVE_RIDE_STATUSES: RideStatus[] = ['pending', 'accepted', 'in_transit'];

// ─── Viajes ─────────────────────────────────────────────────────────────────────

export interface PetRide {
    id: string;
    driver_id?: string | null;
    pet_id: string;
    origin_address: string;
    destination_address: string;
    price?: number | null;
    requires_carrier: boolean;
    current_lat?: number | null;
    current_lng?: number | null;
    status: RideStatus | string;
    // Extras opcionales devueltos por el servidor
    client_id?: string | null;
    preferred_driver_id?: string | null;
    origin_lat?: number | null;
    origin_lng?: number | null;
    destination_lat?: number | null;
    destination_lng?: number | null;
    distance_km?: number | null;
    scheduled_at?: string | null;
    notes?: string | null;
    created_at?: string | null;
    accepted_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
    cancelled_by?: string | null;
    cancel_reason?: string | null;
    rating?: number | null;
    rating_comment?: string | null;
    pet_name?: string | null;
    client_name?: string | null;
    driver_name?: string | null;
    vehicle_model?: string | null;
    vehicle_plate?: string | null;
    /** client | driver | admin | candidate (conductor ante una solicitud abierta) */
    viewer_role?: 'client' | 'driver' | 'admin' | 'candidate' | null;
    can_cancel?: boolean | null;
    can_rate?: boolean | null;
    pickup_distance_km?: number | null;
}

/** Datos que envía el cliente al pedir un viaje. Precio, distancia y conductor los decide el servidor. */
export interface PetRideCreate {
    pet_id: string;
    origin_address: string;
    destination_address: string;
    requires_carrier?: boolean;
    origin_lat?: number;
    origin_lng?: number;
    destination_lat?: number;
    destination_lng?: number;
    /** ISO 8601 */
    scheduled_at?: string;
    notes?: string;
    /** Conductor sugerido (id de usuario del conductor); no es una asignación. */
    preferred_driver_id?: string;
}

// ─── Seguimiento ────────────────────────────────────────────────────────────────

export interface RideLocationUpdate {
    current_lat: number;
    current_lng: number;
}

export interface RideTrack {
    id: string;
    status: RideStatus | string;
    current_lat?: number | null;
    current_lng?: number | null;
    origin_address?: string | null;
    destination_address?: string | null;
    origin_lat?: number | null;
    origin_lng?: number | null;
    destination_lat?: number | null;
    destination_lng?: number | null;
    driver_id?: string | null;
    viewer_role?: string | null;
}

// ─── Conductores ────────────────────────────────────────────────────────────────

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
    rating_avg?: number | null;
    rating_count?: number | null;
}

export interface DriverProfileCreate {
    vehicle_model: string;
    vehicle_plate: string;
    max_capacity?: number;
    has_air_conditioning?: boolean;
    has_carriers?: boolean;
    is_available?: boolean;
}

// ─── Tarifa ─────────────────────────────────────────────────────────────────────

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

// ─── Historial del conductor ────────────────────────────────────────────────────

export interface DriverRideHistory {
    driver_id: string;
    total_earnings: number;
    rides_count: number;
    rating_avg?: number | null;
    rating_count?: number;
    rides: PetRide[];
}

export type RideListFilter = 'active' | 'history' | 'all';
