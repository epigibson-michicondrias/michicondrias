/**
 * PetPassportShare — tarjeta del carnet compartible de una mascota: QR con la URL pública del
 * pasaporte, el enlace y el botón de compartir. La abre el dueño desde la ficha (`usePetDetail`).
 */
import React from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Share2, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { showAlert } from '@/src/components/AppAlert';
import { copyText } from '@/src/utils/helpers';
import { shareContent } from '@/src/utils/share';
import { spacing, radius, type, shadow, layout } from '@/constants/design';

interface Props {
    /** URL pública del pasaporte; `null` mantiene cerrada la tarjeta. */
    url: string | null;
    petName: string;
    onClose: () => void;
}

export function PetPassportShare({ url, petName, onClose }: Props) {
    const { theme } = useTheme();

    const onShare = async () => {
        if (!url) return;
        const shared = await shareContent(`Carnet de ${petName}`, `Mira el carnet de salud de ${petName}: ${url}`);
        if (shared) return;
        const copied = await copyText(url);
        showAlert(copied
            ? { type: 'success', title: 'Enlace copiado', message: 'Compártelo donde quieras.' }
            : { type: 'info', title: 'No se pudo compartir', message: 'Copia el enlace a mano para compartirlo.' });
    };

    return (
        <Modal visible={!!url} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                    <View style={styles.header}>
                        <Text style={[type.title, { color: theme.text }]}>Carnet de {petName}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar"
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <X size={layout.icon.md} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[type.caption, { color: theme.textMuted, lineHeight: 19 }]}>
                        Quien escanee el QR verá el pasaporte de {petName} (datos, vacunas y seguro vigente). El enlace dura 24 horas.
                    </Text>

                    {/* QR siempre negro sobre blanco: si no, no se escanea (y sin contenido no se dibuja) */}
                    <View style={[styles.qrBox, { borderColor: theme.border, backgroundColor: '#ffffff' }]}>
                        {!!url && <QRCode value={url} size={180} />}
                    </View>

                    <ScrollView style={styles.urlBox} horizontal showsHorizontalScrollIndicator={false}>
                        <Text selectable style={[type.caption, styles.url, { color: theme.textMuted }]}>{url}</Text>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.shareBtn, { backgroundColor: theme.primary }]}
                        onPress={onShare}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                    >
                        <Share2 size={layout.icon.sm} color={theme.onPrimary} />
                        <Text style={[styles.shareBtnText, { color: theme.onPrimary }]}>Compartir enlace</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
                        <Text style={[type.bodyStrong, { color: theme.textMuted }]}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    card: {
        borderRadius: radius.xxl,
        borderWidth: 1,
        padding: spacing.xl,
        gap: spacing.md,
        ...shadow.raised,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    qrBox: {
        alignSelf: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    urlBox: {
        maxHeight: 40,
    },
    url: {
        fontSize: 12,
    },
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: 52,
        borderRadius: radius.lg,
    },
    shareBtnText: {
        fontSize: 16,
        fontWeight: '800',
    },
    closeBtn: {
        alignItems: 'center',
        minHeight: layout.minTouch,
        justifyContent: 'center',
    },
});
