/**
 * @module types/notifications
 * @description Notificaciones del usuario. Espejo de `backend/michicondrias_core/app/schemas/notification.py`.
 */

/**
 * Tipos que emiten hoy los servicios del backend (`ntype` / `type` al insertar la notificación).
 * `store` está reservado para pedidos de la tienda.
 */
export type NotificationType =
    | 'general'        // adopciones
    | 'alert'          // mascotas perdidas
    | 'citas'          // directorio: citas (presenciales y videoconsultas)
    | 'cirugias'       // directorio: cirugías programadas / actualizadas
    | 'recetas'        // directorio: recetas emitidas por la clínica
    | 'seguros'        // aseguradoras
    | 'laboratorio'    // laboratorio
    | 'funeraria'      // funeraria
    | 'transportistas' // transporte de mascotas
    | 'kyc'            // core: verificación de identidad aprobada / rechazada
    | 'store';         // tienda

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType | string;
    is_read: boolean;
    /** Ruta de la app a la que lleva (opcional). Sin ella, la app decide por tipo y rol. */
    link?: string | null;
    created_at: string;
}

export interface UnreadCountResponse {
    count: number;
}

export interface MarkAllReadResponse {
    updated: number;
}
