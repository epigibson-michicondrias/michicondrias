/**
 * Secciones de Inicio: atajos en cuadrícula, carrusel de mascotas y próximas citas.
 */
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Plus, PawPrint, Calendar, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Badge from '@/src/components/Badge';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import type { IconComponent } from '@/src/components/IconButton';
import { sentenceCase } from '@/src/utils/formatters';
import { haptic } from '@/src/utils/haptics';
import { families, layout, radius, shadow, spacing, tint, type } from '@/constants/design';

// ── Atajos ──────────────────────────────────────────────────────────

export interface Shortcut {
    key: string;
    label: string;
    icon: IconComponent;
    color: string;
    onPress: () => void;
    hint?: string;
}

const SHORTCUT_COLUMNS = 4;

/** Cuadrícula de 4 atajos por fila (ícono con tinte + etiqueta corta). */
export function ShortcutGrid({ items }: { items: Shortcut[] }) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const cell = (Math.min(width, 600) - layout.screenPadding * 2 - spacing.sm * (SHORTCUT_COLUMNS - 1)) / SHORTCUT_COLUMNS;
    return (
        <View style={styles.grid}>
            {items.map(({ key, label, icon: Icon, color, onPress, hint }) => (
                <TouchableOpacity
                    key={key}
                    onPress={() => {
                        haptic.selection();
                        onPress();
                    }}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={hint ? `${label}. ${hint}` : label}
                    style={[styles.shortcut, { width: cell }]}
                >
                    <View style={[styles.shortcutIcon, { backgroundColor: color + tint.medium }]}>
                        <Icon size={layout.icon.md} color={color} />
                    </View>
                    <Text style={[type.caption, styles.shortcutLabel, { color: theme.text }]} numberOfLines={2}>{label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// ── Mascotas ────────────────────────────────────────────────────────

interface PetItem {
    id: string;
    name: string;
    species?: string | null;
    photo_url?: string | null;
}

const PET_CARD = { width: 112, height: 136 };

/** Carrusel horizontal: «Agregar» + una tarjeta por mascota (foto o ícono si no tiene). */
export function PetCarousel({ pets, loading, onAdd, onOpen }: {
    pets: PetItem[];
    loading: boolean;
    onAdd: () => void;
    onOpen: (id: string) => void;
}) {
    const { theme } = useTheme();
    if (loading) {
        return (
            <View style={styles.carousel}>
                {[0, 1, 2].map((i) => <Skeleton key={i} width={PET_CARD.width} height={PET_CARD.height} borderRadius={radius.lg} />)}
            </View>
        );
    }
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            <TouchableOpacity
                onPress={onAdd}
                accessibilityRole="button"
                accessibilityLabel="Agregar mascota"
                style={[styles.addPet, { borderColor: theme.border, backgroundColor: theme.surface }]}
            >
                <Plus size={layout.icon.md} color={theme.primary} />
                <Text style={[type.caption, { color: theme.textMuted }]}>Agregar</Text>
            </TouchableOpacity>
            {pets.map((pet) => (
                <TouchableOpacity
                    key={pet.id}
                    onPress={() => onOpen(pet.id)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver a ${pet.name}`}
                    style={[styles.petCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                >
                    <View style={[styles.petPhoto, { backgroundColor: theme.primary + tint.faint }]}>
                        {pet.photo_url ? (
                            <Image source={{ uri: pet.photo_url }} style={styles.fill} contentFit="cover" transition={200} />
                        ) : (
                            <PawPrint size={layout.icon.lg} color={theme.primary} strokeWidth={1.5} />
                        )}
                    </View>
                    <View style={styles.petInfo}>
                        <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                        {pet.species ? <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{sentenceCase(pet.species)}</Text> : null}
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

// ── Citas ───────────────────────────────────────────────────────────

export interface AppointmentRow {
    id: string;
    when: string;
    where: string;
    statusLabel: string;
    statusColor: string;
}

export function AppointmentList({ items, loading, onOpen, onBook }: {
    items: AppointmentRow[];
    loading: boolean;
    onOpen: () => void;
    onBook: () => void;
}) {
    const { theme } = useTheme();
    if (loading) {
        return <View style={styles.list}>{[0, 1].map((i) => <Skeleton key={i} height={64} borderRadius={radius.md} />)}</View>;
    }
    if (items.length === 0) {
        return (
            <EmptyState
                icon={<Calendar size={layout.icon.xl} color={theme.textMuted} />}
                title="Sin citas próximas"
                subtitle="Encuentra un veterinario y agenda en minutos."
                actionLabel="Agendar"
                onAction={onBook}
            />
        );
    }
    return (
        <View style={styles.list}>
            {items.map((a) => (
                <TouchableOpacity
                    key={a.id}
                    onPress={onOpen}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Cita ${a.when}, ${a.where}, ${a.statusLabel}`}
                    style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                >
                    <View style={[styles.rowIcon, { backgroundColor: theme.primary + tint.faint }]}>
                        <Calendar size={layout.icon.sm} color={theme.primary} />
                    </View>
                    <View style={styles.flex}>
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{a.when}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{a.where}</Text>
                    </View>
                    <Badge label={a.statusLabel} color={a.statusColor} size="sm" />
                    <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    fill: { width: '100%', height: '100%' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, rowGap: spacing.lg, paddingHorizontal: layout.screenPadding },
    shortcut: { alignItems: 'center', gap: spacing.xs, minHeight: layout.minTouch },
    shortcutIcon: {
        width: layout.iconBox.lg,
        height: layout.iconBox.lg,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shortcutLabel: { textAlign: 'center', fontFamily: families.semibold },
    carousel: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: layout.screenPadding },
    addPet: {
        width: PET_CARD.width * 0.7,
        height: PET_CARD.height,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    petCard: {
        width: PET_CARD.width,
        height: PET_CARD.height,
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        ...shadow.card,
    },
    petPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    petInfo: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
    list: { gap: spacing.sm, paddingHorizontal: layout.screenPadding },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    rowIcon: {
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// ── Servicios (Explorar) ────────────────────────────────────────────

export interface ServiceItem {
    key: string;
    title: string;
    subtitle: string;
    icon: IconComponent;
    color: string;
    onPress: () => void;
}

/** Cuadrícula de 2 columnas: ícono con tinte a la izquierda, nombre y descripción corta. */
export function ServiceGrid({ items }: { items: ServiceItem[] }) {
    const { theme } = useTheme();
    return (
        <View style={serviceStyles.grid}>
            {items.map(({ key, title, subtitle, icon: Icon, color, onPress }) => (
                <TouchableOpacity
                    key={key}
                    onPress={() => {
                        haptic.selection();
                        onPress();
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${title}. ${subtitle}`}
                    style={[serviceStyles.tile, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                >
                    <View style={[serviceStyles.icon, { backgroundColor: color + tint.medium }]}>
                        <Icon size={layout.icon.md} color={color} />
                    </View>
                    <View style={styles.flex}>
                        <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={2}>{subtitle}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const serviceStyles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: layout.screenPadding },
    tile: {
        flexGrow: 1,
        flexBasis: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.sm + spacing.xxs,
        minHeight: layout.minTouch + spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    icon: {
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
