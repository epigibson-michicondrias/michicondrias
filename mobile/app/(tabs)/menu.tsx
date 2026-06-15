import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { isAdmin, isVeterinario, isPaseador } from '../../src/constants/roles';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Heart, ShoppingBag,
    Stethoscope, Activity,
    HelpCircle, LogOut, ChevronRight,
    Users, Calendar,
    UserCheck, Crown,
    Building, Package, Briefcase,
    Shield, BarChart3, Settings2,
    Video, ClipboardList, Eye, Handshake,
    Dumbbell, Scissors, Car, Award
} from 'lucide-react-native';

export default function MenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isUserAdmin = isAdmin(user?.role_id, user?.role_name);

    const handleSignOut = () => {
        showAlert({
            type: 'warning',
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que quieres cerrar sesión?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Cerrar Sesión',
            onButtonPress: () => signOut(),
        });
    };

    // ── PRO TOOLS (only for professional roles) ──────────────────────
    const isProfessional =
        user?.role_name === 'veterinario' ||
        user?.role_name === 'hospital' ||
        user?.role_name === 'refugio' ||
        user?.role_name === 'vendedor' ||
        user?.role_name === 'paseador' ||
        user?.role_name === 'cuidador';

    const PRO_SECTIONS = isProfessional
        ? [
              {
                  title: 'Herramientas Pro',
                  icon: Briefcase,
                  data: [
                      ...(user?.role_name === 'veterinario'
                          ? [
                                { id: 'directorio-v', icon: Stethoscope, label: 'Mi Directorio', route: '/directorio/nuevo', color: '#06b6d4', desc: 'Gestionar lugares' },
                                { id: 'citas-v', icon: Calendar, label: 'Agenda Citas', route: '/directorio/citas', color: '#10b981', desc: 'Pacientes y horarios' },
                                { id: 'telemedicina-v', icon: Video, label: 'Videoconsultas', route: '/mi-clinica/consultas-video', color: '#6366f1', desc: 'Pacientes virtuales' },
                            ]
                          : []),
                      ...(user?.role_name === 'hospital'
                          ? [
                                { id: 'h-clinicas', icon: Building, label: 'Mis Clínicas', route: '/mi-clinica/sucursales', color: '#06b6d4', desc: 'Sucursales y sedes' },
                                { id: 'h-vets', icon: Users, label: 'Asociar Médicos', route: '/mi-clinica/veterinarios', color: '#10b981', desc: 'Gestionar veterinarios' },
                            ]
                          : []),
                      ...(user?.role_name === 'refugio'
                          ? [
                                { id: 'ref-publicaciones', icon: Heart, label: 'Mis Mascotas', route: '/adopciones/mis-publicaciones', color: '#ec4899', desc: 'Gestionar publicaciones' },
                                { id: 'ref-solicitudes', icon: ClipboardList, label: 'Solicitudes Recibidas', route: '/adopciones/solicitudes', color: '#10b981', desc: 'Ver solicitudes' },
                            ]
                          : []),
                      ...(user?.role_name === 'vendedor'
                          ? [
                                { id: 'v-pedidos', icon: Package, label: 'Pedidos Recibidos', route: '/tienda/vendedor/pedidos', color: '#10b981', desc: 'Gestión de ventas' },
                            ]
                          : []),
                      ...(user?.role_name === 'paseador' || user?.role_name === 'cuidador'
                          ? [
                                { id: 'p-servicios', icon: Activity, label: 'Mis Servicios', route: '/servicios-pro', color: '#6366f1', desc: 'Perfil profesional' },
                            ]
                          : []),
                  ],
              },
          ]
        : [];

    // ── ADMIN TOOLS (only for admin) ─────────────────────────────────
    const ADMIN_SECTIONS = isUserAdmin
        ? [
              {
                  title: 'Administración',
                  icon: Shield,
                  data: [
                      { id: 'admin-stats', icon: BarChart3, label: 'Analíticas', route: '/admin/stats', color: '#10b981', desc: 'Rendimiento global' },
                      { id: 'admin-config', icon: Settings2, label: 'Configuración', route: '/admin/config', color: '#64748b', desc: 'Ajustes del sistema' },
                      { id: 'admin-users', icon: Users, label: 'Usuarios', route: '/admin/usuarios', color: '#3b82f6', desc: 'Gestión de cuentas' },
                      { id: 'admin-roles', icon: UserCheck, label: 'Roles', route: '/admin/roles', color: '#8b5cf6', desc: 'Permisos y accesos' },
                      { id: 'admin-mod', icon: Eye, label: 'Moderación', route: '/admin/moderacion', color: '#ef4444', desc: 'Contenido reportado' },
                      { id: 'admin-kyc', icon: Shield, label: 'Verificaciones KYC', route: '/admin/verificaciones', color: '#f59e0b', desc: 'Identidad profesional' },
                  ],
              },
          ]
        : [];

    // ── SOPORTE (visible for all) ────────────────────────────────────
    const SUPPORT_SECTIONS = [
        {
            title: 'Soporte',
            icon: HelpCircle,
            data: [
                { id: 'ayuda', icon: HelpCircle, label: 'Centro de Ayuda', route: '/ayuda', color: '#64748b', desc: 'Soporte y FAQ' },
                { id: 'partner', icon: Handshake, label: 'Ser Profesional', route: '/perfil/partner', color: '#7c3aed', desc: 'Únete como partner' },
            ],
        },
    ];

    // ── SERVICES (visible for all) ──────────────────────────────────
    const SERVICES_SECTIONS = [
        {
            title: 'Servicios',
            icon: Briefcase,
            data: [
                { id: 'aseguradoras', icon: Shield, label: 'Aseguradoras', route: '/aseguradoras', color: '#0ea5e9', desc: 'Seguros para mascotas' },
                { id: 'entrenadores', icon: Dumbbell, label: 'Entrenadores', route: '/entrenadores', color: '#8b5cf6', desc: 'Adiestramiento canino' },
                { id: 'establecimientos', icon: Building, label: 'Establecimientos', route: '/establecimientos', color: '#f59e0b', desc: 'Lugares y comercios' },
                { id: 'estilistas', icon: Scissors, label: 'Estilistas', route: '/estilistas', color: '#ec4899', desc: 'Peluquería canina' },
                { id: 'funeraria', icon: Heart, label: 'Funeraria', route: '/funeraria', color: '#64748b', desc: 'Servicios funerarios' },
                { id: 'patrocinadores', icon: Award, label: 'Patrocinadores', route: '/patrocinadores', color: '#10b981', desc: 'Aliados comerciales' },
                { id: 'transportistas', icon: Car, label: 'Transportistas', route: '/transportistas', color: '#6366f1', desc: 'Transporte de mascotas' },
            ],
        },
    ];

    // ── All sections combined ────────────────────────────────────────
    const allSections = [...SERVICES_SECTIONS, ...PRO_SECTIONS, ...ADMIN_SECTIONS, ...SUPPORT_SECTIONS];

    // ── Header ───────────────────────────────────────────────────────
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
        </LinearGradient>
    );

    // ── Role-based quick-access banner ───────────────────────────────
    const renderBanner = () => {
        let bannerProps: { title: string; sub: string; route: string; colors: [string, string]; icon: any } | null = null;

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
                    onPress={() => router.push(bannerProps!.route as any)}
                >
                    <LinearGradient
                        colors={bannerProps.colors}
                        style={styles.absGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
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
    };

    // ── Menu item ────────────────────────────────────────────────────
    const renderMenuItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(item.route as any)}
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

    // ── Render ───────────────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {renderHeader()}

                <View style={styles.content}>
                    {renderBanner()}

                    {allSections.map((section, idx) => (
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
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>Michicondrias Mobile v2.0.0</Text>
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
        paddingBottom: 40,
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
        alignSelf: 'flex-start',
    },
    roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    content: { padding: 24, marginTop: -20 },
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
    footerText: { fontSize: 11, fontWeight: '600', opacity: 0.5, marginBottom: 4 },
});
