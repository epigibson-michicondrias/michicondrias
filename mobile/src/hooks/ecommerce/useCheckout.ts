/**
 * useCheckout — compra desde el carrito: crea el pedido, abre la pasarela de Stripe y deja al día
 * las listas de productos y pedidos. La bolsa NO se vacía aquí: se limpia cuando el pago se confirma
 * (`features/tienda/PagoResultado`) para no perderla si el pago falla o se abandona.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { createOrder, createCheckoutSession, updateOrderStatus } from '@/src/services/ecommerce';
import { useCart } from '@/src/contexts/CartContext';
import { showAlert } from '@/src/components/AppAlert';

export function useCheckout() {
    const { items } = useCart();
    const queryClient = useQueryClient();
    const router = useRouter();

    const checkoutMutation = useMutation<string, Error, string | undefined>({
        mutationFn: async (shippingAddress?: string) => {
            if (items.length === 0) throw new Error('Tu bolsa está vacía.');

            // 1. Crear el pedido (aparta el stock mientras se paga)
            const order = await createOrder({
                items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
                shipping_address: shippingAddress?.trim() || undefined,
            });

            try {
                // 2. Crear la sesión de pago y abrir la pasarela
                const session = await createCheckoutSession(order.id);
                const supported = await Linking.canOpenURL(session.url);
                if (!supported) throw new Error('No se puede abrir el enlace de pago.');
                await Linking.openURL(session.url);
            } catch (error) {
                // El pedido se creó pero el pago no pudo iniciar: se cancela para devolver el stock apartado.
                // El carrito se conserva para que el usuario pueda reintentar.
                try { await updateOrderStatus(order.id, 'cancelled'); } catch { /* se puede cancelar desde Mis compras */ }
                throw error;
            }
            return order.id;
        },
        onSuccess: (orderId) => {
            // El stock y los pedidos cambiaron con la orden
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            router.push(`/tienda/pedido/${orderId}` as any);
        },
        onError: (error) => {
            const message = String(error?.message || '');
            const unavailable = /no est[aá]n disponibles|no se pudo iniciar el pago/i.test(message);
            showAlert({
                type: 'error',
                title: unavailable ? 'Pagos no disponibles' : 'No se pudo iniciar el pago',
                message: unavailable
                    ? 'Por el momento no podemos procesar pagos. Tu carrito se conservó; inténtalo más tarde.'
                    : (message || 'Inténtalo de nuevo en unos minutos. Tu carrito se conservó.'),
            });
        },
    });

    return {
        checkout: checkoutMutation.mutate,
        isCheckingOut: checkoutMutation.isPending,
    };
}
