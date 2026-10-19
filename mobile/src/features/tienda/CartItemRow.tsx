/**
 * CartItemRow — Artículo de la bolsa: foto, nombre, precio unitario, cantidad (− en 1 lo quita) y subtotal.
 */
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import QuantityStepper from '@/src/components/QuantityStepper';
import { formatCurrency } from '@/src/utils/formatters';
import type { CartItem } from '@/src/contexts/CartContext';
import { layout, radius, spacing, type } from '@/constants/design';

interface CartItemRowProps {
    item: CartItem;
    onOpen: () => void;
    onChangeQuantity: (quantity: number) => void;
    onMaxReached: () => void;
}

export default function CartItemRow({ item, onOpen, onChangeQuantity, onMaxReached }: CartItemRowProps) {
    const { theme } = useTheme();
    const { product, quantity } = item;
    const stock = product.stock ?? 0;

    return (
        <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Ver ${product.name}`}>
                {product.image_url ? (
                    <Image source={{ uri: product.image_url }} style={styles.thumb} />
                ) : (
                    <View style={[styles.thumb, styles.thumbFallback, { backgroundColor: theme.backgroundSecondary }]}>
                        <Package size={layout.icon.lg} color={theme.textMuted} strokeWidth={1.5} />
                    </View>
                )}
            </TouchableOpacity>
            <View style={styles.info}>
                <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={2}>{product.name}</Text>
                <Text style={[type.caption, { color: theme.textMuted }]}>
                    {formatCurrency(product.price)} c/u{stock > 0 && stock <= 5 ? ` · quedan ${stock}` : ''}
                </Text>
                <View style={styles.bottom}>
                    <QuantityStepper
                        value={quantity}
                        onChange={onChangeQuantity}
                        min={0}
                        max={stock > 0 ? stock : quantity}
                        size="sm"
                        itemLabel={product.name}
                        onMaxReached={onMaxReached}
                    />
                    <Text style={[type.title, styles.total, { color: theme.text }]}>{formatCurrency(product.price * quantity)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
    thumb: { width: layout.iconBox.lg * 1.6, height: layout.iconBox.lg * 1.6, borderRadius: radius.md },
    thumbFallback: { alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1, gap: spacing.xxs },
    bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
    total: { fontWeight: '800' },
});
