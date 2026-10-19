/**
 * OptionMenu — Botón compacto que abre una hoja inferior para elegir una opción (ordenar, filtrar por estado…).
 *
 *   <OptionMenu icon={ArrowUpDown} title="Ordenar por" value={sort} onChange={setSort} options={[
 *       { value: 'relevance', label: 'Relevancia' },
 *       { value: 'price_asc', label: 'Menor precio' },
 *   ]} />
 */
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, radius, spacing, type } from '@/constants/design';

export interface MenuOption<T extends string> {
    value: T;
    label: string;
    icon?: IconComponent;
}

interface OptionMenuProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: MenuOption<T>[];
    /** Título de la hoja (y prefijo para lectores de pantalla). */
    title: string;
    icon?: IconComponent;
}

export default function OptionMenu<T extends string>({ value, onChange, options, title, icon: Icon }: OptionMenuProps<T>) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [open, setOpen] = useState(false);
    const current = options.find((o) => o.value === value) ?? options[0];

    const choose = (v: T) => {
        setOpen(false);
        onChange(v);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.trigger, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setOpen(true)}
                activeOpacity={0.7}
                hitSlop={{ top: 4, bottom: 4 }}
                accessibilityRole="button"
                accessibilityLabel={`${title}: ${current.label}`}
            >
                {Icon && <Icon size={layout.icon.xs} color={theme.textMuted} />}
                <Text style={[type.labelSentence, { color: theme.text }]} numberOfLines={1}>{current.label}</Text>
                <ChevronDown size={layout.icon.xs} color={theme.textMuted} />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Cerrar">
                    <Pressable
                        style={[styles.sheet, { backgroundColor: theme.surface, paddingBottom: insets.bottom + spacing.lg }]}
                        // Tocar dentro de la hoja no la cierra
                        onPress={() => {}}
                    >
                        <View style={[styles.handle, { backgroundColor: theme.border }]} />
                        <Text style={[type.title, styles.sheetTitle, { color: theme.text }]}>{title}</Text>
                        {options.map((o) => {
                            const selected = o.value === value;
                            const OptIcon = o.icon;
                            return (
                                <TouchableOpacity
                                    key={o.value}
                                    style={[styles.option, selected && { backgroundColor: theme.primaryLight }]}
                                    onPress={() => choose(o.value)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                >
                                    {OptIcon && <OptIcon size={layout.icon.sm} color={selected ? theme.primary : theme.textMuted} />}
                                    <Text style={[type.bodyStrong, styles.flex, { color: selected ? theme.primary : theme.text }]}>{o.label}</Text>
                                    {selected && <Check size={layout.icon.sm} color={theme.primary} />}
                                </TouchableOpacity>
                            );
                        })}
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        minHeight: layout.iconBox.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    // Velo igual al de AppAlert (negro translúcido en ambos temas)
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.sm,
        gap: spacing.xxs,
    },
    handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, marginBottom: spacing.md },
    sheetTitle: { marginBottom: spacing.sm },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: layout.minTouch + spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
    },
    flex: { flex: 1 },
});
