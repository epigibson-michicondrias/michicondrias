import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, Alert, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ROLE_IDS, isAdmin, isVeterinario, isPaseador, getRoleName } from '../../src/constants/roles';
import {
    Home, Bone, Heart, MapPin, ShoppingBag,
    Stethoscope, ShieldAlert, History, Activity,
    Settings, HelpCircle, LogOut, ChevronRight,
    Users, Calendar, CreditCard, MessageCircle,
    UserCheck, Search, Crown, Star, TrendingUp,
    Database, Building, User, Package, Briefcase,
    Lock, Shield, BarChart3, Settings2
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Componente para estadísticas reales
function AdminStats() {
    const [stats, setStats] = useState({
        usuarios: 0,
        clinicas: 0,
        productos: 0,
        loading: true
    });

    useEffect(() => {
        // Simular carga de datos reales (aquí deberías llamar a tu API)
        const loadStats = async () => {
            try {
                // Aquí irían las llamadas reales a tu API
                // const usuariosResponse = await fetch('/api/admin/stats/usuarios');
                // const clinicasResponse = await fetch('/api/admin/stats/clinicas');
                // const productosResponse = await fetch('/api/admin/stats/productos');
                
                // Datos simulados mientras implementas las APIs
                setStats({
                    usuarios: 2847,
                    clinicas: 124,
                    productos: 892,
                    loading: false
                });
            } catch (error) {
                console.error('Error loading stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        loadStats();
    }, []);

    if (stats.loading) {
        return (
            <View style={[styles.statsContainer, { backgroundColor: '#1f2937' }]}>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                        <Users size={20} color="#9ca3af" />
                    </View>
                    <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>--</Text>
                    <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Cargando...</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                        <Building size={20} color="#9ca3af" />
                    </View>
                    <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>--</Text>
                    <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Cargando...</Text>
                </View>
                <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                        <Package size={20} color="#9ca3af" />
                    </View>
                    <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>--</Text>
                    <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Cargando...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.statsContainer, { backgroundColor: '#1f2937' }]}>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                    <Users size={20} color="#8b5cf6" />
                </View>
                <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>{stats.usuarios.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Usuarios</Text>
            </View>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                    <Building size={20} color="#10b981" />
                </View>
                <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>{stats.clinicas.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Clínicas</Text>
            </View>
            <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                    <Package size={20} color="#f59e0b" />
                </View>
                <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>{stats.productos.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Productos</Text>
            </View>
        </View>
    );
}

export default function MenuScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Cerrar Sesión', 
                    style: 'destructive',
                    onPress: () => signOut()
                }
            ]
        );
    };

    // Si es admin, mostrar solo opciones de administración
    if (isAdmin(user?.role_id, user?.role_name)) {
        const ADMIN_MENU_SECTIONS = [
            {
                title: '🏥 Panel Principal',
                data: [
                    { id: 'panel-admin', icon: Crown, label: 'Dashboard Principal', route: '/admin', color: '#7c3aed', description: 'Vista general del sistema' },
                ]
            },
            {
                title: '👥 Gestión de Usuarios',
                data: [
                    { id: 'usuarios', icon: Users, label: 'Usuarios', route: '/admin/usuarios', color: '#3b82f6', description: 'Administrar todos los usuarios' },
                    { id: 'roles', icon: Lock, label: 'Roles y Permisos', route: '/admin/roles', color: '#f97316', description: 'Configurar roles del sistema' },
                ]
            },
            {
                title: '🏢 Gestión de Servicios',
                data: [
                    { id: 'categorias', icon: Database, label: 'Categorías', route: '/admin/categorias', color: '#10b981', description: 'Gestionar categorías' },
                    { id: 'clinicas', icon: Building, label: 'Clínicas', route: '/admin/clinicas', color: '#06b6d4', description: 'Administrar clínicas veterinarias' },
                    { id: 'veterinarios', icon: UserCheck, label: 'Veterinarios', route: '/admin/veterinarios', color: '#8b5cf6', description: 'Gestionar profesionales' },
                    { id: 'servicios', icon: Briefcase, label: 'Servicios', route: '/admin/servicios', color: '#14b8a6', description: 'Configurar servicios' },
                ]
            },
            {
                title: '🛍️ Gestión de Contenido',
                data: [
                    { id: 'mascotas-registradas', icon: Bone, label: 'Mascotas', route: '/admin/mascotas', color: '#f59e0b', description: 'Ver todas las mascotas' },
                    { id: 'productos', icon: Package, label: 'Productos', route: '/admin/productos', color: '#ef4444', description: 'Gestionar tienda' },
                ]
            },
            {
                title: '🛡️ Control y Moderación',
                data: [
                    { id: 'moderacion', icon: Shield, label: 'Moderación', route: '/admin/moderacion', color: '#8b5cf6', description: 'Revisar contenido' },
                    { id: 'verificaciones', icon: UserCheck, label: 'Verificaciones KYC', route: '/admin/verificaciones', color: '#ef4444', description: 'Validar identidades' },
                ]
            },
            {
                title: '📊 Análisis y Configuración',
                data: [
                    { id: 'stats', icon: BarChart3, label: 'Estadísticas', route: '/admin/stats', color: '#3b82f6', description: 'Análisis del sistema' },
                    { id: 'config', icon: Settings2, label: 'Configuración', route: '/admin/config', color: '#64748b', description: 'Ajustes generales' },
                ]
            }
        ];

        const ADMIN_ACCOUNT_SECTIONS = [
            {
                title: '👤 Cuenta',
                data: [
                    { id: 'perfil', icon: User, label: 'Mi Perfil', route: '/two', color: theme.text, description: 'Gestionar mi cuenta' },
                    { id: 'ayuda', icon: HelpCircle, label: 'Centro de Ayuda', route: '/ayuda', color: theme.textMuted, description: 'Soporte y ayuda' },
                    { id: 'logout', icon: LogOut, label: 'Cerrar Sesión', onPress: handleSignOut, color: '#ef4444', description: 'Salir del sistema' },
                ]
            }
        ];

        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                
                {/* Header Premium */}
                <View style={[styles.premiumHeader, { backgroundColor: theme.primary }]}>
                    <View style={styles.headerOverlay}>
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <View style={[styles.avatarRing, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Text style={[styles.avatarText, { color: '#fff' }]}>
                                        {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={[styles.userName, { color: '#fff' }]}>
                                    {user?.full_name || 'Admin User'}
                                </Text>
                                <Text style={[styles.userRole, { color: 'rgba(255,255,255,0.8)' }]}>
                                    Administrador
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                                    <Text style={[styles.statusText, { color: '#10b981' }]}>Activo</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Quick Stats */}
                    <AdminStats />

                    {/* Admin Menu Sections */}
                    {[...ADMIN_MENU_SECTIONS, ...ADMIN_ACCOUNT_SECTIONS].map((section, sectionIndex) => (
                        <View key={sectionIndex} style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                            </View>
                            <View style={styles.sectionGrid}>
                                {section.data.map((item, itemIndex) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.premiumMenuItem, { backgroundColor: theme.surface }]}
                                        onPress={() => item.onPress ? item.onPress() : router.push(item.route as any)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.menuItemHeader, { borderBottomColor: theme.border }]}>
                                            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                                <item.icon size={20} color={item.color} />
                                            </View>
                                            <View style={styles.menuItemInfo}>
                                                <Text style={[styles.menuItemLabel, { color: theme.text }]}>{item.label}</Text>
                                                <Text style={[styles.menuItemDescription, { color: theme.textMuted }]}>{item.description}</Text>
                                            </View>
                                            <ChevronRight size={18} color={theme.textMuted} />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    }

    // Para usuarios no admin, mostrar el menú normal
    const MENU_SECTIONS = [
        {
            title: 'Mi Actividad',
            data: [
                { id: 'mascotas', icon: Bone, label: 'Mis Mascotas', route: '/mascotas', color: '#7c3aed' },
                { id: 'solicitudes', icon: Heart, label: 'Mis Solicitudes Adopción', route: '/adopciones/mis-solicitudes', color: '#ec4899' },
                { id: 'citas', icon: Calendar, label: 'Mis Citas Médicas', route: '/directorio/citas', color: '#10b981' },
                isVeterinario(user?.role_id, user?.role_name) && { id: 'mi-clinica', icon: Stethoscope, label: 'Mi Clínica (Gestión)', route: '/mi-clinica', color: '#7c3aff' },
                isPaseador(user?.role_id, user?.role_name) && { id: 'pro-gestion', icon: Activity, label: 'Panel Profesional', route: '/servicios-pro/gestion', color: '#6366f1' },
                user?.role_name === 'vendedor' && { id: 'vendedor-dashboard', icon: ShoppingBag, label: 'Mi Tienda (Ventas)', route: '/tienda/vendedor', color: '#f43f5e' },
                { id: 'compras', icon: CreditCard, label: 'Historial de Compras', route: '/tienda/compras', color: '#f59e0b' },
            ].filter(Boolean) as any[]
        },
        {
            title: 'Servicios',
            data: [
                { id: 'paseadores', icon: UserCheck, label: 'Paseadores de Perros', route: '/paseadores', color: '#6366f1' },
                { id: 'cuidadores', icon: Home, label: 'Cuidadores / Pensiones', route: '/cuidadores', color: '#8b5cf6' },
                { id: 'petfriendly', icon: MapPin, label: 'Lugares Petfriendly', route: '/petfriendly', color: '#10b981' },
                { id: 'perdidas', icon: Search, label: 'Mascotas Perdidas', route: '/perdidas', color: '#ef4444' },
                { id: 'tienda', icon: ShoppingBag, label: 'Tienda de Productos', route: '/tienda', color: '#f43f5e' },
                { id: 'directorio', icon: Stethoscope, label: 'Directorio Veterinario', route: '/directorio', color: '#06b6d4' },
                { id: 'adopciones', icon: Heart, label: 'Adopciones', route: '/adopciones', color: '#ec4899' },
                { id: 'mascotas', icon: Bone, label: 'Mis Mascotas', route: '/mascotas', color: '#7c3aed' },
            ].filter(Boolean) as any[]
        },
        {
            title: 'Cuenta',
            data: [
                { id: 'perfil', icon: Users, label: 'Detalles de Perfil', route: '/two', color: theme.text },
                // Solo mostrar para usuarios que no son profesionales
                (!user?.role_name || user.role_name === 'consumidor') ? 
                    { id: 'partner', icon: ShieldAlert, label: 'Convertirse en Partner', route: '/perfil/partner', color: '#7c3aed' } : 
                    null,
                { id: 'ayuda', icon: HelpCircle, label: 'Centro de Ayuda', route: '/ayuda', color: theme.textMuted },
            ].filter(Boolean) as any[]
        }
    ].filter(Boolean) as any[];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Menú Principal</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Todo Michicondrias en un solo lugar</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {MENU_SECTIONS.map((section, idx) => (
                    <View key={idx} style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{section.title.toUpperCase()}</Text>
                        <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                            {section.data.map((item: any, itemIdx: number) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        itemIdx < section.data.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
                                    ]}
                                    onPress={() => item.id === 'perfil' ? router.push('/two') : router.push(item.route as any)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                        <item.icon size={20} color={item.color} />
                                    </View>
                                    <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                                    <ChevronRight size={18} color={theme.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.logoutBtn, { borderTopColor: theme.border }]}
                    onPress={signOut}
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.textMuted }]}>Michicondrias Mobile v1.1.0</Text>
                    <Text style={[styles.footerText, { color: theme.textMuted }]}>Hecho con ❤️ para tus michis</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        marginTop: 4,
        opacity: 0.7,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatarRing: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crownBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '600',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    premiumHeader: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 40,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    headerOverlay: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionGrid: {
        gap: 12,
    },
    premiumMenuItem: {
        borderRadius: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    menuItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 8,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemInfo: {
        flex: 1,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    menuItemDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    sectionCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 24,
        marginTop: 10,
        borderTopWidth: 1,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        opacity: 0.5,
    },
});
