/**
 * Memoria de sesión de las clínicas suspendidas vistas por el admin.
 *
 * El listado público (`GET /clinics/`) y el detalle (`GET /clinics/{id}`) esconden las suspendidas y no existe
 * un `GET /clinics/admin/all`, así que sin esta memoria el admin pierde la pista de una clínica al suspenderla
 * y no puede reactivarla desde la lista. Ver reporte del módulo: hace falta un endpoint admin de lectura.
 */
import type { Clinic } from '@/services/directorio';

const suspendedSeen = new Map<string, Clinic>();

/** Recuerda una clínica suspendida para que siga en el listado del admin durante la sesión. */
export function rememberSuspendedClinic(clinic: Clinic): void {
    if (clinic.is_suspended) suspendedSeen.set(clinic.id, clinic);
    else suspendedSeen.delete(clinic.id);
}

/** La clínica dejó de estar suspendida (o ya no existe): no hace falta retenerla. */
export function forgetSuspendedClinic(id: string): void {
    suspendedSeen.delete(id);
}

/** Clínicas suspendidas retenidas en esta sesión. */
export function getSuspendedSeen(): Clinic[] {
    return [...suspendedSeen.values()];
}
