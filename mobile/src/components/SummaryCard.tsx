/**
 * SummaryCard — Tarjeta destacada con la cifra principal de un panel (ventas, ingresos…) y hasta 3 cifras
 * secundarias. Usa el degradado del color de la pantalla (módulo o rol), igual que la cabecera hero.
 *
 *   <SummaryCard label="Ventas cobradas" value="$5,622.00" icon={TrendingUp}
 *       stats={[{ label: 'Pedidos', value: 4 }, { label: 'Piezas', value: 8 }]} />
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/hooks/useTheme';
import { useScreenAccent } from '@/src/hooks/useScreenAccent';
import type { IconComponent } from '@/src/components/IconButton';
import { accentGradient, families, layout, radius, shadow, spacing, type } from '@/constants/design';

interface SummaryCardProps {
    label: string;
    value: string;
    icon?: IconComponent;
    stats?: { label: string; value: string | number }[];
    /** Texto pequeño bajo la cifra (p. ej. "Solo pedidos cobrados"). */
    caption?: string;
}

export default function SummaryCard({ label, value, icon: Icon, stats, caption }: SummaryCardProps) {
    const { theme } = useTheme();
    const accent = useScreenAccent();
    const colors = accent ? accentGradient(accent) : theme.heroGradient;

    return (
        <LinearGradient
            colors={[...colors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
            accessible
            accessibilityLabel={`${label}: ${value}${stats?.length ? '. ' + stats.map((s) => `${s.label}: ${s.value}`).join(', ') : ''}`}
        >
            <View style={styles.top}>
                <View style={styles.flex}>
                    <Text style={[type.label, { color: theme.onHeroMuted }]}>{label}</Text>
                    <Text style={[type.display, styles.value, { color: theme.onHero }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
                    {caption ? <Text style={[type.caption, { color: theme.onHeroMuted }]}>{caption}</Text> : null}
                </View>
                {Icon ? (
                    <View style={[styles.icon, { backgroundColor: theme.heroGlass, borderColor: theme.heroGlassBorder }]}>
                        <Icon size={layout.icon.md} color={theme.onHero} />
                    </View>
                ) : null}
            </View>
            {stats?.length ? (
                <View style={[styles.stats, { borderTopColor: theme.heroGlassBorder }]}>
                    {stats.map((s, i) => (
                        <View key={s.label} style={[styles.stat, i > 0 && [styles.statDivider, { borderLeftColor: theme.heroGlassBorder }]]}>
                            <Text style={[type.caption, { color: theme.onHeroMuted }]} numberOfLines={1}>{s.label}</Text>
                            <Text style={[type.title, styles.bold, { color: theme.onHero }]} numberOfLines={1} adjustsFontSizeToFit>{s.value}</Text>
                        </View>
                    ))}
                </View>
            ) : null}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: radius.xl, padding: spacing.xl, ...shadow.raised },
    top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    flex: { flex: 1, gap: spacing.xxs },
    value: { fontFamily: families.extrabold },
    icon: {
        width: layout.iconBox.lg,
        height: layout.iconBox.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stats: { flexDirection: 'row', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1 },
    stat: { flex: 1, gap: spacing.xxs },
    statDivider: { borderLeftWidth: 1, paddingLeft: spacing.md },
    bold: { fontFamily: families.extrabold },
});
