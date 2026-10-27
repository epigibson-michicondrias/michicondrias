/**
 * CartItemRow — Artículo del carrito estilo Mercado Libre: foto nítida, título,
 * precio unitario, stepper y botón de eliminar.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Package, Trash2, Zap } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import QuantityStepper from '@/src/components/QuantityStepper';
import { formatCurrency } from '@/src/utils/formatters';
import type { CartItem } from '@/src/contexts/CartContext';
import { families, layout, radius, spacing, type, shadow } from '@/constants/design';

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
                    <Image source={{ uri: product.image_url }} style={styles.thumb} contentFit="contain" transition={150} />
                ) : (
                    <View style={[styles.thumb, styles.thumbFallback, { backgroundColor: theme.backgroundSecondary }]}>
                        <Package size={layout.icon.lg} color={theme.textMuted} strokeWidth={1.5} />
                    </View>
                )}
            </TouchableOpacity>
            <View style={styles.info}>
                <View style={styles.topRow}>
                    <TouchableOpacity style={styles.titleWrap} onPress={onOpen}>
                        <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={2}>{product.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onChangeQuantity(0)}
                        style={styles.deleteBtn}
                        accessibilityRole="button"
                        accessibilityLabel={`Eliminar ${product.name}`}
                    >
                        <Trash2 size={16} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.fullRow}>
                    <View style={[styles.fullBadge, { backgroundColor: `${theme.success}18` }]}>
                        <Zap size={9} color={theme.success} fill={theme.success} />
                        <Text style={[styles.fullBadgeText, { color: theme.success }]}>FULL</Text>
                    </View>
                    <Text style={[type.caption, { color: theme.success }]}>Envío gratis</Text>
                </View>

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
                    <View style={styles.priceCol}>
                        <Text style={[type.title, styles.total, { color: theme.text }]}>
                            {formatCurrency(product.price * quantity)}
                        </Text>
                        {quantity > 1 && (
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                {formatCurrency(product.price)} c/u
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
    thumb: {
        width: 80,
        height: 80,
        borderRadius: radius.md,
        backgroundColor: '#fff',
    },
    thumbFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        gap: spacing.xxs,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.xs,
    },
    titleWrap: {
        flex: 1,
    },
    deleteBtn: {
        padding: 4,
    },
    fullRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: 2,
    },
    fullBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
        gap: 1,
    },
    fullBadgeText: {
        fontFamily: families.extrabold,
        fontSize: 9,
        fontStyle: 'italic',
    },
    bottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    priceCol: {
        alignItems: 'flex-end',
    },
    total: {
        fontFamily: families.extrabold,
        fontSize: 16,
    },
});
