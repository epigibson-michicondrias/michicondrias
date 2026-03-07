import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logout, type User } from '@/src/lib/auth';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Edit2, Camera, ShieldCheck, Settings, LogOut, Heart, ShoppingBag, Stethoscope, User as UserIcon } from 'lucide-react-native';

export default function PerfilScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        bio: ''
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: getCurrentUser,
    });

    React.useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: '', // No está en la interfaz User
                location: '', // No está en la interfaz User
                bio: '' // No está en la interfaz User
            });
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<User>) => {
            // Por ahora simulamos la actualización
            return Promise.resolve(data as User);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
            Alert.alert("Éxito", "Tu perfil ha sido actualizado");
        },
        onError: () => {
            Alert.alert("Error", "No se pudo actualizar el perfil");
        }
    });

    const handleSave = () => {
        if (!formData.full_name.trim()) {
            Alert.alert("Error", "El nombre es requerido");
            return;
        }

        updateMutation.mutate(formData);
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que deseas cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Cerrar Sesión", 
                    style: "destructive",
                    onPress: signOut
                }
            ]
        );
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'veterinario':
                return <Stethoscope size={16} color={theme.primary} />;
            case 'admin':
                return <ShieldCheck size={16} color={theme.primary} />;
            default:
                return <UserIcon size={16} color={theme.primary} />;
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'veterinario':
                return 'Veterinario';
            case 'admin':
                return 'Administrador';
            default:
                return 'Usuario';
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Cargando perfil...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>
                    Mi Perfil
                </Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(!isEditing)}
                >
                    <Edit2 size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Profile Header */}
            <View style={[styles.profileHeader, { backgroundColor: theme.surface }]}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                        {profile?.id_front_url ? (
                            <Image source={{ uri: profile.id_front_url }} style={styles.avatarImage} />
                        ) : (
                            <UserIcon size={40} color={theme.primary} />
                        )}
                    </View>
                    <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.primary }]}>
                        <Camera size={16} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                    <Text style={[styles.name, { color: theme.text }]}>
                        {profile?.full_name || 'Usuario'}
                    </Text>
                    <View style={styles.roleRow}>
                        {getRoleIcon(profile?.role_name || 'consumidor')}
                        <Text style={[styles.role, { color: theme.primary }]}>
                            {getRoleLabel(profile?.role_name || 'consumidor')}
                        </Text>
                    </View>
                    <Text style={[styles.memberSince, { color: theme.textMuted }]}>
                        Miembro desde {new Date(profile?.created_at || Date.now()).getFullYear()}
                    </Text>
                </View>
            </View>

            {/* Edit Form */}
            {isEditing && (
                <View style={[styles.editCard, { backgroundColor: theme.surface }]}>
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
                            onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
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
                            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            placeholder="tu@email.com"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="email-address"
                            editable={false} // Email no debería ser editable
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                            Teléfono
                        </Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text 
                            }]}
                            value={formData.phone}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                            placeholder="+52 1 000 000 0000"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                            Ubicación
                        </Text>
                        <TextInput
                            style={[styles.textInput, { 
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text 
                            }]}
                            value={formData.location}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                            placeholder="Ciudad, País"
                            placeholderTextColor={theme.textMuted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                            Biografía
                        </Text>
                        <TextInput
                            style={[styles.textArea, { 
                                backgroundColor: theme.background,
                                borderColor: theme.border,
                                color: theme.text 
                            }]}
                            value={formData.bio}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                            placeholder="Cuéntanos sobre ti y tus mascotas..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.editActions}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => {
                                setIsEditing(false);
                                // Reset form data
                                if (profile) {
                                    setFormData({
                                        full_name: profile.full_name || '',
                                        email: profile.email || '',
                                        phone: formData.phone || '',
                                        location: formData.location || '',
                                        bio: formData.bio || ''
                                    });
                                }
                            }}
                        >
                            <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: theme.primary }]}
                            onPress={handleSave}
                            disabled={updateMutation.isPending}
                        >
                            <Text style={styles.saveButtonText}>
                                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Contact Information */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
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

                <View style={styles.infoRow}>
                    <Phone size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                            Teléfono
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            No especificado
                        </Text>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <MapPin size={20} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                            Ubicación
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text }]}>
                            No especificado
                        </Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Acciones Rápidas
                </Text>
                
                <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => router.push('/perfil/verificacion' as any)}
                >
                    <ShieldCheck size={20} color={theme.primary} />
                    <View style={styles.actionContent}>
                        <Text style={[styles.actionTitle, { color: theme.text }]}>
                            Verificación de Identidad
                        </Text>
                        <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>
                            Verifica tu cuenta para más beneficios
                        </Text>
                    </View>
                    <ChevronLeft size={20} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionRow}
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
                    style={styles.actionRow}
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
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Configuración de Cuenta
                </Text>
                
                <TouchableOpacity
                    style={styles.actionRow}
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
                    style={[styles.logoutRow, { backgroundColor: '#ef444410' }]}
                    onPress={handleLogout}
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text style={[styles.logoutText, { color: '#ef4444' }]}>
                        Cerrar Sesión
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Bio Section - Temporarily hidden */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        gap: 16,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        flex: 1,
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderColor: 'rgba(255,255,255,0.1)',
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
        borderColor: 'rgba(255,255,255,0.05)',
    },
    card: {
        marginHorizontal: 24,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderBottomColor: 'rgba(255,255,255,0.05)',
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
