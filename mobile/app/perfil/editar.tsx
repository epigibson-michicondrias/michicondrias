import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, UserRound } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useProfile, BIO_MAX } from '@/src/hooks/perfil/useProfile';
import { useAvatar } from '@/src/hooks/perfil/useAvatar';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { spacing, radius, type, layout } from '@/constants/design';

/** Datos personales: foto, nombre, teléfono, ubicación y bio. El resto de la cuenta está en la pestaña Perfil. */
export default function EditarPerfilScreen() {
    const { theme } = useTheme();
    const { profile, isLoading, formData, errors, updateField, handleSave, isSaving } = useProfile();
    const { avatarUrl, uploading, pickAndUpload } = useAvatar();

    return (
        <ScreenContainer>
            <ScreenHeader title="Datos personales" />
            {isLoading && !profile ? (
                <View style={styles.content}>
                    <Skeleton width={96} height={96} borderRadius={48} style={styles.center} />
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={layout.inputHeight} borderRadius={radius.md} />)}
                </View>
            ) : (
                <KeyboardScreen contentContainerStyle={styles.content}>
                    <View style={styles.avatarBlock}>
                        <View style={[styles.avatar, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}>
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} accessibilityLabel="Tu foto de perfil" />
                            ) : (
                                <UserRound size={layout.icon.xl} color={theme.accent} />
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.photoButton, { borderColor: theme.border }]}
                            onPress={pickAndUpload}
                            disabled={uploading}
                            accessibilityRole="button"
                            accessibilityLabel="Cambiar foto de perfil"
                        >
                            {uploading ? <ActivityIndicator size="small" color={theme.primary} /> : <Camera size={layout.icon.sm} color={theme.primary} />}
                            <Text style={[type.bodyStrong, { color: theme.primary }]}>{uploading ? 'Subiendo…' : 'Cambiar foto'}</Text>
                        </TouchableOpacity>
                    </View>

                    <FormField
                        label="Nombre completo"
                        value={formData.full_name}
                        onChangeText={(v) => updateField('full_name', v)}
                        placeholder="Tu nombre completo"
                        autoComplete="name"
                        textContentType="name"
                        returnKeyType="next"
                        error={errors.full_name}
                    />
                    <FormField
                        label="Correo electrónico"
                        value={formData.email}
                        onChangeText={() => {}}
                        editable={false}
                        hint="Es tu acceso a la cuenta; no se puede cambiar desde la app."
                    />
                    <FormField
                        label="Teléfono (opcional)"
                        value={formData.phone}
                        onChangeText={(v) => updateField('phone', v)}
                        placeholder="Ej. +52 55 1234 5678"
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        textContentType="telephoneNumber"
                        maxLength={30}
                        error={errors.phone}
                    />
                    <FormField
                        label="Ubicación (opcional)"
                        value={formData.location}
                        onChangeText={(v) => updateField('location', v)}
                        placeholder="Ciudad, estado"
                        maxLength={120}
                    />
                    <FormField
                        label="Sobre mí (opcional)"
                        value={formData.bio}
                        onChangeText={(v) => updateField('bio', v)}
                        placeholder="Cuéntanos un poco sobre ti y tus mascotas"
                        multiline
                        numberOfLines={4}
                        maxLength={BIO_MAX}
                        error={errors.bio}
                        hint={`${formData.bio.length}/${BIO_MAX}`}
                    />

                    {profile?.created_at ? (
                        <Text style={[type.caption, styles.center, { color: theme.textMuted }]}>
                            Miembro desde {new Date(profile.created_at).getFullYear()}
                        </Text>
                    ) : null}

                    <Button label="Guardar cambios" onPress={handleSave} loading={isSaving} size="lg" fullWidth style={styles.save} />
                </KeyboardScreen>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: layout.screenPadding,
        paddingBottom: spacing.huge,
        gap: spacing.lg,
    },
    center: {
        alignSelf: 'center',
        textAlign: 'center',
    },
    avatarBlock: {
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: radius.pill,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: layout.minTouch,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    save: {
        marginTop: spacing.sm,
    },
});
