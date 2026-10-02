/**
 * Utilidades de ubicación para viajes: posición actual y geocodificación de direcciones.
 * Todo falla en silencio (devuelve null): los viajes funcionan sin coordenadas (tarifa base).
 */
import * as Location from 'expo-location';

export interface GeoPoint {
    lat: number;
    lng: number;
}

/** Posición actual del dispositivo, o null si no hay permiso/servicio. */
export async function getCurrentPoint(): Promise<GeoPoint | null> {
    try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') return null;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
        return null;
    }
}

/** Dirección legible de unas coordenadas, o null. */
export async function describePoint(point: GeoPoint): Promise<string | null> {
    try {
        const [a] = await Location.reverseGeocodeAsync({ latitude: point.lat, longitude: point.lng });
        if (!a) return null;
        const street = [a.street, a.streetNumber].filter(Boolean).join(' ');
        const parts = [street || a.name, a.district || a.subregion, a.city].filter(Boolean);
        return parts.length ? Array.from(new Set(parts)).join(', ') : null;
    } catch {
        return null;
    }
}

/** Coordenadas de una dirección escrita, o null si no se pudo ubicar. */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
    const q = address.trim();
    if (q.length < 3) return null;
    try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== 'granted') await Location.requestForegroundPermissionsAsync();
        const [r] = await Location.geocodeAsync(q);
        if (!r || !Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) return null;
        return { lat: r.latitude, lng: r.longitude };
    } catch {
        return null;
    }
}
