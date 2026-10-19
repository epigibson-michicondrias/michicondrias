/**
 * BottomSheet — Hoja inferior modal con título, contenido desplazable y acciones fijas abajo.
 * Para formularios cortos sobre una pantalla (solicitar un paseo, una visita…). El teclado no tapa los campos.
 *
 *   <BottomSheet visible={open} onClose={close} title="Solicitar paseo"
 *       footer={<Button label="Enviar" onPress={send} style={{ flex: 1 }} />}>
 *       …campos…
 *   </BottomSheet>
 */
import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import IconButton from '@/src/components/IconButton';
import { layout, radius, spacing, type } from '@/constants/design';

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
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Velo igual al de AppAlert: tocar fuera cierra */}
                <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
                <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
                    <View style={[styles.handle, { backgroundColor: theme.border }]} />
                    <View style={styles.header}>
                        <View style={styles.flex}>
                            <Text accessibilityRole="header" style={[type.h2, { color: theme.text }]}>{title}</Text>
                            {subtitle ? <Text style={[type.caption, { color: theme.textMuted }]}>{subtitle}</Text> : null}
                        </View>
                        <IconButton icon={X} accessibilityLabel="Cerrar" onPress={onClose} size="sm" />
                    </View>
                    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        {children}
                    </ScrollView>
                    {footer ? (
                        <View style={[styles.footer, { borderTopColor: theme.border, paddingBottom: insets.bottom + spacing.md }]}>{footer}</View>
                    ) : <View style={{ height: insets.bottom + spacing.md }} />}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: {
        maxHeight: '88%',
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingTop: spacing.sm,
    },
    handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, marginBottom: spacing.sm },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: layout.screenPadding, marginBottom: spacing.md },
    body: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.lg, gap: spacing.lg },
    footer: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, borderTopWidth: 1 },
});
