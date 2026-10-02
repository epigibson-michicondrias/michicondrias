/**
 * ServiceRequestCard — tarjeta de una solicitud de paseo o cuidado.
 * Muestra lo mismo a ambos lados (profesional y cliente) y ofrece solo las acciones que el backend permite
 * a cada uno según el estado: el profesional acepta/rechaza/inicia/completa; el cliente cancela y califica.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, Clock, MapPin, Star, StickyNote } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/components/AppAlert';
import type { Perspective, ProRequest, RequestKind } from '@/src/hooks/servicios-pro/useProRequests';
import {
    formatIsoDate,
    getStatusColors,
    normalizeStatus,
    STATUS_LABELS,
} from '@/src/hooks/servicios-pro/requestStatus';

interface Props {
    kind: RequestKind;
    request: ProRequest;
    perspective: Perspective;
    busy?: boolean;
    onStatus: (status: string) => void;
    /** El cliente abre el perfil del profesional para calificar el servicio completado */
    onReview?: () => void;
    /** Abre el perfil del profesional (vista de cliente) */
    onOpenProfile?: () => void;
}

const SIT_TYPE_LABELS: Record<string, string> = {
    hosting: 'Hospedaje',
    visiting: 'Visitas a domicilio',
};

export default function ServiceRequestCard({ kind, request, perspective, busy, onStatus, onReview, onOpenProfile }: Props) {
    const { theme } = useTheme();
    const status = normalizeStatus(request.status);
    const colors = getStatusColors(status, theme);
    const isWalk = kind === 'walk';
    const walk = request as any;
    const providerName: string | null | undefined = isWalk ? walk.walker_name : walk.sitter_name;
    const petName = request.pet_name || 'Mascota';
    const subtitle =
        perspective === 'provider'
            ? `Cliente: ${request.client_name || 'Sin nombre'}`
            : `${isWalk ? 'Paseador' : 'Cuidador'}: ${providerName || 'Sin nombre'}`;

    const dateText = isWalk
        ? formatIsoDate(walk.requested_date)
        : walk.start_date?.substring(0, 10) === walk.end_date?.substring(0, 10)
            ? formatIsoDate(walk.start_date)
            : `${formatIsoDate(walk.start_date)} → ${formatIsoDate(walk.end_date)}`;
    const serviceText = isWalk ? 'Paseo' : SIT_TYPE_LABELS[walk.service_type] || 'Cuidado';
    const address: string | null | undefined = isWalk ? walk.pickup_address : walk.address;

    const confirm = (title: string, message: string, next: string, buttonText: string, type: 'warning' | 'info' = 'warning') =>
        showAlert({ type, title, message, showCancel: true, cancelText: 'Volver', buttonText, onButtonPress: () => onStatus(next) });

    const providerActions = () => {
        if (status === 'pending') {
            return (
                <>
                    <ActionButton
                        label="Rechazar"
                        tone="danger"
                        disabled={busy}
                        onPress={() => confirm('Rechazar solicitud', `Se cancelará la solicitud de ${petName}. El cliente será notificado en su lista.`, 'cancelled', 'Rechazar')}
                    />
                    <ActionButton label="Aceptar" tone="primary" disabled={busy} onPress={() => onStatus('accepted')} />
                </>
            );
        }
        if (status === 'accepted') {
            return (
                <>
                    <ActionButton
                        label="Cancelar"
                        tone="danger"
                        disabled={busy}
                        onPress={() => confirm('Cancelar servicio', `¿Cancelar el servicio de ${petName}?`, 'cancelled', 'Cancelar servicio')}
                    />
                    <ActionButton label="Iniciar" tone="secondary" disabled={busy} onPress={() => onStatus('in_progress')} />
                </>
            );
        }
        if (status === 'in_progress') {
            return (
                <ActionButton
                    label="Marcar completado"
                    tone="primary"
                    disabled={busy}
                    onPress={() => confirm('Completar servicio', `¿Confirmas que el servicio de ${petName} ya terminó?`, 'completed', 'Completar', 'info')}
                />
            );
        }
        return null;
    };

    const clientActions = () => {
        if (status === 'pending' || status === 'accepted') {
            return (
                <ActionButton
                    label="Cancelar solicitud"
                    tone="danger"
                    disabled={busy}
                    onPress={() => confirm('Cancelar solicitud', '¿Quieres cancelar esta solicitud?', 'cancelled', 'Cancelar solicitud')}
                />
            );
        }
        if (status === 'completed' && !request.has_review && onReview) {
            return <ActionButton label="Calificar" tone="primary" icon={<Star size={14} color="#fff" />} onPress={onReview} />;
        }
        return null;
    };

    const actions = perspective === 'provider' ? providerActions() : clientActions();

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
                activeOpacity={onOpenProfile ? 0.7 : 1}
                disabled={!onOpenProfile}
                onPress={onOpenProfile}
                accessibilityRole={onOpenProfile ? 'button' : undefined}
                accessibilityLabel={onOpenProfile ? `Ver perfil. ${petName}. ${subtitle}` : undefined}
                style={styles.header}
            >
                <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.avatarText, { color: theme.primary }]}>{petName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{petName}</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]} numberOfLines={1}>{subtitle}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.badgeText, { color: colors.color }]}>{STATUS_LABELS[status]}</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.details}>
                <Row icon={<Calendar size={14} color={theme.textMuted} />} text={`${serviceText} · ${dateText}`} color={theme.textMuted} />
                {isWalk && (walk.requested_time || walk.duration_minutes) ? (
                    <Row
                        icon={<Clock size={14} color={theme.textMuted} />}
                        text={[walk.requested_time, walk.duration_minutes ? `${walk.duration_minutes} min` : null].filter(Boolean).join(' · ')}
                        color={theme.textMuted}
                    />
                ) : null}
                {address ? <Row icon={<MapPin size={14} color={theme.textMuted} />} text={address} color={theme.textMuted} /> : null}
                {request.notes ? <Row icon={<StickyNote size={14} color={theme.textMuted} />} text={request.notes} color={theme.textMuted} /> : null}
            </View>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <View>
                    <Text style={[styles.price, { color: theme.primary }]}>
                        {request.total_price != null ? `$${request.total_price.toLocaleString('es-MX')}` : 'Por acordar'}
                    </Text>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Estimado</Text>
                </View>
                <View style={styles.actions}>
                    {busy ? <ActivityIndicator color={theme.primary} /> : actions}
                </View>
            </View>
        </View>
    );
}

function Row({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
    return (
        <View style={styles.row}>
            {icon}
            <Text style={[styles.rowText, { color }]} numberOfLines={2}>{text}</Text>
        </View>
    );
}

function ActionButton({
    label,
    tone,
    onPress,
    disabled,
    icon,
}: {
    label: string;
    tone: 'primary' | 'secondary' | 'danger';
    onPress: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}) {
    const { theme } = useTheme();
    const bg = tone === 'primary' ? theme.primary : tone === 'secondary' ? theme.secondary : 'transparent';
    const border = tone === 'danger' ? theme.error : bg;
    const fg = tone === 'danger' ? theme.error : '#fff';
    return (
        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: bg, borderColor: border }, disabled && { opacity: 0.5 }]}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            activeOpacity={0.8}
        >
            {icon}
            <Text style={[styles.actionText, { color: fg }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 14 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: '800' },
    headerInfo: { flex: 1 },
    title: { fontSize: 16, fontWeight: '800' },
    subtitle: { fontSize: 13, marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontSize: 11, fontWeight: '800' },
    details: { gap: 8, marginTop: 14 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    rowText: { flex: 1, fontSize: 13, lineHeight: 18 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
    price: { fontSize: 18, fontWeight: '900' },
    priceLabel: { fontSize: 11 },
    actions: { flexDirection: 'row', gap: 8, flexShrink: 1, flexWrap: 'wrap', justifyContent: 'flex-end' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
    actionText: { fontSize: 13, fontWeight: '800' },
});
