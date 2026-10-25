import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Package, MapPin, CreditCard, XCircle, RotateCcw, LifeBuoy, PackageX } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useOrderDetail } from '@/src/hooks/ecommerce/useOrderDetail';
import { useOrderStatus } from '@/src/features/tienda/orderStatus';
import OrderTracking from '@/src/features/tienda/OrderTracking';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SkeletonList } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import ListRow from '@/src/components/ListRow';
import { MediaRow } from '@/src/components/MediaCard';
import { formatCurrency } from '@/src/utils/formatters';
import { families, layout, radius, spacing, tint, type } from '@/constants/design';

export default function PedidoDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const statusOf = useOrderStatus();
    const o = useOrderDetail(id || '');
    const { order } = o;

    if (o.isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Pedido" />
                <View style={styles.content}><SkeletonList count={4} inset={false} /></View>
            </ScreenContainer>
        );
    }

    if (o.error || !order) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Pedido" />
                <EmptyState
                    icon={<PackageX size={layout.icon.xl} color={theme.textMuted} />}
                    title="No pudimos cargar este pedido"
                    subtitle="Revisa tu conexión. Si el problema sigue, búscalo en Mis compras."
                    actionLabel="Ir a Mis compras"
                    onAction={() => router.replace('/tienda/compras')}
                />
            </ScreenContainer>
        );
    }

    const status = statusOf(order.status);
    const StatusIcon = status.icon;
    const isPending = order.status === 'pending';
    const isCancelled = order.status === 'cancelled';
    const ref = `#${order.id.slice(0, 8).toUpperCase()}`;
    const date = new Date(order.created_at).toLocaleDateString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const busy = o.isPaying || o.isCancelling;

    return (
        <ScreenContainer>
            <ScreenHeader title="Pedido" subtitle={ref} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Estado */}
                <Card>
                    <View style={styles.statusHead}>
                        <View style={[styles.statusIcon, { backgroundColor: status.color + tint.soft }]}>
                            <StatusIcon size={layout.icon.md} color={status.color} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.h2, { color: theme.text }]}>{status.label}</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>Pedido el {date}</Text>
                        </View>
                    </View>
                    {!isPending && !isCancelled ? (
                        <View style={[styles.tracking, { borderTopColor: theme.divider }]}>
                            <OrderTracking status={order.status} />
                        </View>
                    ) : null}
                </Card>

                {isPending ? (
                    <View style={[styles.pending, { backgroundColor: theme.warning + tint.faint, borderColor: theme.warning + tint.strong }]}>
                        <Text style={[type.title, { color: theme.text }]}>Tu pedido espera el pago</Text>
                        <Text style={[type.body, { color: theme.textMuted }]}>
                            Las piezas están apartadas por tiempo limitado. Si ya pagaste, esta pantalla se actualiza sola en unos segundos.
                        </Text>
                        <Button
                            label={`Pagar ahora · ${formatCurrency(order.total_amount)}`}
                            icon={<CreditCard size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={o.payNow}
                            loading={o.isPaying}
                            disabled={busy}
                            fullWidth
                        />
                        <Button
                            label="Cancelar pedido"
                            variant="ghost"
                            icon={<XCircle size={layout.icon.sm} color={theme.error} />}
                            onPress={o.confirmCancel}
                            loading={o.isCancelling}
                            disabled={busy}
                            fullWidth
                        />
                    </View>
                ) : null}

                {/* Productos */}
                <View style={styles.section}>
                    <Text style={[type.title, { color: theme.text }]}>Productos</Text>
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                            <MediaRow
                                key={item.id}
                                imageUrl={item.product?.image_url}
                                fallbackIcon={Package}
                                title={item.product?.name || 'Producto no disponible'}
                                lines={[{ text: `${item.quantity} × ${formatCurrency(item.price_at_purchase)}` }]}
                                footer={<Text style={[type.bodyStrong, { color: theme.text }]}>{formatCurrency(item.price_at_purchase * item.quantity)}</Text>}
                                onPress={() => router.push(`/tienda/producto/${item.product_id}`)}
                                accessibilityLabel={`${item.product?.name || 'Producto'}, ${item.quantity} piezas`}
                            />
                        ))
                    ) : (
                        <Text style={[type.body, { color: theme.textMuted }]}>Este pedido no tiene productos registrados.</Text>
                    )}
                </View>

                {/* Entrega y pago */}
                <Card>
                    <View style={styles.block}>
                        <View style={styles.blockTitle}>
                            <MapPin size={layout.icon.sm} color={theme.primary} />
                            <Text style={[type.bodyStrong, { color: theme.text }]}>Dirección de envío</Text>
                        </View>
                        <Text style={[type.body, { color: theme.textMuted }]}>{order.shipping_address || 'Sin dirección registrada'}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[type.body, { color: theme.textMuted }]}>Subtotal</Text>
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{formatCurrency(order.total_amount)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[type.body, { color: theme.textMuted }]}>Envío</Text>
                        <Text style={[type.bodyStrong, { color: theme.success }]}>Gratis</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={[type.title, { color: theme.text }]}>
                            {isPending ? 'Total a pagar' : isCancelled ? 'Total (sin cargo)' : 'Total pagado'}
                        </Text>
                        <Text style={[type.h2, styles.bold, { color: isCancelled ? theme.textMuted : theme.primary }]}>{formatCurrency(order.total_amount)}</Text>
                    </View>
                </Card>

                {/* Acciones */}
                {!isPending ? (
                    <Button
                        label="Volver a comprar"
                        variant="secondary"
                        icon={<RotateCcw size={layout.icon.sm} color={theme.primary} />}
                        onPress={o.reorder}
                        fullWidth
                    />
                ) : null}
                <ListRow
                    icon={LifeBuoy}
                    label="¿Necesitas ayuda con este pedido?"
                    desc={`Escríbenos y menciona el pedido ${ref}`}
                    color={theme.info}
                    onPress={o.contactSupport}
                />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.huge, gap: spacing.lg },
    flex: { flex: 1 },
    bold: { fontFamily: families.extrabold },
    statusHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    statusIcon: { width: layout.iconBox.lg, height: layout.iconBox.lg, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    tracking: { borderTopWidth: 1, marginTop: spacing.lg, paddingTop: spacing.lg },
    pending: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
    section: { gap: spacing.sm },
    block: { gap: spacing.xs },
    blockTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    divider: { height: 1, marginVertical: spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    totalRow: { marginTop: spacing.sm },
});
