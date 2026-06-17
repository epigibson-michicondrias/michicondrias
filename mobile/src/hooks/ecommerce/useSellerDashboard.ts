/**
 * useSellerDashboard — Hook for seller dashboard screen
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyProducts, getSellerOrders } from '@/src/services/ecommerce';
import type { Product, Order } from '@/src/services/ecommerce';

export function useSellerDashboard() {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: products = [],
        isLoading: productsLoading,
        refetch: refetchProducts,
        isRefetching: isRefetchingProducts,
    } = useQuery({
        queryKey: ['my-products'],
        queryFn: getMyProducts,
    });

    const {
        data: orders = [],
        isLoading: ordersLoading,
        refetch: refetchOrders,
        isRefetching: isRefetchingOrders,
    } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: getSellerOrders,
    });

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    }, [products, searchQuery]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter(o =>
            o.id.toLowerCase().includes(q)
        );
    }, [orders, searchQuery]);

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        products: filteredProducts,
        orders: filteredOrders,
        isLoading: activeTab === 'products' ? productsLoading : ordersLoading,
        refetch: activeTab === 'products' ? refetchProducts : refetchOrders,
        isRefetching: activeTab === 'products' ? isRefetchingProducts : isRefetchingOrders,
    };
}

export type { Product, Order };
