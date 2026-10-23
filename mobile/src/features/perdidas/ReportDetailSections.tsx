/**
 * Secciones del detalle de un reporte de mascota perdida/encontrada: collar Michi-Tracker y aviso de avistamiento.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { Wifi, Clock, Navigation, Eye, Send } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import FormField from '@/src/components/FormField';
import { getTimeAgo } from '@/src/utils/formatters';
import { layout, radius, spacing, tint, type } from '@/constants/design';

interface TrackerCardProps {
    live: boolean;
    lastTrackedAt: string | null | undefined;
    position: { lat: number; lng: number } | null;
}

/** Estado del collar GPS: conectado o sin señal, última señal y posición. */
export function TrackerCard({ live, lastTrackedAt, position }: TrackerCardProps) {
    const { theme } = useTheme();
    return (
        <View style={[styles.tracker, { backgroundColor: theme.success + tint.faint, borderColor: theme.success + tint.medium }]}>
            <View style={styles.trackerHeader}>
                <View style={styles.row}>
                    <Wifi size={layout.icon.md} color={theme.success} />
                    <Text style={[type.title, { color: theme.text }]}>Michi-Tracker</Text>
                </View>
                <Badge label={live ? 'Conectado' : 'Sin señal'} color={live ? theme.success : theme.textMuted} size="sm" variant={live ? 'solid' : 'filled'} />
            </View>
            <View style={styles.metrics}>
                <View style={styles.metric}>
                    <Clock size={layout.icon.sm} color={theme.textMuted} />
                    <View>
                        <Text style={[type.label, { color: theme.textMuted }]}>Última señal</Text>
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{lastTrackedAt ? getTimeAgo(lastTrackedAt) : 'Aún sin datos'}</Text>
                    </View>
                </View>
                {position ? (
                    <View style={styles.metric}>
                        <Navigation size={layout.icon.sm} color={theme.textMuted} />
                        <View>
                            <Text style={[type.label, { color: theme.textMuted }]}>Posición</Text>
                            <Text style={[type.bodyStrong, { color: theme.text }]}>{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</Text>
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

interface SightingFormProps {
    isLost: boolean;
    sending: boolean;
    /** Devuelve true si se envió (entonces se limpia y se cierra). */
    onSubmit: (locationText: string, note: string, shareLocation: boolean) => Promise<boolean>;
}

/** «¿Lo viste?»: se abre al tocar y avisa al dueño con lugar, nota y (opcional) la ubicación actual. */
export function SightingForm({ isLost, sending, onSubmit }: SightingFormProps) {
    const { theme } = useTheme();
    const [open, setOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [note, setNote] = useState('');
    const [shareLocation, setShareLocation] = useState(true);

    const send = async () => {
        if (await onSubmit(location, note, shareLocation)) {
            setLocation('');
            setNote('');
            setOpen(false);
        }
    };

    return (
        <View style={[styles.sighting, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.row}>
                <Eye size={layout.icon.md} color={theme.primary} />
                <View style={styles.flex}>
                    <Text style={[type.title, { color: theme.text }]}>{isLost ? '¿Lo viste?' : '¿Es tu mascota?'}</Text>
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {isLost ? 'Avísale al dueño dónde y cuándo.' : 'Avísale a quien la encontró.'}
                    </Text>
                </View>
            </View>
            {!open ? (
                <Button label="Avisar que lo vi" variant="secondary" onPress={() => setOpen(true)} fullWidth />
            ) : (
                <View style={styles.form}>
                    <FormField
                        label="¿Dónde lo viste?"
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Calle, colonia o referencia"
                    />
                    <FormField
                        label="Nota para el dueño"
                        value={note}
                        onChangeText={setNote}
                        placeholder="Cómo estaba, hacia dónde fue…"
                        multiline
                    />
                    <View style={styles.row}>
                        <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>Enviar mi ubicación actual como punto del avistamiento</Text>
                        <Switch
                            value={shareLocation}
                            onValueChange={setShareLocation}
                            trackColor={{ true: theme.primary, false: theme.border }}
                            accessibilityLabel="Enviar mi ubicación actual"
                        />
                    </View>
                    <Button
                        label="Enviar aviso"
                        icon={<Send size={layout.icon.sm} color={theme.onPrimary} />}
                        onPress={send}
                        loading={sending}
                        fullWidth
                    />
                    <Button label="Cancelar" variant="ghost" onPress={() => setOpen(false)} fullWidth disabled={sending} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    tracker: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg },
    trackerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
    metric: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sighting: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg },
    form: { gap: spacing.md },
});
