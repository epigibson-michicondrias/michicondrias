import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useOrderDetail } from '@/src/hooks/ecommerce';
import { STATUS_MAP } from '@/src/hooks/ecommerce/usePurchases';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Package, MapPin, Calendar, CreditCard, ChevronRight } from 'lucide-react-native';
import { formatCurrency } from '@/src/utils/formatters';

export default function PedidoDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const { order, isLoading, error } = useOrderDetail(id || '');

    if (isLoading) {
        return (
            <ScreenContainer style={{ backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }}>
                <ScreenHeader title="Detalle de Pedido" />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando pedido...</Text>
                </View>
            </ScreenContainer>
        );
    }

    if (error || !order) {
        return (
            <ScreenContainer style={{ backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }}>
                <ScreenHeader title="Detalle de Pedido" />
                <View style={styles.center}>
                    <Package size={48} color={theme.textMuted} />
                    <Text style={[styles.errorText, { color: theme.text }]}>No se pudo cargar la información del pedido</Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Volver a Mis Compras</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#6b7280' };
    const orderDate = new Date(order.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <ScreenContainer style={{ backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }}>
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

                {/* Items Title */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Productos Adquiridos</Text>

                {/* Purchased Items List */}
                <View style={styles.itemsContainer}>
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => {
                            const product = item.product;
                            const imageUri = product?.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000';
                            
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                    onPress={() => router.push(`/tienda/producto/${item.product_id}` as any)}
                                    activeOpacity={0.7}
                                >
                                    <Image source={{ uri: imageUri }} style={styles.itemImage} />
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
                        {order.shipping_address || 'Entrega en tienda / Sin dirección registrada'}
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
                        <Text style={[styles.invoiceValue, { color: '#10b981', fontWeight: '700' }]}>Gratis</Text>
                    </View>
                    <View style={[styles.dottedDivider, { borderColor: theme.border }]} />
                    <View style={styles.invoiceRow}>
                        <View style={styles.totalLabelRow}>
                            <CreditCard size={18} color={theme.primary} />
                            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Pagado</Text>
                        </View>
                        <Text style={[styles.totalValue, { color: theme.primary }]}>{formatCurrency(order.total_amount)}</Text>
                    </View>
                </View>

                {/* Help Button */}
                <TouchableOpacity
                    style={[styles.helpButton, { borderColor: theme.border }]}
                    onPress={() => showAlert({ type: 'info', title: 'Soporte', message: 'Para dudas o devoluciones sobre esta compra, contáctanos en soporte@michicondrias.com' })}
                >
                    <Text style={[styles.helpButtonText, { color: theme.textMuted }]}>¿Necesitas ayuda con este pedido?</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenContainer>
    );
}

// Custom simple alerts fallback
const showAlert = ({ type, title, message }: { type: string; title: string; message: string }) => {
    // Attempt standard import fallback or simple console warning
    try {
        const { showAlert: appShowAlert } = require('@/src/components/AppAlert');
        appShowAlert({ type, title, message });
    } catch {
        alert(`${title}: ${message}`);
    }
};

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 32,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    errorText: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 16,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    scrollContainer: {
        paddingHorizontal: 24,
        paddingBottom: 60,
    },
    ticketCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        gap: 16,
        marginBottom: 24,
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
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
        gap: 4,
    },
    ticketLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    ticketValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 12,
    },
    itemsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
    },
    itemImage: {
        width: 76,
        height: 76,
        borderRadius: 14,
    },
    itemInfo: {
        flex: 1,
        gap: 2,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '800',
        lineHeight: 18,
    },
    priceQtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemQty: {
        fontSize: 12,
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '800',
    },
    itemSubtotal: {
        fontSize: 13,
        fontWeight: '900',
        marginTop: 2,
    },
    arrow: {
        marginLeft: 4,
    },
    emptyCard: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shippingCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        gap: 10,
        marginBottom: 24,
    },
    shippingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    shippingTitle: {
        fontSize: 14,
        fontWeight: '800',
    },
    shippingAddress: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    invoiceCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        gap: 12,
        marginBottom: 24,
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    invoiceLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    invoiceValue: {
        fontSize: 13,
        fontWeight: '800',
    },
    dottedDivider: {
        borderStyle: 'dashed',
        borderWidth: 0.5,
        borderRadius: 1,
        marginVertical: 4,
    },
    totalLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '900',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    helpButton: {
        borderWidth: 1.5,
        borderRadius: 18,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    helpButtonText: {
        fontSize: 12,
        fontWeight: '800',
    },
});
