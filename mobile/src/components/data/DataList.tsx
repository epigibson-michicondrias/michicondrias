/**
 * DataList — Generic themed FlatList with loading/empty/refresh states
 * Replaces repeated loading/empty/FlatList boilerplate across all list screens
 */
import React from 'react';
import {
    FlatList,
    FlatListProps,
    View,
    Text,
    RefreshControl,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { SkeletonList } from '@/src/components/Skeleton';

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
    /** Muestra skeletons en lugar del spinner mientras carga */
    skeleton?: boolean;
    skeletonCount?: number;
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
    skeleton,
    skeletonCount = 4,
    ...flatListProps
}: DataListProps<T>) {
    const { theme } = useTheme();

    if (isLoading) {
        return skeleton ? <SkeletonList count={skeletonCount} /> : <LoadingOverlay message={loadingMessage || 'Cargando...'} />;
    }

    if (data.length === 0 && !isLoading) {
        // Un emoji/texto debe ir dentro de <Text> (RN falla si hay texto suelto dentro de <View>)
        const iconElement =
            typeof emptyIcon === 'string' ? (
                <Text style={styles.emoji} accessibilityElementsHidden>{emptyIcon}</Text>
            ) : (
                emptyIcon
            );

        return (
            <View style={styles.emptyContainer}>
                {header}
                <EmptyState
                    icon={iconElement}
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
    emoji: {
        fontSize: 32,
        textAlign: 'center',
    },
});
