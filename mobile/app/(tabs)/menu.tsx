import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, SectionList, Dimensions } from 'react-native';
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
    UserCheck, Search
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MenuScreen() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

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
                // Solo mostrar para usuarios que no son admin
                !isAdmin(user?.role_id, user?.role_name) && { id: 'adopciones', icon: Heart, label: 'Adopciones', route: '/adopciones', color: '#ec4899' },
                !isAdmin(user?.role_id, user?.role_name) && { id: 'mascotas', icon: Bone, label: 'Mis Mascotas', route: '/mascotas', color: '#7c3aed' },
            ].filter(Boolean) as any[]
        },
        isAdmin(user?.role_id, user?.role_name) ? {
            title: 'Administración',
            data: [
                { id: 'panel-admin', icon: ShieldAlert, label: 'Panel de Administración', route: '/admin', color: '#7c3aed' },
                { id: 'moderacion', icon: ShieldAlert, label: 'Centro de Moderación', route: '/admin/moderacion', color: '#8b5cf6' },
                { id: 'verificaciones', icon: UserCheck, label: 'Control KYC', route: '/admin/verificaciones', color: '#ef4444' },
                { id: 'stats', icon: Activity, label: 'Analíticas Globales', route: '/admin/stats', color: '#3b82f6' },
                { id: 'config', icon: Settings, label: 'Configuración Sistema', route: '/admin/config', color: '#64748b' },
            ]
        } : null,
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

            <ScrollView contentContainerStyle={styles.scroll}>
                {MENU_SECTIONS.map((section, idx) => (
                    <View key={idx} style={styles.section}>
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
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    scroll: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
    },
    sectionCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 24,
        marginTop: 10,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        gap: 4,
    },
    footerText: {
        fontSize: 11,
        fontWeight: '600',
    }
});
