import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import {
    Shield,
    ChevronLeft,
    Users,
    Settings,
    BarChart3,
    Package,
    ShoppingCart,
    UserCheck,
    AlertTriangle,
    FileText,
    Database,
    MapPin,
    Calendar,
    Activity,
    TrendingUp,
    Building,
    ClipboardList,
    Heart,
    Star
} from 'lucide-react-native';

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
    const [activeModule, setActiveModule] = useState<AdminModule>({ key: 'usuarios', title: 'Usuarios', description: 'Gestión de usuarios, roles y permisos', icon: Users, color: '#3b82f6', route: '/admin/usuarios' });

    const modules = [
        {
            key: 'usuarios',
            title: 'Usuarios',
            description: 'Gestión de usuarios, roles y permisos',
            icon: Users,
            color: '#3b82f6',
            route: '/admin/usuarios'
        },
        {
            key: 'categorias',
            title: 'Categorías',
            description: 'Administrar categorías de servicios',
            icon: Package,
            color: '#8b5cf6',
            route: '/admin/categorias'
        },
        {
            key: 'subcategorias',
            title: 'Subcategorías',
            description: 'Gestión de subcategorías especializadas',
            icon: Building,
            color: '#6366f1',
            route: '/admin/subcategorias'
        },
        {
            key: 'clinicas',
            title: 'Clínicas',
            description: 'Aprobar y gestionar clínicas veterinarias',
            icon: MapPin,
            color: '#10b981',
            route: '/admin/clinicas'
        },
        {
            key: 'veterinarios',
            title: 'Veterinarios',
            description: 'Registro y verificación de profesionales',
            icon: UserCheck,
            color: '#f59e0b',
            route: '/admin/veterinarios'
        },
        {
            key: 'productos',
            title: 'Productos',
            description: 'Catálogo de productos y servicios',
            icon: ShoppingCart,
            color: '#06b6d4',
            route: '/admin/productos'
        },
        {
            key: 'servicios',
            title: 'Servicios',
            description: 'Configuración de servicios veterinarios',
            icon: FileText,
            color: '#84cc16',
            route: '/admin/servicios'
        },
        {
            key: 'roles',
            title: 'Roles',
            description: 'Definir roles y permisos del sistema',
            icon: Shield,
            color: '#7c3aed',
            route: '/admin/roles'
        },
        {
            key: 'estadisticas',
            title: 'Estadísticas',
            description: 'Métricas y análisis del sistema',
            icon: BarChart3,
            color: '#14b8a6',
            route: '/admin/estadisticas'
        },
        {
            key: 'configuracion',
            title: 'Configuración',
            description: 'Ajustes generales del sistema',
            icon: Settings,
            color: '#64748b',
            route: '/admin/configuracion'
        }
    ];

    const renderModule = (module: AdminModule) => {
        const Icon = module.icon;
        const isActive = activeModule === module.key;
        
        return (
            <TouchableOpacity
                key={module.key}
                style={[
                    styles.moduleCard,
                    {
                        backgroundColor: isActive ? module.color : theme.surface,
                        borderColor: isActive ? module.color : theme.border,
                        borderWidth: isActive ? 2 : 1
                    }
                ]}
                onPress={() => router.push(module.route as any)}
            >
                <View style={styles.moduleContent}>
                    <View style={[styles.iconContainer, { backgroundColor: isActive ? module.color + '20' : theme.background }]}>
                        <Icon size={32} color={isActive ? '#fff' : module.color} />
                    </View>
                    <Text style={[styles.moduleTitle, { color: isActive ? '#fff' : theme.text }]}>
                        {module.title}
                    </Text>
                    <Text style={[styles.moduleDescription, { color: isActive ? '#fff' : theme.textMuted }]}>
                        {module.description}
                    </Text>
                </View>
                {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: '#fff' }]}>
                        <Activity size={16} color={module.color} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Shield size={32} color={theme.primary} />
                    <View style={styles.headerText}>
                        <Text style={[styles.title, { color: theme.text }]}>Panel de Administración</Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Gestión completa del sistema</Text>
                    </View>
                </View>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Users size={24} color={theme.primary} />
                    <View style={styles.statContent}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>1,247</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Usuarios</Text>
                    </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <MapPin size={24} color={theme.primary} />
                    <View style={styles.statContent}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>89</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Clínicas</Text>
                    </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Package size={24} color={theme.primary} />
                    <View style={styles.statContent}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>456</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Productos</Text>
                    </View>
                </View>
            </View>

            {/* Modules Grid */}
            <ScrollView style={styles.modulesContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.modulesGrid}>
                    {modules.map((module) => renderModule(module))}
                </View>
            </ScrollView>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Acciones Rápidas</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity 
                        style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/admin/moderacion' as any)}
                    >
                        <AlertTriangle size={24} color={theme.primary} />
                        <Text style={[styles.quickActionTitle, { color: theme.text }]}>Moderación</Text>
                        <Text style={[styles.quickActionDesc, { color: theme.textMuted }]}>Revisar contenido pendiente</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/admin/verificaciones' as any)}
                    >
                        <UserCheck size={24} color={theme.primary} />
                        <Text style={[styles.quickActionTitle, { color: theme.text }]}>Verificaciones KYC</Text>
                        <Text style={[styles.quickActionDesc, { color: theme.textMuted }]}>Validar identidades</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/admin/estadisticas' as any)}
                    >
                        <BarChart3 size={24} color={theme.primary} />
                        <Text style={[styles.quickActionTitle, { color: theme.text }]}>Estadísticas</Text>
                        <Text style={[styles.quickActionDesc, { color: theme.textMuted }]}>Análisis del sistema</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statContent: {
        alignItems: 'center',
        gap: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    modulesContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    modulesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    moduleCard: {
        width: (width - 48) / 2 - 12,
        height: 120,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    moduleContent: {
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moduleTitle: {
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
    },
    moduleDescription: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 14,
    },
    activeIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    quickActions: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickActionCard: {
        width: (width - 48) / 2 - 8,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    quickActionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    quickActionDesc: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 12,
    },
});
