import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useProfile } from '@/src/hooks/perfil';
import { BIO_MAX } from '@/src/hooks/perfil/useProfile';
import { useAvatar } from '@/src/hooks/perfil/useAvatar';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '../../src/components/KeyboardScreen';
import { Mail, Phone, MapPin, FileText, Trash2, Edit2, Camera, ShieldCheck, Settings, LogOut, Heart, ShoppingBag, Stethoscope, User as UserIcon, ChevronLeft, Palette, CreditCard, Lock } from 'lucide-react-native';

export default function PerfilScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        profile,
        isLoading,
        isError,
        refetch,
        formData,
        isEditing,
        isSaving,
        handleSave,
        handleCancel,
        handleLogout,
        toggleEditing,
        updateField,
        getRoleLabel,
        handleOpenBillingPortal,
        isOpeningBillingPortal,
    } = useProfile();
    const { avatarUrl, uploading: avatarUploading, pickAndUpload: changeAvatar } = useAvatar();

    const getRoleIconComponent = (role: string) => {
        switch (role) {
            case 'veterinario':
                return <Stethoscope size={16} color={theme.primary} />;
            case 'admin':
                return <ShieldCheck size={16} color={theme.primary} />;
            default:
                return <UserIcon size={16} color={theme.primary} />;
        }
    };

    if (isError && !profile) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Mi Perfil" />
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textMuted, textAlign: 'center', marginBottom: 16 }]}>
                        No pudimos cargar tu perfil. Revisa tu conexión.
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={{ backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
                        accessibilityRole="button"
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    if (isLoading) {
        return (
            <ScreenContainer>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Cargando perfil...
                    </Text>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <KeyboardScreen style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Mi Perfil"
                rightElement={
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={toggleEditing}
                        accessibilityRole="button"
                        accessibilityLabel={isEditing ? 'Cerrar edición' : 'Editar perfil'}
                    >
                        <Edit2 size={20} color={theme.primary} />
                    </TouchableOpacity>
                }
            />

            {/* Profile Header */}
            <View style={[styles.profileHeader, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20', borderColor: theme.border }]}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} accessibilityLabel="Tu foto de perfil" />
                        ) : (
                            <UserIcon size={40} color={theme.primary} />
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.cameraButton, { backgroundColor: theme.primary }]}
                        onPress={changeAvatar}
                        disabled={avatarUploading}
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar foto de perfil"
                    >
                        {avatarUploading ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={16} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>
                        {profile?.full_name || 'Usuario'}
                    </Text>
                    <View style={styles.roleRow}>
                        {getRoleIconComponent(profile?.role_name || 'consumidor')}
                        <Text style={[styles.role, { color: theme.primary }]}>
                            {getRoleLabel(profile?.role_name || 'consumidor')}
                        </Text>
                    </View>
                    {profile?.created_at ? (
                        <Text style={[styles.memberSince, { color: theme.textMuted }]}>
                            Miembro desde {new Date(profile.created_at).getFullYear()}
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Edit Form */}
            {isEditing && (
                <View style={[styles.editCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                        Editar Información
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                            Nombre Completo
                        </Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text 
                            }]}
                            value={formData.full_name}
                            onChangeText={(text) => updateField('full_name', text)}
                            placeholder="Tu nombre completo"
                            placeholderTextColor={theme.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                            Correo Electrónico
                        </Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text 
                            }]}
                            value={formData.email}
                            onChangeText={(text) => updateField('email', text)}
                            placeholder="tu@email.com"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="email-address"
                            editable={false} // El correo es tu identidad de acceso y no se edita aquí
                        />
                        <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 6, marginBottom: 0 }]}>
                            El correo no se puede cambiar desde la app.
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Teléfono (opcional)</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                            value={formData.phone}
                            onChangeText={(text) => updateField('phone', text)}
                            placeholder="Ej. +52 55 1234 5678"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="phone-pad"
                            maxLength={30}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Ubicación (opcional)</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                            value={formData.location}
                            onChangeText={(text) => updateField('location', text)}
                            placeholder="Ciudad, estado"
                            placeholderTextColor={theme.textMuted}
                            maxLength={120}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Sobre mí (opcional)</Text>
                        <TextInput
                            style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, minHeight: 90, textAlignVertical: 'top' }]}
                            value={formData.bio}
                            onChangeText={(text) => updateField('bio', text)}
                            placeholder="Cuéntanos un poco sobre ti y tus mascotas"
                            placeholderTextColor={theme.textMuted}
                            multiline
                            maxLength={BIO_MAX}
                        />
                        <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 6, marginBottom: 0 }]}>
                            {formData.bio.length}/{BIO_MAX}
                        </Text>
                    </View>

                    <View style={styles.editActions}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={handleCancel}
                        >
                            <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            <Text style={styles.saveButtonText}>
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Contact Information */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Información de Contacto
                </Text>
                
                <View style={styles.infoRow}>
                    <Mail size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                            Correo Electrónico
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            {profile?.email || 'No especificado'}
                        </Text>
                    </View>
                </View>

                {profile?.phone ? (
                    <View style={styles.infoRow}>
                        <Phone size={20} color={theme.primary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Teléfono</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{profile.phone}</Text>
                        </View>
                    </View>
                ) : null}

                {profile?.location ? (
                    <View style={styles.infoRow}>
                        <MapPin size={20} color={theme.primary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Ubicación</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{profile.location}</Text>
                        </View>
                    </View>
                ) : null}

                {profile?.bio ? (
                    <View style={styles.infoRow}>
                        <FileText size={20} color={theme.primary} />
                        <View style={styles.infoContent}>
                            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Sobre mí</Text>
                            <Text style={[styles.infoValue, { color: theme.text }]}>{profile.bio}</Text>
                        </View>
                    </View>
                ) : null}
            </View>

            {/* Quick Actions */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Acciones Rápidas
                </Text>
                
                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={() => router.push('/perfil/kyc' as any)}
                >
                    <ShieldCheck size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Verificación de Identidad (KYC)
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Verifica tu cuenta para más beneficios y seguridad
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={() => router.push('/mascotas' as any)}
                >
                    <Heart size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Mis Mascotas
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Gestiona la información de tus mascotas
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={() => router.push('/tienda/compras' as any)}
                >
                    <ShoppingBag size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Historial de Compras
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Revisa tus compras anteriores
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
            </View>

            {/* Account Settings */}
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Configuración de Cuenta
                </Text>
                
                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={() => router.push('/menu' as any)}
                >
                    <Settings size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Configuración
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Preferencias y ajustes de la app
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={() => router.push('/perfil/paleta')}
                >
                    <Palette size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Paleta de Colores
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Cambia la apariencia de la app
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={() => router.push('/perfil/seguridad-2fa' as any)}
                >
                    <Lock size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Seguridad (2FA)
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Protege tu cuenta con autenticación de dos factores
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionRow, { borderBottomColor: theme.borderLight }]}
                    onPress={handleOpenBillingPortal}
                    disabled={isOpeningBillingPortal}
                >
                    <CreditCard size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            {isOpeningBillingPortal ? 'Abriendo...' : 'Facturación y Suscripciones'}
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Administra tus pagos y suscripciones
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logoutRow, { backgroundColor: '#ef444410' }]}
                    onPress={handleLogout}
                    accessibilityRole="button"
                    accessibilityLabel="Cerrar sesión"
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text style={[styles.logoutText, { color: '#ef4444' }]}>
                        Cerrar Sesión
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Eliminar cuenta (requisito de las tiendas de apps) */}
            <TouchableOpacity
                style={styles.deleteAccountRow}
                onPress={() => router.push('/perfil/eliminar-cuenta' as any)}
                accessibilityRole="button"
                accessibilityLabel="Eliminar mi cuenta"
            >
                <Trash2 size={18} color={theme.error} />
                <Text style={[styles.deleteAccountText, { color: theme.error }]}>Eliminar mi cuenta</Text>
            </TouchableOpacity>
        </KeyboardScreen>
    );
}

const styles = StyleSheet.create({
    deleteAccountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 24,
        marginTop: 4,
        marginBottom: 40,
        paddingVertical: 14,
    },
    deleteAccountText: {
        fontSize: 14,
        fontWeight: '700',
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    editButton: {
        padding: 8,
    },
    profileHeader: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    role: {
        fontSize: 14,
        fontWeight: '600',
    },
    memberSince: {
        fontSize: 14,
    },
    editCard: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    card: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 14,
    },
    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    bioText: {
        fontSize: 16,
        lineHeight: 24,
    },
});
