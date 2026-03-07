import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../src/lib/api';
import { getCurrentUser } from '../../src/lib/auth';
import { useColorScheme } from '@/components/useColorScheme';
import { ShieldCheck, ShoppingBag, Users, Home, ArrowRight, CheckCircle } from 'lucide-react-native';

export default function PartnerOnboardingScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? {
        background: '#000',
        text: '#fff',
        textMuted: '#999',
        surface: '#111',
        border: '#333',
        primary: '#7c3aed',
    } : {
        background: '#fff',
        text: '#000',
        textMuted: '#666',
        surface: '#f9f9f9',
        border: '#e5e5e5',
        primary: '#7c3aed',
    };
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const roles = [
        { 
            id: "veterinario", 
            icon: "🩺", 
            title: "Clínica o Veterinario", 
            desc: "Ofrece atención médica, registra historiales y atiende emergencias.",
            benefits: ["🏥 Gestión de pacientes", "📅 Sistema de citas", "💳 Pagos en línea", "⭐ Reseñas verified"]
        },
        { 
            id: "vendedor", 
            icon: "🛒", 
            title: "Marca o Vendedor", 
            desc: "Vende alimentos, accesorios o medicinas en nuestra Tienda Global.",
            benefits: ["🛍️ Tienda online", "📦 Gestión de inventario", "💰 Pagos seguros", "📊 Análisis de ventas"]
        },
        { 
            id: "paseador", 
            icon: "🦮", 
            title: "Paseador o Pet Sitter", 
            desc: "Ofrece tus servicios de compañía y paseo para dueños ocupados.",
            benefits: ["🚶 Calendario flexible", "📍 GPS tracking", "💳 Cobros automáticos", "⭐ Sistema de rating"]
        },
        { 
            id: "refugio", 
            icon: "🏠", 
            title: "Refugio Organizacional", 
            desc: "Administra decenas de adopciones y recibe donaciones corporativas.",
            benefits: ["🐾 Gestión de adopciones", "💳 Donaciones", "📋 Perfiles verified", "🏆 Badge de confianza"]
        }
    ];

    async function handleUpgrade() {
        if (!selectedRole) {
            Alert.alert("Selecciona un rol", "Por favor selecciona el tipo de cuenta profesional que deseas.");
            return;
        }

        setLoading(true);
        try {
            await apiFetch("core", `/users/me/upgrade-role?role_name=${selectedRole}`, {
                method: "POST"
            });

            // Actualizar el rol del usuario
            const user = await getCurrentUser();
            if (user) {
                // Forzar refresh del contexto de autenticación
                Alert.alert(
                    "¡Rol Actualizado!", 
                    `Tu cuenta ha sido actualizada a ${roles.find(r => r.id === selectedRole)?.title}. Redirigiendo...`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Redirigir al dashboard principal
                                router.replace('/(tabs)');
                            }
                        }
                    ]
                );
            }
        } catch (error: any) {
            console.error("Error upgrading role:", error);
            Alert.alert(
                "Error al actualizar rol", 
                error.message || "No pudimos actualizar tu rol. Por favor intenta más tarde."
            );
        } finally {
            setLoading(false);
        }
    }

    const renderRoleCard = (role: typeof roles[0]) => (
        <TouchableOpacity
            key={role.id}
            style={[
                styles.roleCard, 
                { 
                    backgroundColor: theme.surface,
                    borderColor: selectedRole === role.id ? theme.primary : theme.border,
                    borderWidth: 2
                }
            ]}
            onPress={() => setSelectedRole(role.id)}
        >
            <View style={styles.roleHeader}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <View style={styles.roleTitleContainer}>
                    <Text style={[styles.roleTitle, { color: theme.text }]}>{role.title}</Text>
                    {selectedRole === role.id && (
                        <View style={styles.selectedBadge}>
                            <CheckCircle size={16} color={theme.primary} />
                            <Text style={[styles.selectedText, { color: theme.primary }]}>Seleccionado</Text>
                        </View>
                    )}
                </View>
            </View>
            
            <Text style={[styles.roleDesc, { color: theme.textMuted }]}>{role.desc}</Text>
            
            <View style={styles.benefitsContainer}>
                <Text style={[styles.benefitsTitle, { color: theme.text }]}>Beneficios:</Text>
                {role.benefits.map((benefit, index) => (
                    <Text key={index} style={[styles.benefitItem, { color: theme.textMuted }]}>
                        {benefit}
                    </Text>
                ))}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🚀 Conviértete en Partner</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Desbloquea herramientas profesionales y genera ingresos con Michicondrias
                </Text>
            </View>

            <View style={styles.rolesContainer}>
                {roles.map(renderRoleCard)}
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[
                        styles.upgradeButton, 
                        { 
                            backgroundColor: selectedRole ? theme.primary : theme.surface,
                            borderColor: theme.border,
                            borderWidth: 1
                        }
                    ]}
                    onPress={handleUpgrade}
                    disabled={!selectedRole || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={[
                                styles.upgradeButtonText, 
                                { color: selectedRole ? '#fff' : theme.textMuted }
                            ]}>
                                {selectedRole ? `Convertirme en ${roles.find(r => r.id === selectedRole)?.title}` : "Selecciona un rol"}
                            </Text>
                            {selectedRole && <ArrowRight size={20} color="#fff" />}
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.cancelButtonText, { color: theme.textMuted }]}>
                        Cancelar
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoContainer}>
                <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                    <ShieldCheck size={24} color={theme.primary} />
                    <View style={styles.infoContent}>
                        <Text style={[styles.infoTitle, { color: theme.text }]}>¿Por qué ser Partner?</Text>
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Únete a miles de profesionales que ya confían en Michicondrias para hacer crecer su negocio y llegar a más clientes.
                        </Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    rolesContainer: {
        padding: 24,
        gap: 16,
    },
    roleCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
    },
    roleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 16,
    },
    roleIcon: {
        fontSize: 32,
    },
    roleTitleContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    selectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    selectedText: {
        fontSize: 12,
        fontWeight: '600',
    },
    roleDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    benefitsContainer: {
        gap: 8,
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    benefitItem: {
        fontSize: 13,
        lineHeight: 18,
    },
    actionContainer: {
        padding: 24,
        gap: 12,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    upgradeButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoContainer: {
        padding: 24,
        paddingTop: 0,
    },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
