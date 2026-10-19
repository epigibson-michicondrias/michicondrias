import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { PawPrint, Clock, CheckCircle2, XCircle, Search, MessageSquare, PartyPopper, Check, Heart } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import Card from '@/src/components/Card';
import Badge from '@/src/components/Badge';
import ListRow from '@/src/components/ListRow';
import { useMyApplications } from '@/src/hooks/adopciones/useMyApplications';
import { useRequestStatus } from '@/src/features/adopciones/requestStatus';
import type { AdoptionRequest } from '@/src/types/adopciones';
import { formatDate } from '@/src/utils/formatters';
import { layout, radius, spacing, tint, type } from '@/constants/design';

const STEP_ICONS = {
    PENDING: Clock,
    REVIEWING: Search,
    INTERVIEW_SCHEDULED: MessageSquare,
    APPROVED: CheckCircle2,
    ADOPTED: PartyPopper,
} as const;

const DOT = layout.iconBox.sm - spacing.sm;

export default function MisSolicitudesScreen() {
    const { theme } = useTheme();
    const statusOf = useRequestStatus();
    const { requests, isLoading, isRefetching, refetch, getProgressIndex, goToExplore, goToMyPets, STEPS } = useMyApplications();

    const renderItem = ({ item }: { item: AdoptionRequest }) => {
        const current = getProgressIndex(item.status);
        const isRejected = item.status === 'REJECTED';
        const status = statusOf(item.status);
        return (
            <Card>
                <View style={styles.body}>
                    <View style={styles.head}>
                        <View style={[styles.photo, { backgroundColor: theme.primary + tint.faint }]}>
                            {item.pet_photo_url
                                ? <Image source={{ uri: item.pet_photo_url }} style={styles.fill} />
                                : <PawPrint size={layout.icon.md} color={theme.primary} />}
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{item.pet_name || 'Mascota'}</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>Enviada el {formatDate(item.created_at)}</Text>
                        </View>
                        <Badge label={status.label} color={status.color} size="sm" />
                    </View>

                    {isRejected ? (
                        <View style={[styles.note, { backgroundColor: theme.error + tint.faint }]}>
                            <XCircle size={layout.icon.sm} color={theme.error} />
                            <Text style={[type.body, styles.flex, { color: theme.text }]}>
                                Esta vez no siguió adelante. Hay más mascotas buscando hogar.
                            </Text>
                        </View>
                    ) : item.status === 'ADOPTED' ? (
                        <ListRow
                            icon={PartyPopper}
                            color={theme.success}
                            label="¡Felicidades, ya es parte de tu familia!"
                            desc="Ya está registrada en tus mascotas"
                            onPress={goToMyPets}
                        />
                    ) : (
                        <View style={styles.stepper}>
                            <View style={[styles.line, { backgroundColor: theme.border }]}>
                                <View style={[styles.lineFill, { backgroundColor: theme.primary, width: `${(current / (STEPS.length - 1)) * 100}%` }]} />
                            </View>
                            <View style={styles.steps}>
                                {STEPS.map((step, idx) => {
                                    const done = idx < current;
                                    const active = idx === current;
                                    const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] || Clock;
                                    return (
                                        <View key={step.key} style={styles.step}>
                                            <View style={[
                                                styles.dot,
                                                { backgroundColor: done ? theme.primary : theme.surface, borderColor: done || active ? theme.primary : theme.border },
                                            ]}>
                                                {done
                                                    ? <Check size={layout.icon.xs} color={theme.onPrimary} strokeWidth={3} />
                                                    : <Icon size={layout.icon.xs} color={active ? theme.primary : theme.textMuted} />}
                                            </View>
                                            <Text style={[type.caption, styles.stepLabel, { color: active ? theme.primary : theme.textMuted }]} numberOfLines={1}>
                                                {step.label}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis solicitudes" subtitle="Te avisamos cada vez que cambie su estado" />
            <DataList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                isLoading={isLoading}
                skeleton
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<Heart size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                emptyTitle="Aún no has pedido adoptar"
                emptySubtitle="Cuando postules por una mascota, aquí verás en qué paso va."
                emptyActionLabel="Ver mascotas en adopción"
                onEmptyAction={goToExplore}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    fill: { width: '100%', height: '100%' },
    body: { gap: spacing.md },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    photo: {
        width: layout.iconBox.lg,
        height: layout.iconBox.lg,
        borderRadius: radius.md,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
    stepper: { paddingTop: spacing.xs },
    line: { position: 'absolute', top: spacing.xs + DOT / 2, left: '10%', right: '10%', height: 2, borderRadius: radius.pill },
    lineFill: { height: '100%', borderRadius: radius.pill },
    steps: { flexDirection: 'row' },
    step: { flex: 1, alignItems: 'center', gap: spacing.xs },
    dot: { width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { textAlign: 'center' },
    separator: { height: spacing.md },
});
