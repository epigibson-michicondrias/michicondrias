/**
 * Utilidades de ubicación para viajes en web: posición actual y geocodificación de direcciones.
 * Espejo de `mobile/src/services/rideGeo.ts` con `navigator.geolocation` + Nominatim.
 * Todo falla en silencio (devuelve null): los viajes funcionan sin coordenadas (tarifa base).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Posición actual del navegador, o null si no hay permiso/servicio. */
export async function getCurrentPoint(): Promise<GeoPoint | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

/** Dirección legible de unas coordenadas, o null. */
export async function describePoint(point: GeoPoint): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}&accept-language=es`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string; address?: Record<string, string> };
    const a = data.address;
    if (!a) return data.display_name || null;
    const street = [a.road, a.house_number].filter(Boolean).join(" ");
    const parts = [street || a.neighbourhood || a.suburb, a.city || a.town || a.village].filter(Boolean);
    return parts.length ? Array.from(new Set(parts)).join(", ") : data.display_name || null;
  } catch {
    return null;
  }
}

/** Coordenadas de una dirección escrita, o null si no se pudo ubicar. */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const q = address.trim();
  if (q.length < 3) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=es&q=${encodeURIComponent(q)}`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const r = data[0];
    if (!r?.lat || !r?.lon) return null;
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
