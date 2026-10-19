/**
 * useOrderDetail — Hook to fetch order details by ID, con acciones del comprador (pagar / cancelar)
 */
import { useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '@/src/contexts/CartContext';
import { SUPPORT_EMAIL } from '@/src/constants/support';
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

    const router = useRouter();
    const { addManyToCart } = useCart();

    /** Vuelve a poner en la bolsa los productos del pedido que sigan disponibles. */
    const reorder = () => {
        const lines = (order?.items ?? [])
            // Solo productos que se pueden comprar hoy: publicados y aprobados (el backend rechaza los demás al pagar)
            .filter((i) => i.product && i.product.is_active !== false && i.product.is_approved !== false)
            .map((i) => ({ product: i.product!, quantity: i.quantity }));
        const { added, skipped, adjusted, alreadyInCart } = addManyToCart(lines);
        const missing = skipped + ((order?.items?.length ?? 0) - lines.length);
        if (added === 0) {
            showAlert(alreadyInCart > 0 && missing === 0
                ? { type: 'info', title: 'Ya está en tu bolsa', message: 'Tienes en tu bolsa todas las piezas disponibles de estos productos.', buttonText: 'Ver bolsa', onButtonPress: () => router.push('/tienda/carrito'), showCancel: true, cancelText: 'Seguir aquí' }
                : { type: 'info', title: 'Sin existencias', message: 'Los productos de este pedido ya no están disponibles por ahora.' });
            return;
        }
        const notes = [
            alreadyInCart > 0 ? `${alreadyInCart} ya ${alreadyInCart === 1 ? 'estaba' : 'estaban'} completo en tu bolsa` : '',
            missing > 0 ? `${missing} ${missing === 1 ? 'producto ya no está disponible' : 'productos ya no están disponibles'}` : '',
            adjusted > 0 ? 'ajustamos cantidades al stock actual' : '',
        ].filter(Boolean).join(' y ');
        showAlert({
            type: 'success',
            title: 'Listo, ya está en tu bolsa',
            message: notes ? `Agregamos lo disponible; ${notes}.` : 'Agregamos los mismos productos de este pedido.',
            buttonText: 'Ver bolsa',
            onButtonPress: () => router.push('/tienda/carrito'),
            showCancel: true,
            cancelText: 'Seguir aquí',
        });
    };

    /** Correo a soporte con el número de pedido ya escrito. */
    const contactSupport = () => {
        const ref = orderId.slice(0, 8).toUpperCase();
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Ayuda con mi pedido #${ref}`)}`).catch(() => {
            showAlert({ type: 'info', title: 'Escríbenos', message: `Mándanos un correo a ${SUPPORT_EMAIL} con el pedido #${ref}.` });
        });
    };

    return {
        order,
        reorder,
        contactSupport,
        isLoading,
        error,
        refetch,
        payNow,
        isPaying,
        confirmCancel,
        isCancelling: cancelMutation.isPending,
    };
}
