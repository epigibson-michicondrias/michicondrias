/**
 * useOrderDetail — detalle de pedido con acciones del comprador (pagar / cancelar).
 * Espejo de `mobile/src/hooks/ecommerce/useOrderDetail.ts`.
 */
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, updateOrderStatus } from '@/services/ecommerce';
import { showAlert } from '@/components/AppAlert';

export function useOrderDetail(orderId: string) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: order, isLoading, error, refetch } = useQuery({
        queryKey: ['order-detail', orderId],
        queryFn: () => getOrder(orderId),
        enabled: !!orderId,
        refetchInterval: (query) => (query.state.data?.status === 'pending' ? 5000 : false),
    });

    const refreshLists = () => {
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
        queryClient.invalidateQueries({ queryKey: ['store-products'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
    };

    const cancelMutation = useMutation({
        mutationFn: () => updateOrderStatus(orderId, 'cancelled'),
        onSuccess: () => {
            refreshLists();
            showAlert({ type: 'success', title: 'Pedido cancelado', message: 'Liberamos las unidades de tu pedido. No se hizo ningún cargo.' });
        },
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo cancelar', message: e.message || 'Inténtalo de nuevo en unos minutos.' }),
    });

    const confirmCancel = () => {
        showAlert({
            type: 'warning',
            title: 'Cancelar pedido',
            message: 'Este pedido aún no se ha pagado. Si lo cancelas tendrás que armarlo de nuevo desde tu bolsa.',
            showCancel: true,
            onButtonPress: () => cancelMutation.mutate(),
        });
    };

    /** Paga un pedido pendiente en la pasarela in-app (`pago-nativo`). */
    const payNow = () => {
        router.push(`/tienda/pago-nativo?order_id=${orderId}`);
    };

    const { addManyToCart } = useCart();

    const buyAgain = () => {
        if (!order?.items?.length) return;
        const { added, skipped, adjusted, alreadyInCart } = addManyToCart(
            order.items.filter((i): i is typeof i & { product: NonNullable<typeof i.product> } => !!i.product)
            .map((i) => ({ product: i.product, quantity: i.quantity })),
        );
        showAlert({
            type: added > 0 ? 'success' : 'info',
            title: added > 0 ? 'Agregado a tu bolsa' : 'Nada que agregar',
            message:
                added > 0
                    ? `Agregamos ${added} ${added === 1 ? 'producto' : 'productos'}${adjusted ? ` (ajustamos ${adjusted} al stock)` : ''}.`
                    : alreadyInCart > 0
                        ? 'Ya tienes todo el stock de esos productos en tu bolsa.'
                        : `${skipped} sin existencias.`,
        });
        if (added > 0) router.push('/tienda/carrito');
    };

    return {
        order,
        isLoading,
        error,
        refetch,
        cancelOrder: confirmCancel,
        isCancelling: cancelMutation.isPending,
        payNow,
        buyAgain,
    };
}
