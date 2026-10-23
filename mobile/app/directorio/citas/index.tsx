import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Building2, PawPrint, FileText, CalendarClock, Ban, AlertTriangle, Info } from 'lucide-react-native';
import { useAppointments, STATUS_CONFIG, FILTER_TABS, formatDateTime } from '@/src/hooks/directorio/useAppointments';
import type { Appointment } from '@/src/services/citas';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import Card from '@/src/components/Card';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import FilterChip from '@/src/components/FilterChip';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, radius, spacing, tint, type } from '@/constants/design';

function Line({ icon: Icon, text, muted }: { icon: IconComponent; text: string; muted?: boolean }) {
    const { theme } = useTheme();
    return (
        <View style={styles.line}>
            <Icon size={layout.icon.sm} color={theme.textMuted} />
            <Text style={[type.body, styles.flex, { color: muted ? theme.textMuted : theme.text }]} numberOfLines={2}>{text}</Text>
        </View>
    );
}

export default function CitasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { appointments, countFor, isLoading, isRefetching, refetch, activeFilter, setActiveFilter, handleCancel, handleReschedule, cancelMutation } = useAppointments();

    const renderAppointment = ({ item }: { item: Appointment }) => {
        const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.scheduled;
        const color = theme[status.tone] as string;
        const { date, time } = formatDateTime(item.appointment_date);
        const isActive = !['cancelled', 'completed', 'rescheduled'].includes(item.status);
        return (
            <Card>
                <View style={styles.body}>
                    <View style={styles.head}>
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + tint.faint }]}>
                            <Building2 size={layout.icon.md} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.text }]} numberOfLines={1}>{item.clinic_name || 'Clínica'}</Text>
                            {item.service_name ? <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{item.service_name}</Text> : null}
                        </View>
                        <Badge label={status.label} color={color} size="sm" />
                    </View>
                    <View style={styles.lines}>
                        <Line icon={Calendar} text={`${date}${time ? ` · ${time}` : ''}`} />
                        <Line icon={PawPrint} text={item.pet_name || 'Mascota'} />
                        {item.reason ? <Line icon={FileText} text={item.reason} muted /> : null}
                    </View>
                    {item.is_emergency ? <Badge label="Emergencia" color={theme.error} size="sm" icon={<AlertTriangle size={layout.icon.xs} color={theme.error} />} /> : null}
                    {item.status === 'cancelled' && item.cancellation_reason ? (
                        <View style={[styles.note, { backgroundColor: theme.error + tint.faint }]}>
                            <Info size={layout.icon.sm} color={theme.error} />
                            <Text style={[type.body, styles.flex, { color: theme.text }]}>Motivo: {item.cancellation_reason}</Text>
                        </View>
                    ) : null}
                    {isActive ? (
                        <View style={styles.actions}>
                            <Button
                                label="Reagendar"
                                variant="secondary"
                                size="sm"
                                icon={<CalendarClock size={layout.icon.sm} color={theme.text} />}
                                onPress={() => handleReschedule(item)}
                                style={styles.flex}
                                accessibilityLabel={`Reagendar la cita en ${item.clinic_name || 'la clínica'}`}
                            />
                            <Button
                                label="Cancelar"
                                variant="secondary"
                                size="sm"
                                icon={<Ban size={layout.icon.sm} color={theme.error} />}
                                onPress={() => handleCancel(item)}
                                disabled={cancelMutation.isPending}
                                style={styles.flex}
                                accessibilityLabel={`Cancelar la cita en ${item.clinic_name || 'la clínica'}`}
                            />
                        </View>
                    ) : null}
                </View>
            </Card>
        );
    };

    const header = (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
            {FILTER_TABS.map((tab) => {
                const count = countFor(tab.key);
                return (
                    <FilterChip
                        key={tab.key}
                        label={tab.label}
                        count={tab.key === 'all' || count === 0 ? undefined : count}
                        active={activeFilter === tab.key}
                        onPress={() => setActiveFilter(tab.key)}
                    />
                );
            })}
        </ScrollView>
    );

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis citas" subtitle={countFor('all') > 0 ? `${countFor('all')} ${countFor('all') === 1 ? 'cita' : 'citas'}` : undefined} />
            <DataList
                data={appointments}
                keyExtractor={(item) => item.id}
                renderItem={renderAppointment}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                header={header}
                isLoading={isLoading}
                skeleton
                isRefreshing={isRefetching}
                onRefresh={refetch}
                emptyIcon={activeFilter === 'all' ? <Calendar size={layout.icon.xl} color={theme.textMuted} /> : <Clock size={layout.icon.xl} color={theme.textMuted} />}
                emptyTitle={activeFilter === 'all' ? 'Aún no tienes citas' : 'Nada en este filtro'}
                emptySubtitle={activeFilter === 'all'
                    ? 'Busca una clínica o especialista y agenda en minutos.'
                    : 'No tienes citas con este estado.'}
                emptyActionLabel={activeFilter === 'all' ? 'Buscar veterinario' : 'Ver todas'}
                onEmptyAction={activeFilter === 'all' ? () => router.push('/directorio') : () => setActiveFilter('all')}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    body: { gap: spacing.md },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    iconBox: {
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lines: { gap: spacing.xs },
    line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
    actions: { flexDirection: 'row', gap: spacing.sm },
    chipsScroll: { marginHorizontal: -layout.screenPadding, marginBottom: spacing.md },
    chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding },
    separator: { height: spacing.md },
});
