/**
 * SellerOrderCard — Pedido visto por el vendedor: sus piezas, comprador, dirección, su parte de la venta y el
 * siguiente paso (marcar enviado / entregado).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarDays, CheckCircle2, MapPin, Truck, UserRound } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import { useOrderStatus } from '@/src/features/tienda/orderStatus';
import { SELLER_NEXT_STATUS, sellerSubtotal } from '@/src/hooks/ecommerce/useSellerOrders';
import { formatCurrency } from '@/src/utils/formatters';
import type { Order } from '@/src/types/ecommerce';
import { layout, radius, spacing, type } from '@/constants/design';

interface SellerOrderCardProps {
    order: Order;
    sellerId?: string;
    onAdvance: (status: string) => void;
    updating?: boolean;
    disabled?: boolean;
}

export default function SellerOrderCard({ order, sellerId, onAdvance, updating, disabled }: SellerOrderCardProps) {
    const { theme } = useTheme();
    const statusOf = useOrderStatus();
    const status = statusOf(order.status);
    const next = SELLER_NEXT_STATUS[order.status];
    // Un pedido puede incluir productos de varios vendedores: aquí solo cuenta lo de este vendedor
    const myItems = (order.items || []).filter((i) => !i.product || !sellerId || i.product.seller_id === sellerId);
    const date = new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

    const info = [
        { icon: UserRound, text: order.buyer_name || 'Comprador de Michi-Shop' },
        { icon: MapPin, text: order.shipping_address || 'Sin dirección de envío' },
        { icon: CalendarDays, text: `${date} · #${order.id.slice(0, 8).toUpperCase()}` },
    ];

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.head}>
                <Text style={[type.title, styles.flex, { color: theme.text }]}>{formatCurrency(sellerSubtotal(order, sellerId))}</Text>
                <Badge label={status.sellerLabel} color={status.color} size="sm" />
            </View>

            <View style={[styles.items, { backgroundColor: theme.backgroundSecondary }]}>
                {myItems.map((i) => (
                    <Text key={i.id} style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>
                        {i.quantity} × {i.product?.name || 'Producto'}
                    </Text>
                ))}
            </View>

            <View style={styles.info}>
                {info.map(({ icon: Icon, text }) => (
                    <View key={text} style={styles.infoRow}>
                        <Icon size={layout.icon.sm} color={theme.textMuted} />
                        <Text style={[type.body, styles.flex, { color: theme.text }]} numberOfLines={3}>{text}</Text>
                    </View>
                ))}
            </View>

            {next ? (
                <Button
                    label={next.label}
                    icon={next.status === 'delivered'
                        ? <CheckCircle2 size={layout.icon.sm} color={theme.onPrimary} />
                        : <Truck size={layout.icon.sm} color={theme.onPrimary} />}
                    onPress={() => onAdvance(next.status)}
                    loading={updating}
                    disabled={disabled}
                    fullWidth
                />
            ) : order.status === 'pending' ? (
                <Text style={[type.caption, { color: theme.textMuted }]}>El comprador aún no paga: no lo envíes todavía.</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    flex: { flex: 1 },
    items: { padding: spacing.md, borderRadius: radius.md, gap: spacing.xxs },
    info: { gap: spacing.sm },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
});
