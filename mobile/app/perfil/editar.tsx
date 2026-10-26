import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { AlertTriangle, Camera, Check, UserRound, X } from 'lucide-react-native';
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
import { useRouter } from 'expo-router';

/** Datos personales: foto, nombre, teléfono, ubicación y bio. El resto de la cuenta está en la pestaña Perfil. */
export default function EditarPerfilScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { profile, isLoading, formData, errors, updateField, handleSave, isSaving } = useProfile();
    const { avatarUrl, uploading, pickAndUpload } = useAvatar();

    const errorList = Object.entries(errors).filter(([, v]) => !!v);

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
                    {/* Resumen de errores */}
                    {errorList.length > 0 && (
                        <View style={[styles.errorSummary, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
                            <AlertTriangle size={18} color={theme.error} />
                            <View style={styles.flex}>
                                <Text style={[type.bodyStrong, { color: theme.error }]}>
                                    Corrige {errorList.length} {errorList.length === 1 ? 'campo' : 'campos'}
                                </Text>
                                {errorList.map(([field, msg]) => (
                                    <Text key={field} style={[type.caption, { color: theme.error }]}>• {msg}</Text>
                                ))}
                            </View>
                        </View>
                    )}

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

                    {/* Acciones */}
                    <View style={styles.actions}>
                        <Button
                            label="Cancelar"
                            variant="ghost"
                            onPress={() => router.back()}
                            disabled={isSaving}
                            style={styles.cancelBtn}
                        />
                        <Button
                            label={isSaving ? 'Guardando…' : 'Guardar cambios'}
                            onPress={handleSave}
                            loading={isSaving}
                            icon={<Check size={18} />}
                            style={styles.save}
                        />
                    </View>
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
        justifyContent: 'center',
    },
    save: {
        flex: 1,
    },
    cancelBtn: {
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    errorSummary: {
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    flex: {
        flex: 1,
        gap: spacing.xxs,
    },
});
