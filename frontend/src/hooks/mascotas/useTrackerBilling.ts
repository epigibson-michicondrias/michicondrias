/**
 * useTrackerBilling — abre el portal de facturación de Stripe, donde se ve, cambia o cancela Michi-Tracker Pro.
 * Lo usan la ficha (Tracker activo) y la edición (cancelar antes de eliminar la mascota).
 */
import { useMutation } from '@tanstack/react-query';
import { createBillingPortalSession } from '@/services/ecommerce';
import { showAlert } from '@/components/AppAlert';
import { openStripeUrl } from '@/utils/payments';

const showUnavailable = () =>
    showAlert({ type: 'error', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });

export function useTrackerBilling() {
    const billingMutation = useMutation({
        mutationFn: createBillingPortalSession,
        onSuccess: (data) => {
            if (data.url) openStripeUrl(data.url).catch(showUnavailable);
        },
        onError: showUnavailable,
    });

    return {
        openTrackerBilling: () => billingMutation.mutate(),
        isOpeningBilling: billingMutation.isPending,
    };
}
