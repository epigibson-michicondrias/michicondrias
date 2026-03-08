import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
    Users,
    UserCheck,
    Shield,
    Package,
    MapPin,
    ShoppingCart,
    BarChart3,
    Settings,
    ChevronLeft,
    AlertTriangle,
    Heart,
    Star,
    Grid,
    Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { adminUsersService } from '@/src/services/adminUsers';
import { getClinics } from '@/src/services/directorio';

const { width } = Dimensions.get('window');

type AdminModule = {
    key: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    route: string;
};

export default function AdminScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();

    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: () => adminUsersService.getUsersStats(),
    });

    const { data: clinics = [] } = useQuery({
        queryKey: ['admin-clinics'],
        queryFn: () => getClinics(),
    });

    const totalUsers = stats?.total_users || 0;
    const vetCount = stats?.role_distribution?.['veterinario'] || 0;
    const consumerCount = stats?.role_distribution?.['consumidor'] || 0;
    const sitterCount = (stats?.role_distribution?.['paseador'] || 0) + (stats?.role_distribution?.['cuidador'] || 0);

    const moduleGroups = [
        {
            title: 'Gestión de Usuarios',
            icon: Users,
            modules: [
                {
                    key: 'usuarios',
                    title: 'Usuarios',
                    description: 'Roles y permisos',
                    icon: Users,
                    color: '#3b82f6',
                    route: '/admin/usuarios'
                },
                {
                    key: 'veterinarios',
                    title: 'Veterinarios',
                    description: 'Registro profesional',
                    icon: UserCheck,
                    color: '#f59e0b',
                    route: '/admin/veterinarios'
                },
                {
                    key: 'roles',
                    title: 'Roles',
                    description: 'Permisos del sistema',
                    icon: Shield,
                    color: '#ef4444',
                    route: '/admin/roles'
                }
            ]
        },
        {
            title: 'Contenido y Catálogo',
            icon: Package,
            modules: [
                {
                    key: 'categorias',
                    title: 'Categorías',
                    description: 'Ecommerce y serv.',
                    icon: Package,
                    color: '#8b5cf6',
                    route: '/admin/categorias'
                },
                {
                    key: 'clinicas',
                    title: 'Clínicas',
                    description: 'Gestión de centros',
                    icon: MapPin,
                    color: '#10b981',
                    route: '/admin/clinicas'
                },
                {
                    key: 'productos',
                    title: 'Productos',
                    description: 'Control de inventario',
                    icon: ShoppingCart,
                    color: '#06b6d4',
                    route: '/admin/productos'
                }
            ]
        },
        {
            title: 'Métricas y Configuración',
            icon: BarChart3,
            modules: [
                {
                    key: 'estadisticas',
                    title: 'Analytics',
                    description: 'Análisis de plataforma',
                    icon: BarChart3,
                    color: '#14b8a6',
                    route: '/admin/stats'
                },
                {
                    key: 'configuracion',
                    title: 'Ajustes',
                    description: 'General del sistema',
                    icon: Settings,
                    color: '#64748b',
                    route: '/admin/config'
                }
            ]
        }
    ];

    const renderModule = (module: any) => {
        const Icon = module.icon;
        
        return (
            <TouchableOpacity
                key={module.key}
                activeOpacity={0.7}
                style={[styles.moduleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(module.route as any)}
            >
                <View style={[styles.iconContainer, { backgroundColor: module.color + '15' }]}>
                    <Icon size={24} color={module.color} />
                </View>
                <View style={styles.moduleInfo}>
                    <Text style={[styles.moduleTitle, { color: theme.text }]}>{module.title}</Text>
                    <Text style={[styles.moduleDescription, { color: theme.textMuted }]} numberOfLines={1}>
                        {module.description}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={[theme.primary, theme.primary + 'CC', theme.primary + '99']}
                style={[styles.premiumHeader, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Panel Admin</Text>
                        <Text style={styles.subtitle}>Gestor Central Michicondrias</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Real Stats Strip */}
                <View style={styles.statsStrip}>
                    <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Users size={18} color={theme.primary} />
                        <View>
                            <Text style={[styles.statNumber, { color: theme.text }]}>
                                {totalUsers >= 1000 ? `${(totalUsers / 1000).toFixed(1)}k` : totalUsers}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Usuarios</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <MapPin size={18} color="#10b981" />
                        <View>
                            <Text style={[styles.statNumber, { color: theme.text }]}>{clinics.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Clínicas</Text>
                        </View>
                    </View>
                </View>

                {/* Extended Stats Strip */}
                <View style={[styles.statsStrip, { marginTop: 12 }]}>
                    <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <UserCheck size={18} color="#3b82f6" />
                        <View>
                            <Text style={[styles.statNumber, { color: theme.text }]}>{vetCount}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Vets</Text>
                        </View>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Heart size={18} color="#f59e0b" />
                        <View>
                            <Text style={[styles.statNumber, { color: theme.text }]}>{sitterCount}</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Servicios</Text>
                        </View>
                    </View>
                </View>

                {/* Categories and Modules */}
                {moduleGroups.map((group, idx) => (
                    <View key={idx} style={styles.groupSection}>
                        <View style={styles.sectionHeader}>
                            <group.icon size={18} color={theme.textMuted} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{group.title}</Text>
                        </View>
                        <View style={styles.modulesGrid}>
                            {group.modules.map(renderModule)}
                        </View>
                    </View>
                ))}

                {/* Quick Actions Premium */}
                <View style={styles.quickSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Acciones Urgentes</Text>
                    <View style={styles.quickGrid}>
                        <TouchableOpacity 
                            style={[styles.quickCard, { backgroundColor: '#ef4444' }]}
                            onPress={() => router.push('/admin/moderacion')}
                        >
                            <AlertTriangle size={20} color="#fff" />
                            <Text style={styles.quickCardTitle}>Moderación</Text>
                            <Text style={styles.quickCardDesc}>Pendientes</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.quickCard, { backgroundColor: '#3b82f6' }]}
                            onPress={() => router.push('/admin/verificaciones')}
                        >
                            <UserCheck size={20} color="#fff" />
                            <Text style={styles.quickCardTitle}>Identidad</Text>
                            <Text style={styles.quickCardDesc}>Validar KYC</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    premiumHeader: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        display: 'none',
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    statsStrip: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: -14,
        gap: 12,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 12,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    groupSection: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modulesGrid: {
        gap: 12,
    },
    moduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleInfo: {
        flex: 1,
    },
    moduleTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    moduleDescription: {
        fontSize: 12,
        fontWeight: '500',
    },
    quickSection: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    quickGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        gap: 8,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    quickCardTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
    },
    quickCardDesc: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
});
