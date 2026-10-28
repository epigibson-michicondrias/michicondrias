import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, ShoppingBag, ShieldCheck, MapPin, ArrowRight, Zap, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/src/hooks/useTheme';
import { useCart } from '@/src/contexts/CartContext';
import { useCartProducts } from '@/src/hooks/ecommerce/useCartProducts';
import { getMyOrders } from '@/src/services/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import EmptyState from '@/src/components/EmptyState';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import CartItemRow from '@/src/features/tienda/CartItemRow';
import { families, layout, radius, shadow, spacing, type } from '@/constants/design';

const FREE_SHIPPING_THRESHOLD = 299;

export default function CarritoScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { items, cartTotal, cartCount, updateQuantity, clearCart, savedAddress } = useCart();
    useCartProducts();

    const { data: myOrders } = useQuery({
        queryKey: ['my-orders-pending-cart'],
        queryFn: () => getMyOrders(0, 5),
        staleTime: 15_000,
    });
    const pendingOrder = (myOrders ?? []).find((o) => o.status === 'pending');

    const handleContinue = () => {
        router.push('/tienda/checkout-direccion');
    };

    const confirmClear = () => showAlert({
        type: 'warning',
        title: '¿Vaciar el carrito?',
        message: `Se quitarán ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}.`,
        buttonText: 'Vaciar',
        onButtonPress: clearCart,
        showCancel: true,
        cancelText: 'Cancelar',
    });

    const itemsLabel = `${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}`;
    const diffShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
    const progressShipping = Math.min(1, cartTotal / FREE_SHIPPING_THRESHOLD);
    const hasFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;

    if (items.length === 0) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Carrito de compras" />
                <EmptyState
                    icon={<ShoppingBag size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                    title="Tu carrito está vacío"
                    subtitle="Explora la tienda de Michicondrias y encuentra todo para tu mascota."
                    actionLabel="Descubrir productos"
                    onAction={() => router.replace('/(tabs)/tienda-tab')}
                />
            </ScreenContainer>
        );
    }

    const footer = (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.footerTotal}>
                <Text style={[type.caption, { color: theme.textMuted }]}>Total ({itemsLabel})</Text>
                <Text style={[type.h2, styles.bold, { color: theme.text }]}>{formatCurrency(cartTotal)}</Text>
            </View>
            <Button
                label="Continuar compra"
                variant="gold"
                icon={<ArrowRight size={layout.icon.sm} color={theme.onAccent} />}
                onPress={handleContinue}
                size="lg"
                style={{ flex: 1.4 }}
                accessibilityLabel={`Continuar compra por ${formatCurrency(cartTotal)}`}
            />
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Carrito"
                subtitle={itemsLabel}
                actions={[{ icon: Trash2, label: 'Vaciar', onPress: confirmClear }]}
            />

            <KeyboardScreen contentContainerStyle={styles.content} footer={footer}>
                {Boolean(pendingOrder) && (
                    <Card style={{ marginBottom: spacing.md, borderColor: theme.accent, borderWidth: 1, backgroundColor: theme.accentLight }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[type.bodyStrong, { color: theme.accent }]}>Tienes un pedido pendiente</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Pedido #{pendingOrder!.id.slice(0, 8)} · {formatCurrency(pendingOrder!.total_amount)}
                                </Text>
                            </View>
                            <Button
                                label="Pagar"
                                variant="gold"
                                size="sm"
                                onPress={() => router.push({ pathname: '/tienda/pago-nativo', params: { order_id: pendingOrder!.id } } as any)}
                            />
                        </View>
                    </Card>
                )}

                {/* Barra de progreso de Envío Gratis estilo Mercado Libre */}
                <View style={[styles.shippingProgressCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <View style={styles.shippingProgressHeader}>
                        <View style={[styles.fullBadge, { backgroundColor: `${theme.success}18` }]}>
                            <Zap size={11} color={theme.success} fill={theme.success} />
                            <Text style={[styles.fullBadgeText, { color: theme.success }]}>FULL</Text>
                        </View>
                        <Text style={[type.bodyStrong, { color: hasFreeShipping ? theme.success : theme.text, flex: 1 }]}>
                            {hasFreeShipping
                                ? '¡Genial! Tienes Envío Gratis en este pedido'
                                : `Agrega ${formatCurrency(diffShipping)} para tener Envío Gratis`}
                        </Text>
                        {hasFreeShipping && <CheckCircle2 size={16} color={theme.success} />}
                    </View>
                    <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
                        <View style={[styles.progressBarFill, { width: `${progressShipping * 100}%`, backgroundColor: theme.success }]} />
                    </View>
                </View>

                {/* Lista de artículos */}
                <View style={styles.items}>
                    {items.map((item) => (
                        <CartItemRow
                            key={item.product.id}
                            item={item}
                            onOpen={() => router.push(`/tienda/producto/${item.product.id}`)}
                            onChangeQuantity={(q) => updateQuantity(item.product.id, q)}
                            onMaxReached={() => showAlert({
                                type: 'info',
                                title: 'No hay más existencias',
                                message: item.product.stock > 0
                                    ? `Solo hay ${item.product.stock} ${item.product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}.`
                                    : 'Este producto se agotó.',
                            })}
                        />
                    ))}
                </View>

                {/* Selección rápida de dirección ML */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleContinue}
                    style={[styles.addressBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                    <View style={styles.addressLeft}>
                        <MapPin size={18} color={theme.accent} />
                        <View style={{ flex: 1, marginLeft: spacing.xs }}>
                            <Text style={[type.caption, { color: theme.textMuted }]}>Enviar a</Text>
                            <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>
                                {savedAddress || 'Ingresar código postal y dirección'}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color={theme.textMuted} />
                </TouchableOpacity>

                {/* Resumen de compra Mercado Libre */}
                <Card>
                    <View style={styles.summary}>
                        <Text style={[type.bodyStrong, { color: theme.text, marginBottom: spacing.xxs }]}>Resumen de compra</Text>
                        <View style={styles.summaryRow}>
                            <Text style={[type.body, { color: theme.textMuted }]}>Productos ({cartCount})</Text>
                            <Text style={[type.bodyStrong, { color: theme.text }]}>{formatCurrency(cartTotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[type.body, { color: theme.textMuted }]}>Envío</Text>
                            <Text style={[type.bodyStrong, { color: theme.success }]}>
                                {hasFreeShipping ? 'Gratis' : '$99.00'}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[type.body, { color: theme.textMuted }]}>Impuestos (IVA 16%)</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>Incluido por Stripe Tax</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[type.title, { color: theme.text }]}>Total a pagar</Text>
                            <Text style={[type.title, styles.bold, { color: theme.accent, fontSize: 20 }]}>
                                {formatCurrency(cartTotal)}
                            </Text>
                        </View>
                        <Text style={[type.caption, { color: theme.success, marginTop: spacing.xxs }]}>
                            en hasta 12x sin interés con tarjetas participantes
                        </Text>
                    </View>
                </Card>

                {/* Garantía de Compra Protegida */}
                <View style={[styles.secure, { backgroundColor: theme.successLight, borderColor: `${theme.success}30` }]}>
                    <ShieldCheck size={20} color={theme.success} />
                    <View style={styles.flex}>
                        <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>Compra Protegida por Michicondrias</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            Paga seguro con Stripe. Recibe el producto que esperabas o te devolvemos tu dinero.
                        </Text>
                    </View>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xl, gap: spacing.md },
    shippingProgressCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.xs,
        ...shadow.card,
    },
    shippingProgressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    fullBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.xs,
        gap: 2,
    },
    fullBadgeText: {
        fontFamily: families.extrabold,
        fontSize: 10,
        fontStyle: 'italic',
    },
    progressBarTrack: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    items: { gap: spacing.sm },
    addressBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    addressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.sm,
    },
    section: { gap: spacing.sm },
    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    summary: { gap: spacing.xs },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    divider: { height: 1, marginVertical: spacing.xs },
    secure: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    flex: { flex: 1 },
    bold: { fontFamily: families.extrabold },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        ...shadow.raised,
    },
    footerTotal: { flex: 1 },
});
