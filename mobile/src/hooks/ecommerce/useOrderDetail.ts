/**
 * useOrderDetail — Hook to fetch order details by ID, con acciones del comprador (pagar / cancelar)
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, createCheckoutSession, updateOrderStatus } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import { openStripeUrl } from '@/src/utils/payments';

export function useOrderDetail(orderId: string) {
    const queryClient = useQueryClient();
    const [isPaying, setIsPaying] = useState(false);

    const { data: order, isLoading, error, refetch } = useQuery({
        queryKey: ['order-detail', orderId],
        queryFn: () => getOrder(orderId),
        enabled: !!orderId,
        // Mientras el pedido espera el pago (se paga fuera de la app) se consulta seguido para ver el cambio a "Pagado"
        refetchInterval: (query) => (query.state.data?.status === 'pending' ? 5000 : false),
    });

    const refreshLists = () => {
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
        // el stock de los productos cambió (se aparta o se devuelve)
        queryClient.invalidateQueries({ queryKey: ['store-products'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
    };

    const cancelMutation = useMutation({
        mutationFn: () => updateOrderStatus(orderId, 'cancelled'),
        onSuccess: () => {
            refreshLists();
            showAlert({ type: 'success', title: 'Pedido cancelado', message: 'Liberamos las unidades de tu pedido. No se hizo ningún cargo.' });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo cancelar', message: e?.message || 'Inténtalo de nuevo en unos minutos.' }),
    });

    const confirmCancel = () => {
        showAlert({
            type: 'warning',
            title: 'Cancelar pedido',
            message: 'Este pedido aún no se ha pagado. Si lo cancelas tendrás que armarlo de nuevo desde tu bolsa.',
            showCancel: true,
            cancelText: 'Conservar',
            buttonText: 'Cancelar pedido',
            onButtonPress: () => cancelMutation.mutate(),
        });
    };

    /** Reintenta el pago de un pedido pendiente abriendo una nueva sesión de Stripe. */
    const payNow = async () => {
        setIsPaying(true);
        try {
            const session = await createCheckoutSession(orderId);
            await openStripeUrl(session.url);
        } catch (e: any) {
            showAlert({ type: 'error', title: 'No se pudo iniciar el pago', message: e?.message || 'Inténtalo de nuevo en unos minutos.' });
        } finally {
            setIsPaying(false);
            refreshLists();
        }
    };

    return {
        order,
        isLoading,
        error,
        refetch,
        payNow,
        isPaying,
        confirmCancel,
        isCancelling: cancelMutation.isPending,
    };
}
