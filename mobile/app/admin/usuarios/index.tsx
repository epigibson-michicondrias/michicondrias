import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
    Users,
    ChevronLeft,
    Search,
    Filter,
    Shield,
    ShieldCheck,
    XCircle,
    CheckCircle2,
    Mail,
    MapPin,
    Calendar,
    Edit,
    Trash2,
    Plus,
    MoreVertical,
    UserPlus,
    UserMinus,
    Key,
    Eye,
    EyeOff
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface User {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    is_active: boolean;
    created_at: string;
    last_login?: string;
    clinic_id?: string;
}

export default function AdminUsersScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Mock data - reemplazar con API real
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => [
            {
                id: '1',
                full_name: 'Dr. Juan Pérez',
                email: 'juan.perez@veterinaria.com',
                phone: '+1 234 567 8901',
                role: 'ADMIN',
                is_active: true,
                created_at: '2024-01-15T10:30:00Z',
                last_login: '2024-03-06T14:25:00Z',
                clinic_id: 'clinic-1'
            },
            {
                id: '2',
                full_name: 'Dra. María González',
                email: 'maria.gonzalez@veterinaria.com',
                phone: '+1 234 567 8902',
                role: 'VETERINARIAN',
                is_active: true,
                created_at: '2024-02-20T09:15:00Z',
                last_login: '2024-03-06T08:30:00Z',
                clinic_id: 'clinic-2'
            },
            {
                id: '3',
                full_name: 'Lic. Carlos Rodríguez',
                email: 'carlos.rodriguez@veterinaria.com',
                phone: '+1 234 567 8903',
                role: 'RECEPCIONIST',
                is_active: false,
                created_at: '2024-01-10T16:45:00Z',
                last_login: '2024-03-05T16:20:00Z',
                clinic_id: 'clinic-1'
            },
            {
                id: '4',
                full_name: 'Ana Martínez',
                email: 'ana.martinez@veterinaria.com',
                phone: '+1 234 567 8904',
                role: 'USER',
                is_active: true,
                created_at: '2024-03-01T11:30:00Z',
                last_login: '2024-03-06T12:15:00Z',
                clinic_id: 'clinic-3'
            }
        ]
    });

    const toggleUserStatus = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
            // Mock API call - reemplazar con API real
            await new Promise(resolve => setTimeout(resolve, 500));
            Alert.alert("Éxito", `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente.`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
    });

    const deleteUser = useMutation({
        mutationFn: async (userId: string) => {
            Alert.alert(
                "Eliminar Usuario",
                "¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: async () => {
                            // Mock API call - reemplazar con API real
                            await new Promise(resolve => setTimeout(resolve, 500));
                            Alert.alert("Éxito", "Usuario eliminado correctamente.");
                        }
                    }
                ]
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return '#ef4444';
            case 'VETERINARIAN': return '#3b82f6';
            case 'RECEPCIONIST': return '#f59e0b';
            case 'USER': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Administrador';
            case 'VETERINARIAN': return 'Veterinario';
            case 'RECEPCIONIST': return 'Recepcionista';
            case 'USER': return 'Usuario';
            default: return role;
        }
    };

    const renderUser = ({ item }: { item: User }) => (
        <View style={[styles.userCard, { backgroundColor: theme.surface }]}>
            <View style={styles.userHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>{item.full_name}</Text>
                    <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.email}</Text>
                    <View style={styles.userMeta}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                            <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                                {getRoleLabel(item.role)}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10b98120' : '#ef444420' }]}>
                            <Text style={[styles.statusText, { color: item.is_active ? '#10b981' : '#ef4444' }]}>
                                {item.is_active ? 'ACTIVO' : 'INACTIVO'}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={16} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.userActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton, { borderColor: theme.primary }]}
                    onPress={() => Alert.alert("Editar", "Función de edición de usuario - en desarrollo")}
                >
                    <Edit size={14} color={theme.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.statusButton]}
                    onPress={() => toggleUserStatus.mutate({ userId: item.id, isActive: !item.is_active })}
                    disabled={toggleUserStatus.isPending}
                >
                    {item.is_active ? <EyeOff size={14} color={theme.textMuted} /> : <Eye size={14} color={theme.primary} />}
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteUser.mutate(item.id)}
                    disabled={deleteUser.isPending}
                >
                    <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Users size={32} color={theme.primary} />
                    <View style={styles.headerText}>
                        <View style={styles.headerText}>
                        <Text style={[styles.title, { color: theme.text }]}>Gestión de Usuarios</Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Administra usuarios, roles y permisos del sistema</Text>
                    </View>
                    </View>
                </View>
            </View>

            {/* Search and Filters */}
            <View style={styles.searchSection}>
                <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Buscar usuarios..."
                        placeholderTextColor={theme.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['all', 'ADMIN', 'VETERINARIAN', 'RECEPCIONIST', 'USER'].map(role => (
                        <TouchableOpacity
                            key={role}
                            style={[
                                styles.filterChip,
                                filterRole === role && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setFilterRole(role)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: filterRole === role ? '#fff' : theme.textMuted }
                            ]}>
                                {role === 'all' ? 'Todos' : getRoleLabel(role)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsSection}>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Users size={24} color={theme.primary} />
                    <View style={styles.statContent}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>{users.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Usuarios</Text>
                    </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <ShieldCheck size={24} color="#10b981" />
                    <View style={styles.statContent}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>{users.filter(u => u.is_active).length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activos</Text>
                    </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                    <Plus size={24} color={theme.primary} />
                    <TouchableOpacity style={styles.statContent} onPress={() => Alert.alert("Nuevo Usuario", "Función de creación de usuario - en desarrollo")}>
                        <Text style={[styles.statNumber, { color: theme.primary }]}>+</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Nuevo Usuario</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Users List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando usuarios...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderUser}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.usersList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Users size={64} color={theme.textMuted} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay usuarios</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>No se encontraron usuarios con los filtros actuales</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    headerText: {
        flexDirection: 'column',
        alignItems: 'center',
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
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 20,
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    filterScroll: {
        maxWidth: width * 0.4,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statsSection: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 20,
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
        gap: 4,
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
    usersList: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    userCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        fontWeight: '500',
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '800',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '800',
    },
    moreButton: {
        padding: 4,
    },
    userActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    editButton: {
        backgroundColor: 'transparent',
    },
    statusButton: {
        backgroundColor: 'transparent',
    },
    deleteButton: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },
});
