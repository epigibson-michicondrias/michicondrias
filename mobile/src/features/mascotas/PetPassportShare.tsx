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
                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Carnet de {petName}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Cerrar"
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <X size={22} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.hint, { color: theme.textMuted }]}>
                        Quien escanee el QR podrá ver el carnet de salud de {petName}.
                    </Text>

                    {/* QR siempre negro sobre blanco: si no, no se escanea (y sin contenido no se dibuja) */}
                    <View style={[styles.qrBox, { borderColor: theme.border }]}>
                        {!!url && <QRCode value={url} size={180} />}
                    </View>

                    <ScrollView style={styles.urlBox} horizontal showsHorizontalScrollIndicator={false}>
                        <Text selectable style={[styles.url, { color: theme.textMuted }]}>{url}</Text>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.shareBtn, { backgroundColor: theme.primary }]}
                        onPress={onShare}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                    >
                        <Share2 size={18} color="#fff" />
                        <Text style={styles.shareBtnText}>Compartir enlace</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityRole="button">
                        <Text style={[styles.closeBtnText, { color: theme.textMuted }]}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        gap: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '800',
    },
    hint: {
        fontSize: 13,
        lineHeight: 19,
    },
    qrBox: {
        alignSelf: 'center',
        padding: 16,
        borderRadius: 16,
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
        gap: 8,
        minHeight: 52,
        borderRadius: 16,
    },
    shareBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    closeBtn: {
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
    },
    closeBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
});
