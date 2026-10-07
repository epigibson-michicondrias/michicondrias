/**
 * Pestañas Salud e Historial de la ficha de la mascota (lo que antes era el carnet: app/carnet/[id].tsx).
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Syringe, Pill, FlaskConical, ClipboardList, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import WeightSparkline from '@/src/components/WeightSparkline';
import { RecordItem, VaccineItem, ReminderItem, LabItem } from '@/src/features/carnet/CarnetItems';
import type { usePetHealth } from '@/src/hooks/carnet/usePetHealth';
import { spacing, radius, type, layout } from '@/constants/design';

type Health = ReturnType<typeof usePetHealth>;

function LoadingRows() {
    return (
        <View style={styles.list}>
            {[0, 1].map((i) => <Skeleton key={i} height={84} borderRadius={radius.lg} />)}
        </View>
    );
}

/** Mensaje corto para secciones vacías dentro de la pestaña (no ocupa la pantalla como un EmptyState). */
function EmptyLine({ text }: { text: string }) {
    const { theme } = useTheme();
    return <Text style={[type.body, styles.emptyLine, { color: theme.textMuted, borderColor: theme.border }]}>{text}</Text>;
}

export function PetHealthTab({ health, petName }: { health: Health; petName: string }) {
    const { theme } = useTheme();
    return (
        <View style={styles.tab}>
            <View style={styles.section}>
                <SectionHeader
                    title="Vacunas"
                    icon={<Syringe size={layout.icon.sm} color={theme.success} />}
                    actionLabel={health.canEdit ? 'Agregar' : undefined}
                    onAction={health.canEdit ? health.addVaccine : undefined}
                />
                {health.loadingVaccines ? <LoadingRows /> : health.vaccines.length === 0 ? (
                    <EmptyLine text={`Aún no hay vacunas registradas de ${petName}.`} />
                ) : (
                    <View style={styles.list}>{health.vaccines.map((v) => <VaccineItem key={v.id} vaccine={v} />)}</View>
                )}
            </View>

            <View style={styles.section}>
                <SectionHeader title="Medicamentos" icon={<Pill size={layout.icon.sm} color={theme.primary} />} />
                {health.loadingReminders ? <LoadingRows /> : health.reminders.length === 0 ? (
                    <EmptyLine text="Sin tratamientos activos. Aparecen aquí cuando una consulta incluye receta." />
                ) : (
                    <View style={styles.list}>
                        {health.reminders.map((r) => (
                            <ReminderItem key={r.id} reminder={r} onCheck={health.checkReminder} canCheck={health.canEdit} />
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <SectionHeader title="Laboratorio" icon={<FlaskConical size={layout.icon.sm} color={theme.info} />} />
                {health.loadingLabs ? <LoadingRows /> : health.labResults.length === 0 ? (
                    <EmptyLine text="Sin resultados de laboratorio." />
                ) : (
                    <View style={styles.list}>{health.labResults.map((r: any, i: number) => <LabItem key={r.id ?? i} result={r} />)}</View>
                )}
            </View>

            {health.isOwner && (
                <Button
                    label="Consultar síntomas con IA"
                    variant="secondary"
                    onPress={health.openSymptomCheck}
                    fullWidth
                    icon={<Sparkles size={layout.icon.md} color={theme.text} />}
                />
            )}
        </View>
    );
}

export function PetHistoryTab({ health, petId }: { health: Health; petId: string }) {
    const { theme } = useTheme();
    return (
        <View style={styles.tab}>
            {health.weightSeries.length >= 2 && <WeightSparkline data={health.weightSeries} color={theme.primary} />}

            {health.loadingRecords ? <LoadingRows /> : health.records.length === 0 ? (
                <EmptyState
                    icon={<ClipboardList size={layout.icon.xl} color={theme.textMuted} />}
                    title="Sin consultas"
                    subtitle="Las visitas al veterinario, con diagnóstico y receta, aparecerán aquí."
                    actionLabel={health.canEdit ? 'Registrar consulta' : undefined}
                    onAction={health.canEdit ? health.addRecord : undefined}
                />
            ) : (
                <>
                    {health.canEdit && <Button label="Registrar consulta" onPress={health.addRecord} variant="secondary" fullWidth />}
                    <View style={styles.list}>
                        {health.records.map((r) => <RecordItem key={r.id} record={r} petId={petId} />)}
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tab: {
        gap: spacing.xl,
    },
    section: {
        gap: spacing.md,
    },
    list: {
        gap: spacing.sm,
    },
    emptyLine: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: radius.lg,
        padding: spacing.lg,
        textAlign: 'center',
    },
});
