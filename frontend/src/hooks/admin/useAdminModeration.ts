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
    detail?: string | null;
    imageUrl?: string | null;
    createdAt?: string | null;
}

type Raw = Record<string, unknown> & { id: string };

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : null);
const img = (v: unknown) => (str(v) ? getS3Url(v as string) : null);

const TABS: Record<TabType, {
    key: string;
    fetch: () => Promise<unknown[]>;
    approve: (id: string) => Promise<unknown>;
    reject: (id: string) => Promise<unknown>;
    map: (r: Raw) => ModerationItem;
}> = {
    adopciones: {
        key: 'pending-adoptions',
        fetch: ModeracionService.getPendingAdoptions,
        approve: ModeracionService.approveAdoption,
        reject: ModeracionService.rejectAdoption,
        map: (r) => ({ id: r.id, title: str(r.name) || 'Mascota', subtitle: [str(r.species), str(r.breed)].filter(Boolean).join(' · ') || 'En adopción', detail: str(r.description), imageUrl: img(r.photo_url), createdAt: str(r.created_at) }),
    },
    solicitudes: {
        key: 'pending-requests',
        fetch: ModeracionService.getGlobalPendingRequests,
        approve: ModeracionService.approveAdoptionRequest,
        reject: ModeracionService.rejectAdoptionRequest,
        map: (r) => ({ id: r.id, title: `${str(r.applicant_name) || 'Solicitante'} quiere adoptar a ${str(r.pet_name) || 'una mascota'}`, subtitle: [str(r.house_type), r.has_yard ? 'con patio' : null, str(r.own_or_rent)].filter(Boolean).join(' · '), detail: str(r.reason), imageUrl: img(r.pet_photo_url), createdAt: str(r.created_at) }),
    },
    perdidas: {
        key: 'pending-lost-pets',
        fetch: ModeracionService.getPendingLostPets,
        approve: ModeracionService.approveLostPet,
        reject: ModeracionService.rejectLostPet,
        map: (r) => ({ id: r.id, title: str(r.pet_name) || 'Mascota', subtitle: [str(r.species), str(r.last_seen_location)].filter(Boolean).join(' · ') || 'Reporte', detail: str(r.description), imageUrl: img(r.image_url), createdAt: str(r.created_at) }),
    },
    directorio: {
        key: 'pending-clinics',
        fetch: ModeracionService.getPendingClinics,
        approve: ModeracionService.approveClinic,
        reject: ModeracionService.rejectClinic,
        map: (r) => ({ id: r.id, title: str(r.name) || 'Clínica', subtitle: [str(r.address), str(r.city)].filter(Boolean).join(', ') || 'Sin dirección', detail: str(r.description), imageUrl: img(r.logo_url), createdAt: str(r.created_at) }),
    },
    veterinarios: {
        key: 'pending-vets',
        fetch: ModeracionService.getPendingVeterinarians,
        approve: ModeracionService.approveVeterinarian,
        reject: ModeracionService.rejectVeterinarian,
        map: (r) => ({ id: r.id, title: [str(r.first_name), str(r.last_name)].filter(Boolean).join(' ') || 'Veterinario', subtitle: [str(r.specialty) || 'Medicina general', str(r.license_number) && `Cédula ${r.license_number}`].filter(Boolean).join(' · '), detail: str(r.bio), imageUrl: img(r.photo_url), createdAt: str(r.created_at) }),
    },
    ecommerce: {
        key: 'pending-products',
        fetch: ModeracionService.getPendingProducts,
        approve: ModeracionService.approveProduct,
        reject: ModeracionService.rejectProduct,
        map: (r) => ({ id: r.id, title: str(r.name) || 'Producto', subtitle: typeof r.price === 'number' ? `$${r.price.toLocaleString('es-MX')} · ${r.stock ?? 0} en existencia` : 'Producto', detail: str(r.description), imageUrl: img(r.image_url), createdAt: str(r.created_at) }),
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

    const run = async (action: 'approve' | 'reject', item: ModerationItem) => {
        const t = TABS[activeTab];
        setBusyId(item.id);
        try {
            await (action === 'approve' ? t.approve(item.id) : t.reject(item.id));
            queryClient.invalidateQueries({ queryKey: [t.key] });
            showAlert({ type: 'success', title: action === 'approve' ? 'Aprobado' : 'Rechazado', message: `«${item.title}» se procesó correctamente.` });
        } catch (e) {
            showAlert({ type: 'error', title: 'No se pudo completar', message: errorMessage(e, 'Inténtalo de nuevo.') });
        } finally {
            setBusyId(null);
        }
    };

    /** Aprobar va directo; rechazar pide confirmación (en varios servicios borra el contenido). */
    const handleAction = (action: 'approve' | 'reject', item: ModerationItem) => {
        if (action === 'approve') return run('approve', item);
        showAlert({
            type: 'warning',
            title: 'Rechazar contenido',
            message: `¿Rechazar «${item.title}»? No se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar',
            onButtonPress: () => run('reject', item),
        });
    };

    const current = queries[activeTab];
    return {
        activeTab,
        setActiveTab,
        counts,
        items: current.data ?? [],
        isLoading: current.isLoading,
        busyId,
        handleAction,
    };
}
