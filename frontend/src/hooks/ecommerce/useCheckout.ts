/**
 * useCheckout — compra desde el carrito: crea el pedido, abre Stripe y deja al día las listas.
 * La bolsa NO se vacía aquí: se limpia cuando el pago se confirma (`PagoResultado`).
 * Espejo de `mobile/src/hooks/ecommerce/useCheckout.ts`.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createOrder, createCheckoutSession, updateOrderStatus } from '@/services/ecommerce';
import { useCart } from '@/contexts/CartContext';
import { showAlert } from '@/components/AppAlert';
import { openStripeUrl } from '@/utils/payments';

export function useCheckout() {
    const { items } = useCart();
    const queryClient = useQueryClient();
    const router = useRouter();

    const checkoutMutation = useMutation<{ orderId: string; url: string }, Error, string | undefined>({
        mutationFn: async (shippingAddress?: string) => {
            if (items.length === 0) throw new Error('Tu bolsa está vacía.');

            const order = await createOrder({
                items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
                shipping_address: shippingAddress?.trim() || undefined,
            });

            try {
                const session = await createCheckoutSession(order.id);
                return { orderId: order.id, url: session.url };
            } catch (error) {
                try { await updateOrderStatus(order.id, 'cancelled'); } catch { /* se puede cancelar desde Mis compras */ }
                throw error;
            }
        },
        onSuccess: ({ orderId, url }) => {
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['product'] });
            router.push(`/tienda/pedido/${orderId}`);
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
            showAlert({
                type: 'error',
                title: 'No se pudo crear el pedido',
                message: error.message || 'Inténtalo de nuevo.',
            });
        },
    });

    return {
        checkout: (shippingAddress?: string) => checkoutMutation.mutate(shippingAddress),
        isCheckingOut: checkoutMutation.isPending,
    };
}
