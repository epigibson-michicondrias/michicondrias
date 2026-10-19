/**
 * ReportCard — Tarjeta de un reporte de mascota perdida/encontrada para la cuadrícula de 2 columnas.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { PawPrint, Wifi, MapPin, Clock, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Badge from '@/src/components/Badge';
import { getTimeAgo } from '@/src/utils/formatters';
import type { LostPetReport } from '@/src/types/perdidas';
import { layout, radius, spacing, type } from '@/constants/design';

interface ReportCardProps {
    report: LostPetReport;
    onPress: () => void;
}

export default function ReportCard({ report, onPress }: ReportCardProps) {
    const { theme } = useTheme();
    const isLost = report.report_type === 'lost';

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${isLost ? 'Perdida' : 'Encontrada'}: ${report.pet_name}`}
        >
            <View style={styles.imageBox}>
                {report.image_url ? (
                    <Image source={{ uri: report.image_url }} style={styles.image} accessibilityLabel={`Foto de ${report.pet_name}`} />
                ) : (
                    <View style={[styles.image, styles.noImage, { backgroundColor: theme.overlay }]}>
                        <PawPrint size={layout.icon.xl} color={theme.textMuted} />
                    </View>
                )}
                <View style={styles.badgeLeft}>
                    <Badge label={isLost ? 'Perdida' : 'Encontrada'} color={isLost ? theme.error : theme.info} variant="solid" size="sm" />
                </View>
                {report.has_tracker && (
                    <View style={styles.badgeRight}>
                        <Badge label="GPS" color={theme.success} variant="solid" size="sm" icon={<Wifi size={layout.icon.xs} color={theme.onPrimary} />} />
                    </View>
                )}
            </View>

            <View style={styles.body}>
                <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{report.pet_name}</Text>
                <View style={styles.row}>
                    <MapPin size={layout.icon.xs} color={theme.textMuted} />
                    <Text style={[type.caption, styles.flex, { color: theme.textMuted }]} numberOfLines={1}>
                        {report.last_seen_location || 'Sin ubicación'}
                    </Text>
                </View>
                <View style={styles.footer}>
                    <View style={styles.row}>
                        <Clock size={layout.icon.xs} color={theme.textMuted} />
                        <Text style={[type.caption, { color: theme.textMuted }]}>{getTimeAgo(report.created_at) || 'Reciente'}</Text>
                    </View>
                    {report.is_resolved && (
                        <CheckCircle2 size={layout.icon.sm} color={theme.success} accessibilityLabel="Reunido" />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        borderRadius: radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
    },
    imageBox: { height: 130, width: '100%' },
    image: { width: '100%', height: '100%' },
    noImage: { alignItems: 'center', justifyContent: 'center' },
    badgeLeft: { position: 'absolute', top: spacing.sm, left: spacing.sm },
    badgeRight: { position: 'absolute', top: spacing.sm, right: spacing.sm },
    body: { padding: spacing.md, gap: spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    flex: { flex: 1 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
