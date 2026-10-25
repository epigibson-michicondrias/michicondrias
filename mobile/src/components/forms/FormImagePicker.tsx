/**
 * FormImagePicker — selector de imágenes temático con vista previa.
 * Reemplaza la lógica duplicada de picker en mascotas/nuevo, adopciones/nuevo, etc.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInFormSection } from '@/src/components/forms/FormSection';
import { layout, radius, spacing, type, tint, press } from '@/constants/design';

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
                <Text style={[type.labelSentence, styles.label, { color: theme.textMuted, textAlign: circular ? 'center' : 'left' }]}>{label}</Text>
            ) : null}

            {imageUri ? (
                <View style={[
                    styles.previewContainer,
                    { height: previewHeight, borderRadius: circular ? previewHeight / 2 : radius.lg },
                ]}>
                    <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" transition={150} />
                    <TouchableOpacity
                        style={[
                            styles.changeBtn,
                            circular && styles.changeBtnCircular,
                            { backgroundColor: circular ? theme.overlay : theme.surface },
                        ]}
                        onPress={pickImage}
                        activeOpacity={press.normal}
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar foto"
                    >
                        <Camera size={layout.icon.sm} color={circular ? theme.onHero : theme.primary} />
                        {!circular && <Text style={[type.button, { color: theme.primary }]}>Cambiar</Text>}
                    </TouchableOpacity>
                    {onImageRemoved ? (
                        <TouchableOpacity
                            style={[styles.removeBtn, { backgroundColor: theme.error }]}
                            onPress={onImageRemoved}
                            activeOpacity={press.normal}
                            accessibilityRole="button"
                            accessibilityLabel="Quitar foto"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <X size={layout.icon.sm} color={theme.onPrimary} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.placeholder,
                        {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.inputBorder,
                            height: previewHeight,
                            borderRadius: circular ? previewHeight / 2 : radius.lg,
                        },
                        circular && { width: previewHeight },
                    ]}
                    onPress={pickImage}
                    activeOpacity={press.subtle}
                    accessibilityRole="button"
                    accessibilityLabel={placeholder}
                >
                    <Camera size={layout.icon.xl} color={theme.textMuted} />
                    <Text style={[type.body, { color: theme.textMuted, textAlign: 'center' }]}>
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
    previewContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    preview: {
        width: '100%',
        height: '100%',
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
    changeBtnCircular: {
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 0,
        paddingVertical: spacing.sm,
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
    },
    placeholder: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
});
