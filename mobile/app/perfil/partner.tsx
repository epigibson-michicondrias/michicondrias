import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { usePartnerUpgrade } from '@/src/hooks/perfil/usePartnerUpgrade';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { ShieldCheck, ArrowRight, CheckCircle, AlertCircle, Clock, Award, Building2, Car, Coffee, Dog, FlaskConical, Flower2, GraduationCap, Heart, HeartHandshake, Home, Scissors, Shield, ShoppingBag, Stethoscope } from 'lucide-react-native';
import { font, spacing, layout, radius, tint } from '@/constants/design';

export default function PartnerOnboardingScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const { upgrade, isUpgrading } = usePartnerUpgrade();

    // El estado de la identidad se muestra ANTES de elegir rol (F13): el backend exige KYC aprobado
    const verification = user?.verification_status || 'UNVERIFIED';
    const kycCard = {
        UNVERIFIED: { icon: ShieldCheck, color: theme.textMuted, title: 'Identidad sin verificar', desc: 'Primero verifica tu identidad para poder elegir una cuenta profesional.', action: 'Verificar' },
        PENDING: { icon: Clock, color: theme.warning, title: 'Identidad en revisión', desc: 'Cuando un administrador apruebe tus documentos podrás elegir tu cuenta profesional.', action: 'Ver estado' },
        VERIFIED: { icon: CheckCircle, color: theme.success, title: 'Identidad verificada', desc: 'Ya puedes elegir el tipo de cuenta profesional que quieres activar.', action: null },
        REJECTED: { icon: AlertCircle, color: theme.error, title: 'Identidad rechazada', desc: 'Vuelve a subir tus documentos para poder continuar.', action: 'Reintentar' },
    }[verification as 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'];
    const KycIcon = kycCard.icon;

    const roles = [
        { id: "veterinario", icon: Stethoscope, title: "Veterinario", desc: "Atiende pacientes, agenda citas y emite recetas.", benefits: ["Gestión de pacientes", "Sistema de citas", "Videoconsultas"] },
        { id: "hospital", icon: Building2, title: "Clínica u Hospital", desc: "Administra sedes, médicos asociados y agenda.", benefits: ["Sucursales", "Médicos asociados", "Inventario"] },
        { id: "vendedor", icon: ShoppingBag, title: "Marca o Vendedor", desc: "Vende alimentos, accesorios o medicinas en la Michi-Shop.", benefits: ["Tienda online", "Pedidos", "Análisis de ventas"] },
        { id: "paseador", icon: Dog, title: "Paseador", desc: "Ofrece paseos para dueños ocupados.", benefits: ["Calendario flexible", "Solicitudes", "Reseñas"] },
        { id: "cuidador", icon: Home, title: "Cuidador / Pensión", desc: "Hospeda y cuida mascotas en tu hogar.", benefits: ["Hospedaje", "Calendario", "Reseñas"] },
        { id: "refugio", icon: HeartHandshake, title: "Refugio", desc: "Gestiona adopciones y recibe donaciones.", benefits: ["Adopciones", "Donaciones", "Insignia de confianza"] },
        { id: "hogar_temporal", icon: Heart, title: "Hogar temporal", desc: "Cuida mascotas rescatadas mientras encuentran familia.", benefits: ["Publicaciones", "Solicitudes"] },
        { id: "aseguradora", icon: Shield, title: "Aseguradora", desc: "Publica planes y gestiona reclamos.", benefits: ["Planes", "Reclamos"] },
        { id: "laboratorio", icon: FlaskConical, title: "Laboratorio", desc: "Recibe órdenes y entrega resultados.", benefits: ["Órdenes", "Resultados"] },
        { id: "funeraria", icon: Flower2, title: "Funeraria", desc: "Servicios de despedida y memoriales.", benefits: ["Paquetes", "Memoriales"] },
        { id: "entrenador", icon: GraduationCap, title: "Entrenador", desc: "Ofrece programas de adiestramiento.", benefits: ["Programas", "Alumnos"] },
        { id: "estilista", icon: Scissors, title: "Estilista", desc: "Agenda citas de estética y grooming.", benefits: ["Agenda", "Servicios"] },
        { id: "patrocinador", icon: Award, title: "Patrocinador", desc: "Crea campañas y apoya alertas de mascotas perdidas.", benefits: ["Campañas", "Estadísticas"] },
        { id: "transportista", icon: Car, title: "Transportista", desc: "Transporta mascotas con seguimiento del viaje.", benefits: ["Viajes", "Tracking"] },
        { id: "establecimiento", icon: Coffee, title: "Establecimiento pet-friendly", desc: "Registra tu local y atrae clientes con mascotas.", benefits: ["Perfil del local", "Cupones"] },
    ];

    function handleUpgrade() {
        // El botón viene disabled sin rol seleccionado; este return solo satisface al type-checker.
        if (!selectedRole) return;
        const roleTitle = roles.find(r => r.id === selectedRole)?.title;
        upgrade(selectedRole, {
            onSuccess: (result) => {
                if (!result.ok) {
                    // Sin identidad aprobada no se puede elegir rol profesional
                    showAlert({
                        type: 'info',
                        title: 'Verifica tu identidad',
                        message: result.verification === 'PENDING'
                            ? 'Tus documentos están en revisión. Cuando un administrador los apruebe podrás elegir tu cuenta profesional.'
                            : 'Para tener una cuenta profesional primero debes verificar tu identidad. Un administrador revisará tus documentos.',
                        showCancel: true,
                        cancelText: 'Después',
                        buttonText: 'Ir a verificación',
                        onButtonPress: () => router.push('/perfil/verificacion' as any),
                    });
                    return;
                }
                showAlert({
                    type: 'success',
                    title: '¡Cuenta profesional activada!',
                    message: `Ahora eres ${roleTitle}. Encontrarás tus herramientas en Inicio y en la pestaña Herramientas.`,
                    onButtonPress: () => router.replace('/(tabs)'),
                });
            },
            onError: (error) => {
                showAlert({
                    type: 'error',
                    title: 'Error al actualizar rol',
                    message: error.message || 'No pudimos actualizar tu rol. Por favor intenta más tarde.',
                });
            },
        });
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
                <View style={[styles.roleIconBox, { backgroundColor: theme.primary + tint.faint }]}>
                    <role.icon size={layout.icon.lg} color={theme.primary} />
                </View>
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
                title="Cuenta profesional"
                subtitle="Desbloquea herramientas profesionales y genera ingresos con Michicondrias"
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Estado de la identidad antes de elegir el rol */}
            <View style={[styles.kycCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.kycIconBox, { backgroundColor: kycCard.color + '20' }]}>
                    <KycIcon size={22} color={kycCard.color} />
                </View>
                <View style={styles.kycInfo}>
                    <Text style={[styles.kycTitle, { color: theme.text }]}>{kycCard.title}</Text>
                    <Text style={[styles.kycDesc, { color: theme.textMuted }]}>{kycCard.desc}</Text>
                </View>
                {kycCard.action && (
                    <TouchableOpacity onPress={() => router.push('/perfil/verificacion')} activeOpacity={0.7}>
                        <Text style={[styles.kycAction, { color: theme.primary }]}>{kycCard.action}</Text>
                    </TouchableOpacity>
                )}
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
                    disabled={!selectedRole || isUpgrading}
                >
                    {isUpgrading ? (
                        <ActivityIndicator color={theme.onPrimary} size="small" />
                    ) : (
                        <>
                            <Text style={[
                                styles.upgradeButtonText, 
                                { color: selectedRole ? theme.onPrimary : theme.textMuted }
                            ]}>
                                {selectedRole ? `Convertirme en ${roles.find(r => r.id === selectedRole)?.title}` : "Selecciona un rol"}
                            </Text>
                            {selectedRole && <ArrowRight size={20} color={theme.onPrimary} />}
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
        padding: spacing.xxl,
        gap: spacing.lg,
    },
    kycCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: layout.screenPadding,
        marginTop: spacing.lg,
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        gap: spacing.md,
    },
    kycIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kycInfo: {
        flex: 1,
    },
    kycTitle: {
        fontSize: font.base,
        fontWeight: '800',
        marginBottom: spacing.xxs,
    },
    kycDesc: {
        fontSize: font.md,
        lineHeight: 17,
    },
    kycAction: {
        fontSize: font.base,
        fontWeight: '800',
    },
    roleCard: {
        padding: spacing.xl,
        borderRadius: 16,
        borderWidth: 2,
    },
    roleHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        gap: spacing.lg,
    },
    roleIconBox: {
        width: layout.iconBox.lg,
        height: layout.iconBox.lg,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTitleContainer: {
        flex: 1,
    },
    roleTitle: {
        fontSize: font.xxl,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    selectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        alignSelf: 'flex-start',
    },
    selectedText: {
        fontSize: font.md,
        fontWeight: '600',
    },
    roleDesc: {
        fontSize: font.base,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    benefitsContainer: {
        gap: spacing.sm,
    },
    benefitsTitle: {
        fontSize: font.base,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    benefitItem: {
        fontSize: font.base,
        lineHeight: 18,
    },
    actionContainer: {
        padding: spacing.xxl,
        gap: spacing.md,
    },
    upgradeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: layout.screenPadding,
        borderRadius: 12,
        gap: spacing.sm,
    },
    upgradeButtonText: {
        fontSize: font.xl,
        fontWeight: '700',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    infoContainer: {
        padding: spacing.xxl,
        paddingTop: 0,
    },
    infoCard: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 12,
        gap: spacing.lg,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: font.xl,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    infoText: {
        fontSize: font.base,
        lineHeight: 20,
    },
});
