/**
 * useCheckout — compra desde el carrito: crea el pedido, abre la pasarela de Stripe y deja al día
 * las listas de productos y pedidos. La bolsa NO se vacía aquí: se limpia cuando el pago se confirma
 * (`features/tienda/PagoResultado`) para no perderla si el pago falla o se abandona.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { createOrder, createCheckoutSession, updateOrderStatus } from '@/src/services/ecommerce';
import { useCart } from '@/src/contexts/CartContext';
import { showAlert } from '@/src/components/AppAlert';
import { openStripeUrl } from '@/src/utils/payments';

export function useCheckout() {
    const { items } = useCart();
    const queryClient = useQueryClient();
    const router = useRouter();

    const checkoutMutation = useMutation<{ orderId: string; url: string }, Error, string | undefined>({
        mutationFn: async (shippingAddress?: string) => {
            if (items.length === 0) throw new Error('Tu bolsa está vacía.');

            // 1. Crear el pedido (aparta el stock mientras se paga)
            const order = await createOrder({
                items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
                shipping_address: shippingAddress?.trim() || undefined,
            });

            try {
                // 2. Crear la sesión de pago
                const session = await createCheckoutSession(order.id);
                return { orderId: order.id, url: session.url };
            } catch (error) {
                // El pedido se creó pero no se pudo iniciar el pago: se cancela para devolver el stock apartado.
                // El carrito se conserva para que el usuario pueda reintentar.
                try { await updateOrderStatus(order.id, 'cancelled'); } catch { /* se puede cancelar desde Mis compras */ }
                throw error;
            }
        },
        onSuccess: ({ orderId, url }) => {
            // El stock y los pedidos cambiaron con la orden
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            // Primero el pedido a la vista y después la pasarela: en nativo se abre encima y vuelve sola
            // con el deep link del pago; si se abre después del router, en web la navegación la cancela.
            router.push(`/tienda/pedido/${orderId}` as any);
            openStripeUrl(url).catch(async (error) => {
                try { await updateOrderStatus(orderId, 'cancelled'); } catch { /* se cancela desde Mis compras */ }
                const message = String((error as Error)?.message || '');
                const unavailable = /no est[aá]n disponibles|no se pudo iniciar el pago/i.test(message);
                showAlert({
                    type: 'error',
                    title: unavailable ? 'Pagos no disponibles' : 'No se pudo iniciar el pago',
                    message: unavailable
                        ? 'Por el momento no podemos procesar pagos. Tu carrito se conservó; inténtalo más tarde.'
                        : (message || 'Inténtalo de nuevo en unos minutos. Tu carrito se conservó.'),
                });
            });
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
