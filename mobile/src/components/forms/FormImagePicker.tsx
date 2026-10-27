/**
 * FormImagePicker — selector de imágenes temático con vista previa y controles accesibles.
 * Permite cambiar foto tocando el avatar o el botón de cámara, y eliminar la foto con confirmación visual clara.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Trash2, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInFormSection } from '@/src/components/forms/FormSection';
import { layout, radius, spacing, type, press, shadow } from '@/constants/design';

interface FormImagePickerProps {
    label?: string;
    imageUri: string | null;
    onImageSelected: (uri: string) => void;
    onImageRemoved?: () => void;
    /** Proporción del recorte. */
    aspect?: [number, number];
    /** Alto del área de vista previa. */
    previewHeight?: number;
    /** Texto del placeholder. */
    placeholder?: string;
    /** Renderiza como avatar circular. */
    circular?: boolean;
}

export default function FormImagePicker({
    label,
    imageUri,
    onImageSelected,
    onImageRemoved,
    aspect = [4, 3],
    previewHeight = 200,
    placeholder = 'Agregar foto',
    circular,
}: FormImagePickerProps) {
    const { theme } = useTheme();
    const inSection = useInFormSection();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            onImageSelected(result.assets[0].uri);
        }
    };

    return (
        <View style={[styles.container, inSection && styles.inSection, circular && { alignSelf: 'center' }]}>
            {label ? (
                <Text
                    style={[
                        type.labelSentence,
                        styles.label,
                        { color: theme.textMuted, textAlign: circular ? 'center' : 'left' },
                    ]}
                >
                    {label}
                </Text>
            ) : null}

            {imageUri ? (
                <View style={circular ? styles.avatarOuter : styles.rectOuter}>
                    {/* Contenedor táctil: tocar toda la foto abre el selector para cambiarla */}
                    <TouchableOpacity
                        style={[
                            styles.previewContainer,
                            {
                                height: previewHeight,
                                width: circular ? previewHeight : undefined,
                                borderRadius: circular ? previewHeight / 2 : radius.lg,
                                borderWidth: circular ? 2.5 : 0,
                                borderColor: theme.accent,
                            },
                            circular && { alignSelf: 'center' },
                        ]}
                        onPress={pickImage}
                        activeOpacity={press.strong}
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar foto"
                        accessibilityHint="Toca para seleccionar una nueva foto"
                    >
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.preview}
                            contentFit="cover"
                            transition={150}
                        />

                        {/* Botón rectangular para modo no circular */}
                        {!circular && (
                            <View
                                style={[
                                    styles.changeBtn,
                                    { backgroundColor: theme.surface },
                                ]}
                            >
                                <Camera size={layout.icon.sm} color={theme.primary} />
                                <Text style={[type.button, { color: theme.primary }]}>Cambiar</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Botón de cámara flotante amplio para cambiar foto en modo circular */}
                    {circular && (
                        <TouchableOpacity
                            style={[
                                styles.cameraBadge,
                                shadow.raised,
                                {
                                    backgroundColor: theme.primary,
                                    borderColor: theme.surface,
                                },
                            ]}
                            onPress={pickImage}
                            activeOpacity={press.normal}
                            accessibilityRole="button"
                            accessibilityLabel="Cambiar foto"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Camera size={18} color={theme.onPrimary} />
                        </TouchableOpacity>
                    )}

                    {/* Botón flotante para eliminar foto actual */}
                    {onImageRemoved ? (
                        <TouchableOpacity
                            style={[
                                circular ? styles.removeBadgeCircular : styles.removeBtn,
                                shadow.raised,
                                {
                                    backgroundColor: theme.error,
                                    borderColor: circular ? theme.surface : 'transparent',
                                },
                            ]}
                            onPress={onImageRemoved}
                            activeOpacity={press.normal}
                            accessibilityRole="button"
                            accessibilityLabel="Eliminar foto actual"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {circular ? (
                                <Trash2 size={16} color={theme.onPrimary} />
                            ) : (
                                <X size={layout.icon.sm} color={theme.onPrimary} />
                            )}
                        </TouchableOpacity>
                    ) : null}

                    {/* Enlace de texto claro para eliminar foto en caso de preferirlo */}
                    {circular && onImageRemoved ? (
                        <TouchableOpacity
                            onPress={onImageRemoved}
                            activeOpacity={press.subtle}
                            style={styles.removeTextButton}
                            accessibilityRole="button"
                            accessibilityLabel="Quitar foto actual"
                        >
                            <Trash2 size={13} color={theme.error} />
                            <Text style={[type.caption, { color: theme.error }]}>Quitar foto</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.placeholder,
                        {
                            backgroundColor: circular ? theme.accentLight : theme.inputBg,
                            borderColor: circular ? theme.accent : theme.inputBorder,
                            height: previewHeight,
                            borderRadius: circular ? previewHeight / 2 : radius.lg,
                        },
                        circular && { width: previewHeight, borderStyle: 'solid' },
                    ]}
                    onPress={pickImage}
                    activeOpacity={press.subtle}
                    accessibilityRole="button"
                    accessibilityLabel={placeholder}
                >
                    <Camera size={circular ? 30 : layout.icon.xl} color={circular ? theme.accent : theme.textMuted} />
                    <Text
                        style={[
                            type.body,
                            { color: circular ? theme.text : theme.textMuted, textAlign: 'center' },
                        ]}
                    >
                        {placeholder}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    inSection: { marginBottom: 0 },
    label: {
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    avatarOuter: {
        position: 'relative',
        alignItems: 'center',
    },
    rectOuter: {
        position: 'relative',
    },
    previewContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 24, // Por encima del botón de texto inferior
        right: -4,
        width: 38,
        height: 38,
        borderRadius: radius.pill,
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    removeBadgeCircular: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 34,
        height: 34,
        borderRadius: radius.pill,
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    removeTextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    changeBtn: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        minHeight: layout.minTouch - 8,
        borderRadius: radius.md,
        gap: spacing.xs,
        justifyContent: 'center',
    },
    removeBtn: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: layout.iconBox.sm,
        height: layout.iconBox.sm,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    placeholder: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
});