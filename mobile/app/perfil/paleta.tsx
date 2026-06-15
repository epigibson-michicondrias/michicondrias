import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import Colors from '../../constants/Colors';
import { palettes, ACTIVE_PALETTE } from '../../constants/palettes';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ChevronLeft, Check, Palette, RotateCcw } from 'lucide-react-native';

const PALETTE_KEYS = Object.keys(palettes);

export default function PaletteSettingsScreen() {
    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';
    const [selected, setSelected] = useState(ACTIVE_PALETTE);

    const handleApply = () => {
        showAlert({
            type: 'warning',
            title: 'Cambiar paleta',
            message: 'El cambio se aplicará la próxima vez que abras la app. ¿Quieres continuar?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Entendido',
            onButtonPress: () => {
                showAlert({
                    type: 'info',
                    title: 'Paleta seleccionada',
                    message: `Paleta "${palettes[selected].name}" guardada.\n\nCierra y vuelve a abrir la app para ver los cambios.\n\nO edita constants/palettes.ts y cambia ACTIVE_PALETTE = '${selected}'`,
                });
                router.back();
            },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.overlayHover }]} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Paleta de Colores</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Current palette info */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Palette size={20} color={theme.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.infoTitle, { color: theme.text }]}>Paleta Activa</Text>
                        <Text style={[styles.infoSubtitle, { color: theme.textMuted }]}>
                            {palettes[ACTIVE_PALETTE]?.name || ACTIVE_PALETTE}
                        </Text>
                    </View>
                    <View style={[styles.activeBadge, { backgroundColor: theme.successLight }]}>
                        <Text style={[styles.activeBadgeText, { color: theme.success }]}>Activa</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Selecciona una paleta</Text>

                {/* Palette list */}
                {PALETTE_KEYS.map((key) => {
                    const pal = palettes[key];
                    const isSelected = selected === key;
                    const isActive = key === ACTIVE_PALETTE;

                    return (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.paletteCard,
                                {
                                    backgroundColor: isSelected ? theme.primaryLight : theme.surface,
                                    borderColor: isSelected ? theme.primary : theme.border,
                                    borderWidth: isSelected ? 2 : 1,
                                }
                            ]}
                            onPress={() => setSelected(key)}
                            activeOpacity={0.7}
                        >
                            {/* Color preview */}
                            <View style={styles.previewRow}>
                                <View style={[styles.colorDot, { backgroundColor: isDark ? pal.dark.primary : pal.light.primary }]} />
                                <View style={[styles.colorDot, { backgroundColor: isDark ? pal.dark.secondary : pal.light.secondary }]} />
                                <View style={[styles.colorDot, { backgroundColor: isDark ? pal.dark.accent : pal.light.accent }]} />
                                <View style={[styles.colorDot, { backgroundColor: isDark ? pal.dark.success : pal.light.success }]} />
                            </View>

                            {/* Mini preview cards */}
                            <View style={styles.miniPreview}>
                                <View style={[styles.miniCard, {
                                    backgroundColor: isDark ? pal.dark.background : pal.light.background,
                                    borderColor: isDark ? pal.dark.border : pal.light.border,
                                }]}>
                                    <View style={[styles.miniCardInner, {
                                        backgroundColor: isDark ? pal.dark.surface : pal.light.surface,
                                    }]} />
                                </View>
                                <View style={[styles.miniCard, {
                                    backgroundColor: isDark ? pal.dark.background : pal.light.background,
                                    borderColor: isDark ? pal.dark.border : pal.light.border,
                                }]}>
                                    <View style={[styles.miniCardInner, {
                                        backgroundColor: isDark ? pal.dark.surface : pal.light.surface,
                                    }]} />
                                </View>
                            </View>

                            {/* Name and status */}
                            <View style={styles.paletteInfo}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.paletteName, { color: theme.text }]}>{pal.name}</Text>
                                    <Text style={[styles.paletteKey, { color: theme.textMuted }]}>{key}</Text>
                                </View>
                                {isActive && (
                                    <View style={[styles.activeDot, { backgroundColor: theme.success }]} />
                                )}
                                {isSelected && (
                                    <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                                        <Check size={14} color="#fff" />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Apply button */}
                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                    onPress={handleApply}
                    activeOpacity={0.8}
                >
                    <Text style={styles.applyBtnText}>Aplicar Paleta</Text>
                </TouchableOpacity>

                {/* Tip */}
                <View style={[styles.tipCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <RotateCcw size={16} color={theme.textMuted} />
                    <Text style={[styles.tipText, { color: theme.textMuted }]}>
                        Tip: También puedes cambiar la paleta directamente editando{'\n'}
                        <Text style={{ fontWeight: '800', color: theme.text }}>constants/palettes.ts</Text>{'\n'}
                        y cambiando la línea ACTIVE_PALETTE
                    </Text>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '800',
    },
    infoSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    activeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    activeBadgeText: {
        fontSize: 11,
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    paletteCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    previewRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    miniPreview: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    miniCard: {
        flex: 1,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        padding: 4,
    },
    miniCardInner: {
        flex: 1,
        borderRadius: 4,
    },
    paletteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paletteName: {
        fontSize: 16,
        fontWeight: '800',
    },
    paletteKey: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyBtn: {
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    tipCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
        alignItems: 'flex-start',
    },
    tipText: {
        flex: 1,
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 18,
    },
});
