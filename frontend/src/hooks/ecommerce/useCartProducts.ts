/**
 * useCartProducts — al abrir el carrito pide precios y stock frescos y ajusta la bolsa (`syncProducts`).
 * Espejo de `mobile/src/hooks/ecommerce/useCartProducts.ts`.
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduct, type Product } from '@/services/ecommerce';
import { useCart } from '@/contexts/CartContext';

export function useCartProducts() {
    const { items, syncProducts } = useCart();
    const ids = items.map((item) => item.product.id);
    const key = [...ids].sort().join(',');

    const { data, isFetching } = useQuery<Product[]>({
        queryKey: ['cart-products', key],
        queryFn: async () => {
            const results = await Promise.allSettled(ids.map((id) => getProduct(id)));
            return results
                .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
                .map((r) => r.value);
        },
        enabled: ids.length > 0,
        staleTime: 30_000,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await Promise.resolve();
            if (cancelled || !data) return;
            syncProducts(data);
        })();
        return () => { cancelled = true; };
    }, [data, syncProducts]);

    return { isRefreshing: isFetching };
}
