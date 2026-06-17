/**
 * DataList — Generic themed FlatList with loading/empty/refresh states
 * Replaces repeated loading/empty/FlatList boilerplate across all list screens
 */
import React from 'react';
import {
    FlatList,
    FlatListProps,
    View,
    RefreshControl,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';

interface DataListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
    /** Data array */
    data: T[];
    /** Render each item */
    renderItem: FlatListProps<T>['renderItem'];
    /** Loading state */
    isLoading?: boolean;
    /** Loading message */
    loadingMessage?: string;
    /** Pull-to-refresh handler */
    onRefresh?: () => void;
    /** Whether refreshing */
    isRefreshing?: boolean;
    /** Empty state icon (emoji or React node) */
    emptyIcon?: React.ReactNode | string;
    /** Empty state title */
    emptyTitle?: string;
    /** Empty state subtitle */
    emptySubtitle?: string;
    /** Empty state action label */
    emptyActionLabel?: string;
    /** Empty state action handler */
    onEmptyAction?: () => void;
    /** Content container style */
    contentStyle?: ViewStyle;
    /** Optional header component */
    header?: React.ReactElement;
}

export default function DataList<T>({
    data,
    renderItem,
    isLoading,
    loadingMessage,
    onRefresh,
    isRefreshing,
    emptyIcon,
    emptyTitle = 'Sin resultados',
    emptySubtitle,
    emptyActionLabel,
    onEmptyAction,
    contentStyle,
    header,
    ...flatListProps
}: DataListProps<T>) {
    const { theme } = useTheme();

    if (isLoading) {
        return <LoadingOverlay message={loadingMessage || 'Cargando...'} />;
    }

    if (data.length === 0 && !isLoading) {
        const iconElement =
            typeof emptyIcon === 'string' ? (
                <View style={styles.emojiContainer}>
                    <View style={styles.emojiText}>
                        {/* Using a Text inside works for emoji strings */}
                    </View>
                </View>
            ) : (
                emptyIcon
            );

        return (
            <View style={styles.emptyContainer}>
                {header}
                <EmptyState
                    icon={
                        typeof emptyIcon === 'string' ? (
                            <View><View style={{ alignItems: 'center' }}><View><>{emptyIcon}</></View></View></View>
                        ) : (
                            emptyIcon
                        )
                    }
                    title={emptyTitle}
                    subtitle={emptySubtitle}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                />
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            contentContainerStyle={[styles.listContent, contentStyle]}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={header}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={isRefreshing || false}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                ) : undefined
            }
            {...flatListProps}
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    emptyContainer: {
        flex: 1,
    },
    emojiContainer: {
        alignItems: 'center',
    },
    emojiText: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
