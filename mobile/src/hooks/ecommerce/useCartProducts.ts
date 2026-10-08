/**
 * useCartProducts — al abrir el carrito pide los precios y el stock frescos de lo que hay en la bolsa
 * (el snapshot guardado puede quedar viejo) y ajusta la lista con `syncProducts` del CartContext.
 */
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProduct, Product } from '@/src/services/ecommerce';
import { useCart } from '@/src/contexts/CartContext';

export function useCartProducts() {
    const { items, syncProducts } = useCart();
    const ids = items.map((item) => item.product.id);
    const key = [...ids].sort().join(',');

    const { data, isFetching } = useQuery<Product[]>({
        queryKey: ['cart-products', key],
        queryFn: async () => {
            // Lo que no cargue se queda como está en la bolsa (un fallo puntual no debe borrar nada)
            const results = await Promise.allSettled(ids.map((id) => getProduct(id)));
            return results
                .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
                .map((r) => r.value);
        },
        enabled: ids.length > 0,
        staleTime: 30_000,
    });

    useEffect(() => {
        if (data) syncProducts(data);
    }, [data, syncProducts]);

    return { isRefreshing: isFetching };
}
