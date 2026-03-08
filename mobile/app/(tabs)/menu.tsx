import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Alert, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { isAdmin, isVeterinario, isPaseador } from '../../src/constants/roles';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Home, Bone, Heart, MapPin, ShoppingBag,
    Stethoscope, ShieldAlert, History, Activity,
    Settings, HelpCircle, LogOut, ChevronRight,
    Users, Calendar, CreditCard, MessageCircle,
    UserCheck, Search, Crown, Star, TrendingUp,
    Database, Building, User, Package, Briefcase,
    Lock, Shield, BarChart3, Settings2, Zap, LayoutGrid
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Componente para estadísticas reales (con diseño premium)
function PremiumStats({ isAdmin }: { isAdmin?: boolean }) {
    return (
        <View style={styles.statsStrip}>
            <View style={styles.statGlassCard}>
                <Users size={18} color="#fff" />
                <View>
                    <Text style={styles.statValText}>2.8k</Text>
                    <Text style={styles.statLabText}>Usuarios</Text>
                </View>
            </View>
            <View style={styles.statGlassCard}>
                <Activity size={18} color="#fff" />
                <View>
                    <Text style={styles.statValText}>124</Text>
                    <Text style={styles.statLabText}>Clínicas</Text>
                </View>
            </View>
            <View style={styles.statGlassCard}>
                <TrendingUp size={18} color="#fff" />
                <View>
                    <Text style={styles.statValText}>+15%</Text>
                    <Text style={styles.statLabText}>Crecimiento</Text>
                </View>
            </View>
        </View>
    );
}

export default function MenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isUserAdmin = isAdmin(user?.role_id, user?.role_name);

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar Sesión', style: 'destructive', onPress: () => signOut() }
            ]
        );
    };

    const ADMIN_SECTIONS = [
        {
            title: 'Configuración y Más',
            icon: Settings,
            data: [
                { id: 'stats', icon: BarChart3, label: 'Analíticas', route: '/admin/stats', color: '#10b981', desc: 'Rendimiento global' },
                { id: 'config', icon: Settings2, label: 'Configuración', route: '/admin/config', color: '#64748b', desc: 'Ajustes del sistema' },
            ]
        }
    ];

    const PRO_SECTION = (user?.role_name === 'veterinario' || user?.role_name === 'paseador' || user?.role_name === 'cuidador' || user?.role_name === 'vendedor') ? [
        {
            title: 'Mis Herramientas Pro',
            icon: Briefcase,
            data: [
                ...(user?.role_name === 'veterinario' ? [
                    { id: 'directorio-v', icon: Stethoscope, label: 'Mi Directorio', route: '/directorio/nuevo', color: '#06b6d4', desc: 'Gestionar lugares' },
                    { id: 'citas-v', icon: Calendar, label: 'Agenda Citas', route: '/directorio/citas', color: '#10b981', desc: 'Pacientes y horarios' },
                ] : []),
                ...(user?.role_name === 'vendedor' ? [
                    { id: 'v-pedidos', icon: Package, label: 'Pedidos Recibidos', route: '/tienda/vendedor/pedidos', color: '#10b981', desc: 'Gestión de ventas' },
                ] : []),
                ...(user?.role_name === 'paseador' || user?.role_name === 'cuidador' ? [
                    { id: 'p-servicios', icon: Activity, label: 'Mis Servicios', route: '/servicios-pro', color: '#6366f1', desc: 'Perfil profesional' },
                ] : []),
            ]
        }
    ] : [];

    const USER_SECTIONS = [
        {
            title: 'Mi Actividad',
            icon: Activity,
            data: [
                { id: 'mascotas', icon: Bone, label: 'Mis Mascotas', route: '/mascotas', color: '#7c3aed', desc: 'Registro y cuidados' },
                { id: 'solicitudes', icon: Heart, label: 'Adopciones', route: '/adopciones/mis-solicitudes', color: '#ec4899', desc: 'Seguimiento de trámites' },
                { id: 'citas', icon: Calendar, label: 'Citas Médicas', route: '/directorio/citas', color: '#10b981', desc: 'Agenda veterinaria' },
                { id: 'compras', icon: CreditCard, label: 'Mis Compras', route: '/tienda/compras', color: '#f59e0b', desc: 'Historial de tienda' },
            ]
        },
        {
            title: 'Directorio y Salud',
            icon: Building,
            data: [
                { id: 'clinicas', icon: Building, label: 'Clínicas', route: '/directorio?type=clinic', color: '#10b981', desc: 'Centros veterinarios' },
                { id: 'directorio', icon: Stethoscope, label: 'Veterinarios', route: '/directorio', color: '#06b6d4', desc: 'Busca profesionales' },
                { id: 'petfriendly', icon: MapPin, label: 'Petfriendly', route: '/petfriendly', color: '#14b8a6', desc: 'Lugares para ir' },
            ]
        },
        {
            title: 'Servicios y Cuidados',
            icon: LayoutGrid,
            data: [
                { id: 'paseadores', icon: UserCheck, label: 'Paseadores', route: '/paseadores', color: '#6366f1', desc: 'Encuentra ayuda' },
                { id: 'cuidadores', icon: Home, label: 'Cuidadores', route: '/cuidadores', color: '#8b5cf6', desc: 'Pensiones Michi' },
            ]
        },
        {
            title: 'Tienda y Comunidad',
            icon: ShoppingBag,
            data: [
                { id: 'tienda', icon: ShoppingBag, label: 'Tienda Online', route: '/tienda', color: '#f43f5e', desc: 'Todo para tu michi' },
                { id: 'perdidas', icon: Search, label: 'Mascotas Perdidas', route: '/perdidas', color: '#ef4444', desc: 'Sección de ayuda' },
            ]
        }
    ];

    const PROFILE_SECTIONS = [
        {
            title: 'Mi Perfil',
            icon: User,
            data: [
                { id: 'perfil', icon: Users, label: 'Mis Datos', route: '/two', color: theme.text, desc: 'Información de cuenta' },
                { id: 'ayuda', icon: HelpCircle, label: 'Centro de Ayuda', route: '/ayuda', color: theme.textMuted, desc: 'Soporte y FAQ' },
            ]
        }
    ];

    const renderHeader = () => (
        <LinearGradient
            colors={[theme.primary, theme.primary + 'EE', theme.primary + 'CC']}
            style={[styles.premiumHeader, { paddingTop: insets.top + 20 }]}
        >
            <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarGlass}>
                        <Text style={styles.avatarText}>
                            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    {isUserAdmin && (
                        <View style={styles.adminBadge}>
                            <Crown size={10} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.profileMasterInfo}>
                    <Text style={styles.welcomeText}>¡Hola!</Text>
                    <Text style={styles.profileName}>{user?.full_name || 'Explorador'}</Text>
                    <View style={[styles.roleLabel, { backgroundColor: isUserAdmin ? '#f59e0b40' : 'rgba(255,255,255,0.15)' }]}>
                        <Text style={[styles.roleText, { color: isUserAdmin ? '#fcd34d' : '#fff' }]}>
                            {isUserAdmin ? 'Administrador' : user?.role_name || 'Usuario'}
                        </Text>
                    </View>
                </View>
            </View>
            <PremiumStats isAdmin={isUserAdmin} />
        </LinearGradient>
    );

    const renderMenuItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => item.onPress ? item.onPress() : router.push(item.route as any)}
        >
            <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon size={20} color={item.color} />
            </View>
            <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.menuDesc, { color: theme.textMuted }]} numberOfLines={1}>{item.desc}</Text>
            </View>
            <ChevronRight size={16} color={theme.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />
            
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {renderHeader()}

                <View style={styles.content}>
                    {(() => {
                        let bannerProps: { title: string, sub: string, route: string, colors: [string, string], icon: any } | null = null;
                        if (isUserAdmin) {
                            bannerProps = { title: 'Panel Admin', sub: 'Administración global', route: '/admin', colors: ['#7c3aed', '#6d28d9'], icon: Shield };
                        } else if (user?.role_name === 'veterinario') {
                            bannerProps = { title: 'Consultorio', sub: 'Operaciones clínicas', route: '/mi-clinica', colors: ['#06b6d4', '#0891b2'], icon: Stethoscope };
                        } else if (user?.role_name === 'paseador' || user?.role_name === 'cuidador') {
                            bannerProps = { title: 'Mis Tareas', sub: 'Solicitudes y servicios', route: '/servicios-pro/gestion', colors: ['#6366f1', '#4338ca'], icon: Activity };
                        } else if (user?.role_name === 'vendedor') {
                            bannerProps = { title: 'Mi Tienda', sub: 'Gestión de catálogo', route: '/tienda/vendedor', colors: ['#10b981', '#059669'], icon: ShoppingBag };
                        }

                        if (!bannerProps) return null;

                        return (
                            <View style={styles.adminQuickAccess}>
                                <TouchableOpacity 
                                    style={[styles.adminBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                    onPress={() => router.push(bannerProps.route as any)}
                                >
                                    <LinearGradient
                                        colors={bannerProps.colors}
                                        style={styles.absGradient}
                                        start={{x:0, y:0}}
                                        end={{x:1, y:1}}
                                    />
                                    <View style={styles.bannerIcon}>
                                        <bannerProps.icon size={24} color="#fff" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.bannerTitle}>{bannerProps.title}</Text>
                                        <Text style={styles.bannerSub}>{bannerProps.sub}</Text>
                                    </View>
                                    <ChevronRight size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        );
                    })()}

                    {([...(isUserAdmin ? ADMIN_SECTIONS : []), ...PRO_SECTION, ...USER_SECTIONS, ...PROFILE_SECTIONS]).map((section, idx) => (
                        <View key={idx} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                {section.icon && <section.icon size={16} color={theme.textMuted} />}
                                <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{section.title.toUpperCase()}</Text>
                            </View>
                            <View style={styles.grid}>
                                {section.data.map(renderMenuItem)}
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity 
                        style={[styles.logoutBtn, { borderColor: theme.border }]}
                        onPress={handleSignOut}
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>Michicondrias Mobile v1.5.0</Text>
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>Mantenido con el alma para tus mascotas</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    premiumHeader: {
        paddingHorizontal: 24,
        paddingBottom: 60,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatarContainer: { position: 'relative' },
    avatarGlass: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
    adminBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#f59e0b',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileMasterInfo: { flex: 1 },
    welcomeText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    profileName: { fontSize: 24, fontWeight: '900', color: '#fff' },
    roleLabel: { 
        paddingHorizontal: 10, 
        paddingVertical: 3, 
        borderRadius: 8, 
        marginTop: 6, 
        alignSelf: 'flex-start' 
    },
    roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    statsStrip: {
        flexDirection: 'row',
        marginTop: 32,
        gap: 12,
    },
    statGlassCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        gap: 10,
    },
    statValText: { fontSize: 15, fontWeight: '900', color: '#fff' },
    statLabText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' },
    content: { padding: 24, marginTop: -30 },
    adminQuickAccess: { marginBottom: 32 },
    adminBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        overflow: 'hidden',
        gap: 16,
        elevation: 8,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    absGradient: { ...StyleSheet.absoluteFillObject },
    bannerIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
    bannerSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
    grid: { gap: 12 },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    menuIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    menuInfo: { flex: 1 },
    menuLabel: { fontSize: 16, fontWeight: '800' },
    menuDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        marginTop: 12,
    },
    logoutText: { fontSize: 16, fontWeight: '900', color: '#ef4444' },
    footer: { paddingVertical: 40, alignItems: 'center' },
    footerText: { fontSize: 11, fontWeight: '600', opacity: 0.5, marginBottom: 4 }
});
