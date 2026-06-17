/**
 * useAdminProducts — Business logic for the admin products screen
 * Wraps useQuery for fetching all products and search state
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, Product } from '@/src/services/ecommerce';

export type { Product };

export function useAdminProducts() {
    const [searchText, setSearchText] = useState('');

    const { data: products = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => getProducts(),
    });

    return {
        products,
        isLoading,
        isFetching,
        refetch,
        searchText,
        setSearchText,
    };
}
