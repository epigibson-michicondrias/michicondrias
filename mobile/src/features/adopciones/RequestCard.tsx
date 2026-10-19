/**
 * Tarjeta de una solicitud de adopción recibida: quién, cuándo, estado y motivo. Al tocarla se gestiona.
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Card from '@/src/components/Card';
import Badge from '@/src/components/Badge';
import { useRequestStatus } from '@/src/features/adopciones/requestStatus';
import type { AdoptionRequest } from '@/src/types/adopciones';
import { formatDate } from '@/src/utils/formatters';
import { layout, spacing, type } from '@/constants/design';

interface RequestCardProps {
    request: AdoptionRequest;
    /** Nombre de la mascota (en la lista de todas las solicitudes). */
    petName?: string;
    onPress: () => void;
}

export default function RequestCard({ request, petName, onPress }: RequestCardProps) {
    const { theme } = useTheme();
    const status = useRequestStatus()(request.status);
    const who = request.applicant_name || 'Interesado';
    return (
        <Card onPress={onPress} accessibilityLabel={`Solicitud de ${who}${petName ? ` por ${petName}` : ''}, ${status.label}`}>
            <View style={styles.body}>
                <View style={styles.row}>
                    <View style={styles.flex}>
                        <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{who}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>
                            {petName ? `Por ${petName} · ` : ''}{formatDate(request.created_at)}
                        </Text>
                    </View>
                    <Badge label={status.label} color={status.color} size="sm" />
                </View>
                {request.reason ? (
                    <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={2}>«{request.reason}»</Text>
                ) : null}
                <View style={styles.more}>
                    <Text style={[type.bodyStrong, { color: theme.primary }]}>
                        {request.status === 'PENDING' ? 'Revisar solicitud' : 'Ver solicitud'}
                    </Text>
                    <ChevronRight size={layout.icon.sm} color={theme.primary} />
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    body: { gap: spacing.sm },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    more: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
