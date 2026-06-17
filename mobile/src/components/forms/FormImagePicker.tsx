/**
 * FormImagePicker — Themed image picker with preview
 * Replaces duplicated image picker logic across mascotas/nuevo, adopciones/nuevo, etc.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface FormImagePickerProps {
    label?: string;
    imageUri: string | null;
    onImageSelected: (uri: string) => void;
    onImageRemoved?: () => void;
    /** Aspect ratio for the picker */
    aspect?: [number, number];
    /** Height of the preview area */
    previewHeight?: number;
    /** Placeholder text */
    placeholder?: string;
    /** Render as a circular avatar picker */
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
        <View style={[styles.container, circular && { alignSelf: 'center' }]}>
            {label ? (
                <Text style={[styles.label, { color: theme.textMuted, textAlign: circular ? 'center' : 'left' }]}>{label}</Text>
            ) : null}

            {imageUri ? (
                <View style={[
                    styles.previewContainer, 
                    { height: previewHeight },
                    circular && { width: previewHeight, borderRadius: previewHeight / 2 }
                ]}>
                    <Image source={{ uri: imageUri }} style={styles.preview} />
                    <TouchableOpacity
                        style={[
                            styles.changeBtn, 
                            { backgroundColor: theme.surface },
                            circular && { 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                right: 0, 
                                borderRadius: 0, 
                                paddingVertical: 6,
                                justifyContent: 'center',
                                backgroundColor: 'rgba(0,0,0,0.4)',
                            }
                        ]}
                        onPress={pickImage}
                    >
                        <Camera size={14} color={circular ? '#fff' : theme.primary} />
                        {!circular && <Text style={[styles.changeBtnText, { color: theme.primary }]}>Cambiar</Text>}
                    </TouchableOpacity>
                    {onImageRemoved ? (
                        <TouchableOpacity
                            style={[
                                styles.removeBtn, 
                                { backgroundColor: 'rgba(239,68,68,0.9)' },
                                circular && { top: 0, right: 0, width: 28, height: 28, borderRadius: 14 }
                            ]}
                            onPress={onImageRemoved}
                        >
                            <X size={14} color="#fff" />
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
                        },
                        circular && { width: previewHeight, borderRadius: previewHeight / 2 }
                    ]}
                    onPress={pickImage}
                    activeOpacity={0.7}
                >
                    <Camera size={28} color={theme.textMuted} />
                    <Text style={[styles.placeholderText, { color: theme.textMuted, fontSize: 12, textAlign: 'center' }]}>
                        {placeholder}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    previewContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    changeBtn: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    changeBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    removeBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    placeholderText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
