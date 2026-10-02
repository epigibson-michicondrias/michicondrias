/**
 * AppRefreshControl — "jalar para refrescar" genérico: vuelve a pedir todas las consultas activas de la pantalla.
 * Uso: <FlatList refreshControl={<AppRefreshControl />} ... />
 */
import React, { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/src/hooks/useTheme';

export default function AppRefreshControl() {
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await queryClient.refetchQueries({ type: 'active' });
        } finally {
            setRefreshing(false);
        }
    }, [queryClient]);

    return <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} colors={[theme.primary]} />;
}
