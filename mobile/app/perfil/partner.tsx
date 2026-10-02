import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { apiFetch, setToken, clearApiCache } from '../../src/lib/api';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/contexts/AuthContext';
import { getCurrentUser } from '../../src/lib/auth';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ShieldCheck, ShoppingBag, Users, Home, ArrowRight, CheckCircle } from 'lucide-react-native';

export default function PartnerOnboardingScreen() {
    const router = useRouter();
    const { reloadUser } = useAuth();
    const queryClient = useQueryClient();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const roles = [
        { id: "veterinario", icon: "🩺", title: "Veterinario", desc: "Atiende pacientes, agenda citas y emite recetas.", benefits: ["🏥 Gestión de pacientes", "📅 Sistema de citas", "🎥 Videoconsultas"] },
        { id: "hospital", icon: "🏥", title: "Clínica u Hospital", desc: "Administra sedes, médicos asociados y agenda.", benefits: ["🏢 Sucursales", "👩‍⚕️ Médicos asociados", "📦 Inventario"] },
        { id: "vendedor", icon: "🛒", title: "Marca o Vendedor", desc: "Vende alimentos, accesorios o medicinas en la Michi-Shop.", benefits: ["🛍️ Tienda online", "📦 Pedidos", "📊 Análisis de ventas"] },
        { id: "paseador", icon: "🦮", title: "Paseador", desc: "Ofrece paseos para dueños ocupados.", benefits: ["🚶 Calendario flexible", "📍 Solicitudes", "⭐ Reseñas"] },
        { id: "cuidador", icon: "🏡", title: "Cuidador / Pensión", desc: "Hospeda y cuida mascotas en tu hogar.", benefits: ["🛏️ Hospedaje", "📅 Calendario", "⭐ Reseñas"] },
        { id: "refugio", icon: "🏠", title: "Refugio", desc: "Gestiona adopciones y recibe donaciones.", benefits: ["🐾 Adopciones", "💳 Donaciones", "🏆 Insignia de confianza"] },
        { id: "hogar_temporal", icon: "💛", title: "Hogar temporal", desc: "Cuida mascotas rescatadas mientras encuentran familia.", benefits: ["🐾 Publicaciones", "📋 Solicitudes"] },
        { id: "aseguradora", icon: "🛡️", title: "Aseguradora", desc: "Publica planes y gestiona reclamos.", benefits: ["📄 Planes", "🧾 Reclamos"] },
        { id: "laboratorio", icon: "🧪", title: "Laboratorio", desc: "Recibe órdenes y entrega resultados.", benefits: ["🧫 Órdenes", "📑 Resultados"] },
        { id: "funeraria", icon: "🕊️", title: "Funeraria", desc: "Servicios de despedida y memoriales.", benefits: ["⚱️ Paquetes", "🕯️ Memoriales"] },
        { id: "entrenador", icon: "🎓", title: "Entrenador", desc: "Ofrece programas de adiestramiento.", benefits: ["📚 Programas", "👥 Alumnos"] },
        { id: "estilista", icon: "✂️", title: "Estilista", desc: "Agenda citas de estética y grooming.", benefits: ["📅 Agenda", "💈 Servicios"] },
        { id: "patrocinador", icon: "🏅", title: "Patrocinador", desc: "Crea campañas y apoya alertas de mascotas perdidas.", benefits: ["📣 Campañas", "📊 Estadísticas"] },
        { id: "transportista", icon: "🚗", title: "Transportista", desc: "Transporta mascotas con seguimiento del viaje.", benefits: ["🧭 Viajes", "📍 Tracking"] },
        { id: "establecimiento", icon: "☕", title: "Establecimiento pet-friendly", desc: "Registra tu local y atrae clientes con mascotas.", benefits: ["📍 Perfil del local", "🎟️ Cupones"] },
    ];

    async function handleUpgrade() {
        if (!selectedRole) {
            showAlert({ type: 'warning', title: 'Selecciona un rol', message: 'Por favor selecciona el tipo de cuenta profesional que deseas.' });
            return;
        }

        setLoading(true);
        try {
            // Un rol profesional requiere identidad aprobada por un administrador
            clearApiCache();
            const me: any = await getCurrentUser();
            if (me?.verification_status !== 'VERIFIED') {
                showAlert({
                    type: 'info',
                    title: 'Verifica tu identidad',
                    message: me?.verification_status === 'PENDING'
                        ? 'Tus documentos están en revisión. Cuando un administrador los apruebe podrás elegir tu cuenta profesional.'
                        : 'Para tener una cuenta profesional primero debes verificar tu identidad. Un administrador revisará tus documentos.',
                    showCancel: true,
                    cancelText: 'Después',
                    buttonText: 'Ir a verificación',
                    onButtonPress: () => router.push('/perfil/verificacion' as any),
                });
                return;
            }

            // El JWT lleva el rol: el backend devuelve un token nuevo para que las herramientas funcionen sin volver a entrar.
            const res: any = await apiFetch("core", `/users/me/upgrade-role?role_name=${selectedRole}`, {
                method: "POST"
            });
            if (res?.access_token) {
                await setToken(res.access_token);
                try { await SecureStore.setItemAsync('user_role', selectedRole); } catch { /* web */ }
            }
            clearApiCache();
            await reloadUser();
            queryClient.invalidateQueries();
            showAlert({
                type: 'success',
                title: '¡Cuenta profesional activada!',
                message: `Ahora eres ${roles.find(r => r.id === selectedRole)?.title}. Encontrarás tus herramientas en Inicio y en la pestaña Herramientas.`,
                onButtonPress: () => router.replace('/(tabs)'),
            });
        } catch (error: any) {
            console.error("Error upgrading role:", error);
            showAlert({
                type: 'error',
                title: 'Error al actualizar rol',
                message: error.message || 'No pudimos actualizar tu rol. Por favor intenta más tarde.',
            });
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
        <ScreenContainer>
            <ScreenHeader
                title="🚀 Conviértete en Partner"
                subtitle="Desbloquea herramientas profesionales y genera ingresos con Michicondrias"
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
