/**
 * RideCard — tarjeta de viaje reutilizable (cliente y conductor).
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, MapPin, PawPrint, Star, Truck, User } from 'lucide-react-native';
import Card from '@/src/components/Card';
import Badge from '@/src/components/Badge';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, spacing, type } from '@/constants/design';
import type { PetRide } from '@/src/types/rides';
import { formatDateTime, formatMoney, rideStatusInfo } from './rideStatus';

interface Props {
    ride: PetRide;
    onPress?: () => void;
    /** Muestra a la contraparte: 'client' enseña al conductor; 'driver' enseña al cliente. */
    perspective: 'client' | 'driver';
    footer?: React.ReactNode;
}

export default function RideCard({ ride, onPress, perspective, footer }: Props) {
    const { theme } = useTheme();
    const info = rideStatusInfo(ride.status, theme);
    const who =
        perspective === 'client'
            ? ride.driver_name || (ride.vehicle_model ? ride.vehicle_model : null)
            : ride.client_name;
    const when = formatDateTime(ride.scheduled_at || ride.created_at);
    const a11y = [
        `Viaje ${info.label}`,
        ride.pet_name ? `de ${ride.pet_name}` : '',
        `de ${ride.origin_address} a ${ride.destination_address}`,
        ride.price != null ? `tarifa ${formatMoney(ride.price)}` : '',
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <Card onPress={onPress} accessibilityLabel={a11y} style={styles.card}>
            <View style={styles.top}>
                <Badge label={info.label} color={info.color} size="sm" />
                <Text style={[type.title, { color: theme.primary }]}>{formatMoney(ride.price)}</Text>
            </View>

            <View style={styles.routeRow}>
                <MapPin size={14} color={theme.success} />
                <Text style={[type.bodyStrong, styles.flex, { color: theme.text }]} numberOfLines={1}>
                    {ride.origin_address}
                </Text>
            </View>
            <View style={styles.routeRow}>
                <MapPin size={14} color={theme.primary} />
                <Text style={[type.body, styles.flex, { color: theme.textMuted }]} numberOfLines={1}>
                    {ride.destination_address}
                </Text>
            </View>

            <View style={styles.meta}>
                {!!ride.pet_name && (
                    <View style={styles.metaItem}>
                        <PawPrint size={13} color={theme.textMuted} />
                        <Text style={[type.caption, { color: theme.textMuted }]}>{ride.pet_name}</Text>
                    </View>
                )}
                {!!who && (
                    <View style={styles.metaItem}>
                        {perspective === 'client' ? <Truck size={13} color={theme.textMuted} /> : <User size={13} color={theme.textMuted} />}
                        <Text style={[type.caption, { color: theme.textMuted }]}>{who}</Text>
                    </View>
                )}
                {!!when && (
                    <View style={styles.metaItem}>
                        <Calendar size={13} color={theme.textMuted} />
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            {ride.scheduled_at ? 'Programado ' : ''}
                            {when}
                        </Text>
                    </View>
                )}
                {ride.distance_km != null && (
                    <Text style={[type.caption, { color: theme.textMuted }]}>{ride.distance_km.toFixed(1)} km</Text>
                )}
                {ride.pickup_distance_km != null && (
                    <Text style={[type.caption, { color: theme.info }]}>A {ride.pickup_distance_km.toFixed(1)} km de ti</Text>
                )}
                {ride.rating != null && (
                    <View style={styles.metaItem}>
                        <Star size={13} color={theme.warning} fill={theme.warning} />
                        <Text style={[type.caption, { color: theme.textMuted }]}>{ride.rating}/5</Text>
                    </View>
                )}
            </View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginBottom: spacing.md, gap: spacing.sm, borderRadius: radius.lg },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    flex: { flex: 1 },
    meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignItems: 'center', marginTop: spacing.xs },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    footer: { marginTop: spacing.sm, flexDirection: 'row', gap: spacing.sm },
});
