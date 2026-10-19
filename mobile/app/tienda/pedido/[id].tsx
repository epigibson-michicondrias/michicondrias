import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/components/AppAlert';
import { useOrderDetail } from '@/src/hooks/ecommerce/useOrderDetail';
import { STATUS_MAP } from '@/src/hooks/ecommerce/usePurchases';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Package, MapPin, Calendar, CreditCard, ChevronRight, XCircle } from 'lucide-react-native';
import { SUPPORT_EMAIL } from '@/src/constants/support';
import { formatCurrency } from '@/src/utils/formatters';
import { font, spacing, layout } from '@/constants/design';

export default function PedidoDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const { order, isLoading, error, refetch, payNow, isPaying, confirmCancel, isCancelling } = useOrderDetail(id || '');

    if (isLoading) {
        return (
            <ScreenContainer style={{ backgroundColor: theme.background }}>
                <ScreenHeader title="Detalle de Pedido" />
                <View style={{ padding: spacing.xl }}><SkeletonList count={4} /></View>
            </ScreenContainer>
        );
    }

    if (error || !order) {
        return (
            <ScreenContainer style={{ backgroundColor: theme.background }}>
                <ScreenHeader title="Detalle de Pedido" />
                <View style={styles.center}>
                    <Package size={48} color={theme.textMuted} />
                    <Text style={[styles.errorText, { color: theme.text }]}>No se pudo cargar la información del pedido</Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.primary }]}
                        onPress={() => refetch()}
                    >
                        <Text style={styles.backButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/tienda/compras' as any)}>
                        <Text style={{ color: theme.textMuted, fontWeight: '700', marginTop: spacing.md }}>Ir a Mis compras</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: theme.textMuted };
    const isPending = order.status === 'pending';
    const isCancelled = order.status === 'cancelled';
    const orderDate = new Date(order.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader title="Resumen de Compra" subtitle={`Pedido #${order.id.slice(0, 8).toUpperCase()}`} />

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Status Ticket Header */}
                <View style={[styles.ticketCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.ticketRow}>
                        <View style={styles.iconWrapper}>
                            <Calendar size={18} color={theme.textMuted} />
                        </View>
                        <View style={styles.infoWrapper}>
                            <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Fecha del pedido</Text>
                            <Text style={[styles.ticketValue, { color: theme.text }]}>{orderDate}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

                    <View style={styles.ticketRow}>
                        <View style={styles.iconWrapper}>
                            <Package size={18} color={theme.textMuted} />
                        </View>
                        <View style={styles.infoWrapper}>
                            <Text style={[styles.ticketLabel, { color: theme.textMuted }]}>Estado</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '15' }]}>
                                <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {isPending ? (
                    <View style={[styles.actionCard, { backgroundColor: theme.warningLight, borderColor: theme.warning }]}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>Tu pedido espera el pago</Text>
                        <Text style={[styles.actionText, { color: theme.textMuted }]}>
                            Las unidades están apartadas por tiempo limitado. Si ya pagaste, esta pantalla se actualiza sola en unos segundos.
                        </Text>
                        <TouchableOpacity
                            style={[styles.payBtn, { backgroundColor: theme.primary }, isPaying && { opacity: 0.7 }]}
                            onPress={payNow}
                            disabled={isPaying || isCancelling}
                            accessibilityRole="button"
                            accessibilityLabel="Pagar ahora"
                        >
                            {isPaying ? <ActivityIndicator color={theme.onPrimary} /> : (
                                <>
                                    <CreditCard size={18} color={theme.onPrimary} />
                                    <Text style={styles.payBtnText}>Pagar ahora · {formatCurrency(order.total_amount)}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.cancelBtn, { borderColor: theme.error }]}
                            onPress={confirmCancel}
                            disabled={isPaying || isCancelling}
                            accessibilityRole="button"
                            accessibilityLabel="Cancelar pedido"
                        >
                            {isCancelling ? <ActivityIndicator color={theme.error} /> : (
                                <>
                                    <XCircle size={16} color={theme.error} />
                                    <Text style={[styles.cancelBtnText, { color: theme.error }]}>Cancelar pedido</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Items Title */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Productos Adquiridos</Text>

                {/* Purchased Items List */}
                <View style={styles.itemsContainer}>
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => {
                            const product = item.product;
                            const imageUri = product?.image_url;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                    onPress={() => router.push(`/tienda/producto/${item.product_id}` as any)}
                                    activeOpacity={0.7}
                                >
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} style={styles.itemImage} />
                                    ) : (
                                        <View style={[styles.itemImage, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Package size={26} color={theme.textMuted} />
                                        </View>
                                    )}
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                                            {product?.name || `Producto ID: ${item.product_id.slice(0, 8)}`}
                                        </Text>
                                        <View style={styles.priceQtyRow}>
                                            <Text style={[styles.itemQty, { color: theme.textMuted }]}>
                                                Cant. {item.quantity}
                                            </Text>
                                            <Text style={[styles.itemPrice, { color: theme.primary }]}>
                                                {formatCurrency(item.price_at_purchase)} c/u
                                            </Text>
                                        </View>
                                        <Text style={[styles.itemSubtotal, { color: theme.text }]}>
                                            Subtotal: {formatCurrency(item.price_at_purchase * item.quantity)}
                                        </Text>
                                    </View>
                                    <ChevronRight size={16} color={theme.textMuted} style={styles.arrow} />
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No se encontraron productos registrados en este pedido.</Text>
                        </View>
                    )}
                </View>

                {/* Shipping Details */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Detalles de Entrega</Text>
                <View style={[styles.shippingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.shippingHeader}>
                        <MapPin size={18} color={theme.primary} />
                        <Text style={[styles.shippingTitle, { color: theme.text }]}>Dirección de Envío</Text>
                    </View>
                    <Text style={[styles.shippingAddress, { color: theme.textMuted }]}>
                        {order.shipping_address || 'Sin dirección registrada'}
                    </Text>
                </View>

                {/* Payment summary card (Invoice ticket layout) */}
                <View style={[styles.invoiceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.invoiceRow}>
                        <Text style={[styles.invoiceLabel, { color: theme.textMuted }]}>Subtotal</Text>
                        <Text style={[styles.invoiceValue, { color: theme.text }]}>{formatCurrency(order.total_amount)}</Text>
                    </View>
                    <View style={styles.invoiceRow}>
                        <Text style={[styles.invoiceLabel, { color: theme.textMuted }]}>Envío</Text>
                        <Text style={[styles.invoiceValue, { color: theme.success, fontWeight: '700' }]}>Gratis</Text>
                    </View>
                    <View style={[styles.dottedDivider, { borderColor: theme.border }]} />
                    <View style={styles.invoiceRow}>
                        <View style={styles.totalLabelRow}>
                            <CreditCard size={18} color={theme.primary} />
                            <Text style={[styles.totalLabel, { color: theme.text }]}>{isPending ? 'Total a pagar' : isCancelled ? 'Total (cancelado)' : 'Total pagado'}</Text>
                        </View>
                        <Text style={[styles.totalValue, { color: theme.primary }]}>{formatCurrency(order.total_amount)}</Text>
                    </View>
                </View>

                {/* Help Button */}
                <TouchableOpacity
                    style={[styles.helpButton, { borderColor: theme.border }]}
                    onPress={() => showAlert({ type: 'info', title: 'Soporte', message: `Para dudas sobre esta compra escríbenos a ${SUPPORT_EMAIL} indicando el pedido #${order.id.slice(0, 8).toUpperCase()}.` })}
                >
                    <Text style={[styles.helpButtonText, { color: theme.textMuted }]}>¿Necesitas ayuda con este pedido?</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xxxl,
    },
    loadingText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    errorText: {
        fontSize: font.lg,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: spacing.sm,
        lineHeight: 22,
    },
    backButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 14,
        marginTop: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: font.base,
    },
    scrollContainer: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 60,
    },
    ticketCard: {
        borderRadius: 24,
        padding: spacing.xl,
        borderWidth: 1,
        gap: spacing.lg,
        marginBottom: spacing.xxl,
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(107, 114, 128, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoWrapper: {
        flex: 1,
        gap: spacing.xs,
    },
    ticketLabel: {
        fontSize: font.md,
        fontWeight: '600',
    },
    ticketValue: {
        fontSize: font.base,
        fontWeight: '800',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    statusText: {
        fontSize: font.xs,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    sectionTitle: {
        fontSize: font.xl,
        fontWeight: '800',
        marginBottom: spacing.md,
    },
    itemsContainer: {
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        gap: spacing.md,
    },
    itemImage: {
        width: 76,
        height: 76,
        borderRadius: 14,
    },
    itemInfo: {
        flex: 1,
        gap: spacing.xxs,
    },
    itemName: {
        fontSize: font.base,
        fontWeight: '800',
        lineHeight: 18,
    },
    priceQtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    itemQty: {
        fontSize: font.md,
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: font.md,
        fontWeight: '800',
    },
    itemSubtotal: {
        fontSize: font.base,
        fontWeight: '800',
        marginTop: spacing.xxs,
    },
    arrow: {
        marginLeft: spacing.xs,
    },
    emptyCard: {
        padding: spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shippingCard: {
        borderRadius: 24,
        padding: spacing.xl,
        borderWidth: 1,
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    shippingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    shippingTitle: {
        fontSize: font.base,
        fontWeight: '800',
    },
    shippingAddress: {
        fontSize: font.base,
        fontWeight: '600',
        lineHeight: 18,
    },
    invoiceCard: {
        borderRadius: 24,
        padding: spacing.xl,
        borderWidth: 1,
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    invoiceLabel: {
        fontSize: font.base,
        fontWeight: '600',
    },
    invoiceValue: {
        fontSize: font.base,
        fontWeight: '800',
    },
    dottedDivider: {
        borderStyle: 'dashed',
        borderWidth: 0.5,
        borderRadius: 1,
        marginVertical: spacing.xs,
    },
    totalLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    totalLabel: {
        fontSize: font.base,
        fontWeight: '800',
    },
    totalValue: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    actionCard: {
        borderRadius: 24,
        padding: spacing.xl,
        borderWidth: 1,
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    actionTitle: { fontSize: font.xl, fontWeight: '800' },
    actionText: { fontSize: font.base, fontWeight: '500', lineHeight: 19 },
    payBtn: {
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payBtnText: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
    cancelBtn: {
        height: 46,
        borderRadius: 14,
        borderWidth: 1.5,
        flexDirection: 'row',
        gap: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: { fontSize: font.base, fontWeight: '800' },
    helpButton: {
        borderWidth: 1.5,
        borderRadius: 18,
        paddingVertical: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    helpButtonText: {
        fontSize: font.md,
        fontWeight: '800',
    },
});
