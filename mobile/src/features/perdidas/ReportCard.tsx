/**
 * Reporte de mascota perdida/encontrada en sus dos formas de ver: `ReportGridCard` (cuadrícula) y `ReportListRow`
 * (lista). Ambas se apoyan en `MediaCard`/`MediaRow`.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PawPrint, Wifi, MapPin, Clock, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Badge from '@/src/components/Badge';
import { MediaCard, MediaRow, type MediaLine } from '@/src/components/MediaCard';
import { getTimeAgo } from '@/src/utils/formatters';
import type { LostPetReport } from '@/src/types/perdidas';
import { layout, spacing } from '@/constants/design';

interface ReportCardProps {
    report: LostPetReport;
    onPress: () => void;
}

/** Insignias, renglones y etiqueta comunes a las dos formas. */
function useReportContent(report: LostPetReport) {
    const { theme } = useTheme();
    const isLost = report.report_type === 'lost';
    const status = report.is_resolved
        ? <Badge label="Reunido" color={theme.success} variant="solid" size="sm" icon={<CheckCircle2 size={layout.icon.xs} color={theme.onPrimary} />} />
        : <Badge label={isLost ? 'Perdida' : 'Encontrada'} color={isLost ? theme.error : theme.info} variant="solid" size="sm" />;
    const gps = report.has_tracker
        ? <Badge label="GPS" color={theme.success} variant="solid" size="sm" icon={<Wifi size={layout.icon.xs} color={theme.onPrimary} />} />
        : undefined;
    const lines: MediaLine[] = [
        { text: report.last_seen_location || 'Sin ubicación', icon: MapPin },
        { text: getTimeAgo(report.created_at) || 'Reciente', icon: Clock },
    ];
    const accessibilityLabel = `${report.is_resolved ? 'Reunido' : isLost ? 'Perdida' : 'Encontrada'}: ${report.pet_name}`;
    return { status, gps, lines, accessibilityLabel };
}

/** `width`: ancho de la celda (de `useGridCell`). */
export function ReportGridCard({ report, onPress, width }: ReportCardProps & { width: number }) {
    const { status, gps, lines, accessibilityLabel } = useReportContent(report);
    return (
        <MediaCard
            width={width}
            imageUrl={report.image_url}
            fallbackIcon={PawPrint}
            title={report.pet_name}
            lines={lines}
            topLeft={status}
            topRight={gps}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
        />
    );
}

export function ReportListRow({ report, onPress }: ReportCardProps) {
    const { status, gps, lines, accessibilityLabel } = useReportContent(report);
    return (
        <MediaRow
            imageUrl={report.image_url}
            fallbackIcon={PawPrint}
            title={report.pet_name}
            lines={lines}
            trailing={<View style={styles.badges}>{gps}{status}</View>}
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
        />
    );
}

const styles = StyleSheet.create({
    badges: { flexDirection: 'row', gap: spacing.xs },
});
