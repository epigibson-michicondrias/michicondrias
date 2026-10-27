/**
 * BottomSheet — Hoja inferior modal con título, contenido desplazable y acciones fijas abajo.
 * Para formularios cortos sobre una pantalla (solicitar un paseo, una visita…). El teclado no tapa los campos.
 * Diseño premium: ancho acotado en pantallas grandes (web/tablet), sombra flotante, bordes suaves.
 */
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { haptic } from '@/src/utils/haptics';
import IconButton from '@/src/components/IconButton';
import { layout, radius, spacing, type, shadow } from '@/constants/design';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    /** Acciones fijas al pie (p. ej. Cancelar + Enviar). */
    footer?: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, title, subtitle, children, footer }: BottomSheetProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            haptic.light();
        }
    }, [visible]);

    const handleClose = () => {
        haptic.selection();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
                {/* Velo: tocar fuera cierra */}
                <Pressable style={styles.backdrop} onPress={handleClose} accessibilityLabel="Cerrar" />
                <View
                    style={[
                        styles.sheet,
                        shadow.floating,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.borderLight,
                        },
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: theme.border }]} />
                    <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
                        <View style={styles.flex}>
                            <Text accessibilityRole="header" style={[type.h2, { color: theme.text }]}>
                                {title}
                            </Text>
                            {subtitle ? (
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    {subtitle}
                                </Text>
                            ) : null}
                        </View>
                        <IconButton icon={X} accessibilityLabel="Cerrar" onPress={handleClose} size="sm" />
                    </View>
                    <ScrollView
                        contentContainerStyle={styles.body}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                    {footer ? (
                        <View
                            style={[
                                styles.footer,
                                {
                                    borderTopColor: theme.borderLight,
                                    backgroundColor: theme.surface,
                                    paddingBottom: insets.bottom + spacing.md,
                                },
                            ]}
                        >
                            {footer}
                        </View>
                    ) : (
                        <View style={{ height: insets.bottom + spacing.md }} />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    sheet: {
        maxHeight: '88%',
        width: '100%',
        maxWidth: 540,
        alignSelf: 'center',
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        borderWidth: 1,
        borderBottomWidth: 0,
        paddingTop: spacing.md,
        overflow: 'hidden',
    },
    handle: {
        alignSelf: 'center',
        width: 44,
        height: 5,
        borderRadius: radius.pill,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: spacing.xs,
    },
    body: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
        gap: spacing.xl,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.md,
        borderTopWidth: 1,
    },
});