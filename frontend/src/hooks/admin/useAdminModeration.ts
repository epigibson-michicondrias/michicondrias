/**
 * useAdminModeration — cola de moderación: adopciones, solicitudes, perdidas, clínicas, veterinarios y productos.
 * Espejo de `mobile/src/hooks/admin/useAdminModeration.ts`. Cada pestaña se normaliza a `ModerationItem` para que la
 * pantalla no conozca la forma de cada servicio; los contadores salen de las mismas consultas.
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ModeracionService from '@/services/moderacion';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { getS3Url } from '@/utils/helpers';

export type TabType = 'adopciones' | 'solicitudes' | 'perdidas' | 'directorio' | 'veterinarios' | 'ecommerce';

export interface ModerationItem {
    id: string;
    title: string;
    subtitle: string;
    detail: string;
    imageUrl: string | null;
    createdAt: string | null;
}

type Raw = Record<string, unknown> & { id: string };

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const img = (v: unknown) => (str(v) ? getS3Url(v as string) : null);
/** Une partes presentes con `sep`; si no queda nada, devuelve `fallback`. */
const join = (parts: Array<unknown>, sep = ' · ', fallback = '') =>
    parts.map(str).filter(Boolean).join(sep) || fallback;

const TABS: Record<TabType, {
    key: string;
    fetch: () => Promise<unknown[]>;
    approve: (id: string) => Promise<unknown>;
    reject: (id: string) => Promise<unknown>;
    /** Aviso del confirmar-rechazar: varias colas borran el contenido. */
    rejectNote: string;
    map: (r: Raw) => ModerationItem;
}> = {
    adopciones: {
        key: 'pending-adoptions',
        fetch: ModeracionService.getPendingAdoptions,
        approve: ModeracionService.approveAdoption,
        reject: ModeracionService.rejectAdoption,
        rejectNote: 'La publicación se elimina y no se puede deshacer.',
        map: (r) => ({
            id: r.id,
            title: str(r.name) || 'Mascota sin nombre',
            subtitle: join([str(r.species), str(r.breed), str(r.location)], ' · ', 'En adopción · Sin ubicación'),
            detail: str(r.description) || 'Sin descripción.',
            imageUrl: img(r.photo_url),
            createdAt: str(r.created_at),
        }),
    },
    solicitudes: {
        key: 'pending-requests',
        fetch: ModeracionService.getGlobalPendingRequests,
        approve: ModeracionService.approveAdoptionRequest,
        reject: ModeracionService.rejectAdoptionRequest,
        rejectNote: 'La solicitud quedará marcada como rechazada.',
        map: (r) => ({
            id: r.id,
            title: `${str(r.applicant_name) || 'Un solicitante'} quiere adoptar a ${str(r.pet_name) || 'una mascota'}`,
            subtitle: join([str(r.house_type), r.has_yard ? 'con patio' : null, str(r.own_or_rent)], ' · ', 'Sin datos de vivienda'),
            detail: str(r.reason) ? `«${str(r.reason)}»` : 'Sin mensaje del solicitante.',
            imageUrl: img(r.pet_photo_url),
            createdAt: str(r.created_at),
        }),
    },
    perdidas: {
        key: 'pending-lost-pets',
        fetch: ModeracionService.getPendingLostPets,
        approve: ModeracionService.approveLostPet,
        reject: ModeracionService.rejectLostPet,
        rejectNote: 'El reporte se elimina y no se puede deshacer.',
        map: (r) => ({
            id: r.id,
            title: str(r.pet_name) || 'Mascota sin nombre',
            subtitle: join(
                [str(r.report_type) === 'found' ? 'Encontrada' : 'Perdida', str(r.species), str(r.last_seen_location)],
                ' · ',
                'Reporte · Sin ubicación',
            ),
            detail: str(r.description) || 'Sin descripción.',
            imageUrl: img(r.image_url),
            createdAt: str(r.created_at),
        }),
    },
    directorio: {
        key: 'pending-clinics',
        fetch: ModeracionService.getPendingClinics,
        approve: ModeracionService.approveClinic,
        reject: ModeracionService.rejectClinic,
        rejectNote: 'La clínica se elimina y no se puede deshacer.',
        map: (r) => ({
            id: r.id,
            title: str(r.name) || 'Clínica sin nombre',
            subtitle: join([str(r.address), str(r.city), str(r.state)], ', ', 'Sin dirección'),
            detail: str(r.description) || 'Sin descripción.',
            imageUrl: img(r.logo_url),
            createdAt: str(r.created_at),
        }),
    },
    veterinarios: {
        key: 'pending-vets',
        fetch: ModeracionService.getPendingVeterinarians,
        approve: ModeracionService.approveVeterinarian,
        reject: ModeracionService.rejectVeterinarian,
        rejectNote: 'El registro se elimina y no se puede deshacer.',
        map: (r) => ({
            id: r.id,
            title: join([str(r.first_name), str(r.last_name)], ' ', 'Veterinario sin nombre'),
            subtitle: join([str(r.specialty) || 'Medicina general', str(r.license_number) && `Cédula ${str(r.license_number)}`], ' · ', 'Sin especialidad'),
            detail: str(r.bio) || 'Sin biografía.',
            imageUrl: img(r.photo_url),
            createdAt: str(r.created_at),
        }),
    },
    ecommerce: {
        key: 'pending-products',
        fetch: ModeracionService.getPendingProducts,
        approve: ModeracionService.approveProduct,
        reject: ModeracionService.rejectProduct,
        rejectNote: 'El producto se elimina y no se puede deshacer.',
        map: (r) => ({
            id: r.id,
            title: str(r.name) || 'Producto sin nombre',
            subtitle: typeof r.price === 'number'
                ? `$${r.price.toLocaleString('es-MX')} · ${typeof r.stock === 'number' ? r.stock : 0} en existencia`
                : 'Sin precio',
            detail: str(r.description) || 'Sin descripción.',
            imageUrl: img(r.image_url),
            createdAt: str(r.created_at),
        }),
    },
};

export const TAB_ORDER: TabType[] = ['adopciones', 'solicitudes', 'perdidas', 'directorio', 'veterinarios', 'ecommerce'];

function useTab(tab: TabType) {
    const t = TABS[tab];
    return useQuery({ queryKey: [t.key], queryFn: async () => ((await t.fetch()) as Raw[]).map(t.map) });
}

export function useAdminModeration() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('adopciones');
    const [busyId, setBusyId] = useState<string | null>(null);

    const queries = {
        adopciones: useTab('adopciones'),
        solicitudes: useTab('solicitudes'),
        perdidas: useTab('perdidas'),
        directorio: useTab('directorio'),
        veterinarios: useTab('veterinarios'),
        ecommerce: useTab('ecommerce'),
    };

    const counts = Object.fromEntries(TAB_ORDER.map((t) => [t, queries[t].data?.length ?? 0])) as Record<TabType, number>;

    /** Recarga todas las colas y el resumen del panel (los contadores viven ahí). */
    const refetchAll = () => {
        TAB_ORDER.forEach((t) => queryClient.invalidateQueries({ queryKey: [TABS[t].key] }));
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    };

    /** `tab` viaja explícito: el confirmar-rechazar se dispara más tarde y la pestaña pudo cambiar. */
    const run = async (action: 'approve' | 'reject', tab: TabType, item: ModerationItem) => {
        const t = TABS[tab];
        setBusyId(item.id);
        try {
            await (action === 'approve' ? t.approve(item.id) : t.reject(item.id));
            queryClient.invalidateQueries({ queryKey: [t.key] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            showAlert({
                type: 'success',
                title: action === 'approve' ? 'Aprobado' : 'Rechazado',
                message: action === 'approve'
                    ? `«${item.title}» ya es visible.`
                    : `«${item.title}» salió de la cola de revisión.`,
            });
        } catch (e) {
            // El motivo real del servidor viene en el mensaje del ApiError; el fallback solo cubre errores de red.
            showAlert({ type: 'error', title: 'No se pudo completar', message: errorMessage(e, 'Inténtalo de nuevo.') });
        } finally {
            setBusyId(null);
        }
    };

    /** Aprobar va directo; rechazar pide confirmación (en varias colas borra el contenido). */
    const handleAction = (action: 'approve' | 'reject', item: ModerationItem) => {
        const tab = activeTab;
        if (action === 'approve') return run('approve', tab, item);
        showAlert({
            type: 'warning',
            title: 'Rechazar contenido',
            message: `¿Rechazar «${item.title}»? ${TABS[tab].rejectNote}`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar',
            onButtonPress: () => run('reject', tab, item),
        });
    };

    const current = queries[activeTab];
    return {
        activeTab,
        setActiveTab,
        counts,
        items: current.data ?? [],
        isLoading: current.isLoading,
        isError: current.isError,
        isFetching: current.isFetching,
        refetch: refetchAll,
        busyId,
        handleAction,
    };
}
