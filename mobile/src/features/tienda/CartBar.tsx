/**
 * CartBar — Barra flotante "N artículos · $total · Ver bolsa" que aparece cuando hay algo en la bolsa.
 * Va al fondo de las pantallas de compra (pestaña Tienda, producto). La pantalla debe dejarle espacio abajo
 * (`CART_BAR_SPACE`) para que no tape el último elemento.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCart } from '@/src/contexts/CartContext';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, radius, shadow, spacing, type } from '@/constants/design';

/** Alto que ocupa la barra (para el padding inferior de la lista). */
export const CART_BAR_SPACE = layout.buttonHeight.lg + spacing.xxl;

export default function CartBar() {
    const router = useRouter();
    const { theme } = useTheme();
    const { cartCount, cartTotal } = useCart();
    if (cartCount === 0) return null;

    return (
        <View style={styles.wrap} pointerEvents="box-none">
            <TouchableOpacity
                style={[styles.bar, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/tienda/carrito')}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={`Ver bolsa: ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}, ${formatCurrency(cartTotal)}`}
            >
                <View style={[styles.count, { backgroundColor: theme.onPrimary }]}>
                    <ShoppingBag size={layout.icon.xs} color={theme.primary} />
                    <Text style={[type.caption, styles.bold, { color: theme.primary }]}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
                <Text style={[type.bodyStrong, styles.flex, { color: theme.onPrimary }]}>Ver bolsa</Text>
                <Text style={[type.title, styles.bold, { color: theme.onPrimary }]}>{formatCurrency(cartTotal)}</Text>
                <ChevronRight size={layout.icon.sm} color={theme.onPrimary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        left: layout.screenPadding,
        right: layout.screenPadding,
        bottom: spacing.md,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: layout.buttonHeight.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.lg,
        ...shadow.floating,
    },
    count: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        borderRadius: radius.pill,
    },
    flex: { flex: 1 },
    bold: { fontWeight: '800' },
});
