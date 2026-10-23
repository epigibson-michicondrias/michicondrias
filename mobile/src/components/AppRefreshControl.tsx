/**
 * AppRefreshControl — "jalar para refrescar" genérico: vuelve a pedir todas las consultas activas de la pantalla.
 * Uso: <FlatList refreshControl={<AppRefreshControl />} ... />
 */
import React, { useCallback, useState } from 'react';
import { Platform, RefreshControl, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/src/hooks/useTheme';

export default function AppRefreshControl({ children, style }: { children?: React.ReactNode; style?: any }) {
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

    // ScrollView (y FlatList, que lo usa) clona el refreshControl y le pasa la lista como hijo y el estilo de
    // layout (`cloneElement(refreshControl, { style }, <NativeScrollView />)`, así en Android y en web). Si no se
    // reenvían `children` y `style`, la pantalla queda en blanco.
    if (Platform.OS === 'web') return <View style={style}>{children}</View>;

    return (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            style={style}
        >
            {children}
        </RefreshControl>
    );
}
