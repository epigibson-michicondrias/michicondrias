/**
 * Producto de la tienda en sus dos formas de ver: `ProductGridCard` (cuadrícula) y `ProductListRow` (lista).
 * Ambas se apoyan en `MediaCard`/`MediaRow` y llevan precio, calificación, existencias, favorito y "agregar rápido".
 * Los botones (favorito, agregar) van como hermanos del botón principal: en web un <button> no puede anidar otro.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Heart, Package, Plus, Star } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Badge from '@/src/components/Badge';
import { MediaCard, MediaRow } from '@/src/components/MediaCard';
import { formatCurrency } from '@/src/utils/formatters';
import type { Product } from '@/src/types/ecommerce';
import { families, layout, radius, shadow, spacing, type } from '@/constants/design';

/** Existencias a partir de las cuales se avisa "últimas piezas". */
export const LOW_STOCK = 5;

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    /** Agrega 1 a la bolsa; devuelve false si no se pudo. Sin esto no se muestra el botón. */
    onQuickAdd?: () => boolean;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

/** Insignia de existencias (agotado / últimas piezas) o nada. */
function StockBadge({ stock }: { stock: number }) {
    const { theme } = useTheme();
    if (stock <= 0) return <Badge label="Agotado" color={theme.textMuted} variant="solid" size="sm" />;
    if (stock <= LOW_STOCK) return <Badge label={`Últimas ${stock}`} color={theme.warning} variant="solid" size="sm" />;
    return null;
}

/** Precio + calificación. */
function PriceLine({ product }: { product: Product }) {
    const { theme } = useTheme();
    return (
        <View style={styles.priceLine}>
            <Text style={[type.title, styles.price, { color: theme.primary }]} numberOfLines={1}>{formatCurrency(product.price)}</Text>
            {product.review_count > 0 ? (
                <View style={styles.rating}>
                    <Star size={layout.icon.xs} color={theme.accent} fill={theme.accent} />
                    <Text style={[type.caption, { color: theme.textMuted }]}>{Number(product.average_rating).toFixed(1)}</Text>
                </View>
            ) : null}
        </View>
    );
}

/** Botón redondo "agregar a la bolsa" que confirma con una palomita un momento. */
function QuickAddButton({ product, onQuickAdd, style }: { product: Product; onQuickAdd: () => boolean; style?: object }) {
    const { theme } = useTheme();
    const [added, setAdded] = useState(false);
    useEffect(() => {
        if (!added) return;
        const t = setTimeout(() => setAdded(false), 1200);
        return () => clearTimeout(t);
    }, [added]);
    if (product.stock <= 0) return null;
    const Icon = added ? Check : Plus;
    return (
        <TouchableOpacity
            style={[styles.quickAdd, { backgroundColor: added ? theme.success : theme.primary }, style]}
            onPress={() => setAdded(onQuickAdd())}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={added ? `${product.name} agregado a la bolsa` : `Agregar ${product.name} a la bolsa`}
        >
            <Icon size={layout.icon.sm} color={theme.onPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
    );
}

function FavoriteButton({ active, onPress, name }: { active: boolean; onPress: () => void; name: string }) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.favorite, { backgroundColor: theme.surface }]}
            onPress={onPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={active ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
            accessibilityState={{ selected: active }}
        >
            <Heart size={layout.icon.sm} color={active ? theme.error : theme.textMuted} fill={active ? theme.error : 'transparent'} />
        </TouchableOpacity>
    );
}

const a11yLabel = (p: Product) =>
    `${p.name}, ${formatCurrency(p.price)}${p.stock <= 0 ? ', agotado' : ''}${p.review_count > 0 ? `, ${Number(p.average_rating).toFixed(1)} estrellas` : ''}`;

/** `width`: ancho de la celda (de `useGridCell`). */
export function ProductGridCard({ product, width, onPress, onQuickAdd, isFavorite, onToggleFavorite }: ProductCardProps & { width: number }) {
    return (
        <View style={{ width }}>
            <MediaCard
                width={width}
                imageUrl={product.image_url}
                fallbackIcon={Package}
                title={product.name}
                topLeft={<StockBadge stock={product.stock} />}
                footer={<PriceLine product={product} />}
                onPress={onPress}
                accessibilityLabel={a11yLabel(product)}
            />
            {onToggleFavorite ? (
                <View style={styles.favoriteSlot}>
                    <FavoriteButton active={!!isFavorite} onPress={onToggleFavorite} name={product.name} />
                </View>
            ) : null}
            {onQuickAdd ? (
                // Esquina inferior derecha de la foto (cuadrada: mide `width`)
                <QuickAddButton product={product} onQuickAdd={onQuickAdd} style={{ position: 'absolute', top: width - layout.iconBox.md - spacing.sm, right: spacing.sm }} />
            ) : null}
        </View>
    );
}

export function ProductListRow({ product, onPress, onQuickAdd, isFavorite, onToggleFavorite }: ProductCardProps) {
    const hasActions = !!onToggleFavorite || !!onQuickAdd;
    return (
        <MediaRow
            imageUrl={product.image_url}
            fallbackIcon={Package}
            title={product.name}
            trailing={<StockBadge stock={product.stock} />}
            footer={<PriceLine product={product} />}
            actions={hasActions ? (
                <>
                    {onToggleFavorite ? <FavoriteButton active={!!isFavorite} onPress={onToggleFavorite} name={product.name} /> : null}
                    {onQuickAdd ? <QuickAddButton product={product} onQuickAdd={onQuickAdd} /> : null}
                </>
            ) : undefined}
            onPress={onPress}
            accessibilityLabel={a11yLabel(product)}
        />
    );
}

const styles = StyleSheet.create({
    priceLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, marginTop: spacing.xxs },
    price: { fontFamily: families.extrabold, flexShrink: 1 },
    rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
    quickAdd: {
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.raised,
    },
    favoriteSlot: { position: 'absolute', top: spacing.sm, right: spacing.sm },
    favorite: {
        width: layout.iconBox.sm,
        height: layout.iconBox.sm,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.card,
    },
});
