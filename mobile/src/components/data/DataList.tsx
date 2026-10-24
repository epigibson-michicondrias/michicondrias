/**
 * DataList — Lista genérica del tema con estados de carga/vacío/refresh.
 * Reemplaza el boilerplate de loading/empty/FlatList que se repetía en todas las pantallas de listado.
 *
 * Implementación: **FlashList** (reciclado, listas largas) para una columna; **FlatList** para
 * cuadrículas (`numColumns > 1`), porque FlashList v2 no soporta `columnWrapperStyle` y las
 * cuadrículas dependen del `gap` entre columnas. Ver PROGRESO_MOBILE.md · U10.
 */
import React from 'react';
import {
    FlatList,
    FlatListProps,
    Text,
    RefreshControl,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTheme } from '@/src/hooks/useTheme';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { SkeletonGrid, SkeletonList } from '@/src/components/Skeleton';
import { font, spacing, layout } from '@/constants/design';

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
    /** Forma del skeleton: filas (por defecto) o cuadrícula. */
    skeletonVariant?: 'list' | 'grid';
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
    skeletonVariant = 'list',
    ...listProps
}: DataListProps<T>) {
    const { theme } = useTheme();

    if (isLoading && !skeleton) return <LoadingOverlay message={loadingMessage || 'Cargando...'} />;

    // Un emoji/texto debe ir dentro de <Text> (RN falla si hay texto suelto dentro de <View>)
    const iconElement =
        typeof emptyIcon === 'string' ? (
            <Text style={styles.emoji} accessibilityElementsHidden>{emptyIcon}</Text>
        ) : (
            emptyIcon
        );

    // Carga y vacío van dentro de la MISMA lista: así el encabezado (buscador, filtros) nunca se vuelve a montar
    // y no pierde el foco del teclado ni la posición de los chips al cambiar de estado.
    const placeholder = isLoading
        ? (skeletonVariant === 'grid' ? <SkeletonGrid count={skeletonCount} /> : <SkeletonList count={skeletonCount} inset={false} />)
        : (
            <EmptyState
                icon={iconElement}
                title={emptyTitle}
                subtitle={emptySubtitle}
                actionLabel={emptyActionLabel}
                onAction={onEmptyAction}
            />
        );

    const sharedProps = {
        data: isLoading ? [] : data,
        renderItem: renderItem as any,
        contentContainerStyle: [styles.listContent, contentStyle] as any,
        showsVerticalScrollIndicator: false,
        ListHeaderComponent: header,
        ListEmptyComponent: placeholder,
        refreshControl: onRefresh ? (
            <RefreshControl
                refreshing={isRefreshing || false}
                onRefresh={onRefresh}
                tintColor={theme.primary}
                colors={[theme.primary]}
            />
        ) : undefined,
    };

    // Cuadrículas: FlatList (necesita `columnWrapperStyle` para el gap entre columnas).
    if (listProps.numColumns && listProps.numColumns > 1) {
        return <FlatList {...sharedProps} {...(listProps as FlatListProps<T>)} />;
    }

    // Lista larga de una columna: FlashList recicla filas y aguanta miles de ítems.
    return <FlashList {...sharedProps} {...(listProps as object)} />;
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge,
    },
    emoji: {
        fontSize: font.display,
        textAlign: 'center',
    },
});
