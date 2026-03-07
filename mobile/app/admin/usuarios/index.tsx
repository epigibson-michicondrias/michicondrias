import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, FlatList, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { adminUsersService, AdminUser, UserStats } from '../../../src/services/adminUsers';
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

interface User extends AdminUser {
    // La interfaz AdminUser ya contiene todos los campos necesarios
}

export default function AdminUsersScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // API real de usuarios
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminUsersService.getUsers(),
    });

    const toggleUserStatus = useMutation({
        mutationFn: async (userId: string) => {
            return adminUsersService.toggleUserStatus(userId);
        },
        onSuccess: (data, variables) => {
            Alert.alert("Éxito", `Usuario ${data.is_active ? 'activado' : 'desactivado'} correctamente.`);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "No se pudo cambiar el estado del usuario");
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
                            return adminUsersService.deleteUser(userId);
                        }
                    }
                ]
            );
        },
        onSuccess: (data) => {
            Alert.alert("Éxito", "Usuario eliminado correctamente.");
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "No se pudo eliminar el usuario");
        }
    });

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role_name === filterRole;
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
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role_name || 'USER') + '20' }]}>
                            <Text style={[styles.roleText, { color: getRoleColor(item.role_name || 'USER') }]}>
                                {getRoleLabel(item.role_name || 'USER')}
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
                    <MoreVertical size={14} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.userActions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton, { borderColor: theme.primary }]}
                    onPress={() => Alert.alert("Editar", "Función de edición de usuario - en desarrollo")}
                >
                    <Edit size={12} color={theme.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.statusButton]}
                    onPress={() => toggleUserStatus.mutate(item.id)}
                    disabled={toggleUserStatus.isPending}
                >
                    {item.is_active ? <EyeOff size={12} color={theme.textMuted} /> : <Eye size={12} color={theme.primary} />}
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteUser.mutate(item.id)}
                    disabled={deleteUser.isPending}
                >
                    <Trash2 size={12} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            
            {/* Header Premium */}
            <View style={[styles.premiumHeader, { backgroundColor: theme.primary }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Gestión de Usuarios</Text>
                        <Text style={styles.subtitle}>Administra usuarios, roles y permisos del sistema</Text>
                    </View>
                    <View style={styles.headerIcon}>
                        <Users size={28} color="#fff" />
                    </View>
                </View>
            </View>

            {/* Search and Filters Premium */}
            <View style={styles.searchSection}>
                <View style={[styles.searchContainer, { backgroundColor: '#1f2937' }]}>
                    <Search size={16} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: '#f3f4f6' }]}
                        placeholder="Buscar usuarios..."
                        placeholderTextColor="#6b7280"
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
                                filterRole === role && styles.filterChipActive
                            ]}
                            onPress={() => setFilterRole(role)}
                        >
                            <Text style={[
                                styles.filterText,
                                filterRole === role && styles.filterTextActive
                            ]}>
                                {role === 'all' ? 'Todos' : getRoleLabel(role)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stats Section Premium */}
            <View style={styles.statsSection}>
                <View style={[styles.statCard, { backgroundColor: '#1f2937' }]}>
                    <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                        <Users size={18} color="#8b5cf6" />
                    </View>
                    <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>{users.length}</Text>
                    <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Total</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#1f2937' }]}>
                    <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                        <ShieldCheck size={18} color="#10b981" />
                    </View>
                    <Text style={[styles.statNumber, { color: '#f3f4f6' }]}>{users.filter(u => u.is_active).length}</Text>
                    <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Activos</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#1f2937' }]}>
                    <View style={[styles.statIcon, { backgroundColor: '#374151' }]}>
                        <Plus size={18} color="#3b82f6" />
                    </View>
                    <TouchableOpacity style={styles.statContent} onPress={() => Alert.alert("Nuevo Usuario", "Función de creación de usuario - en desarrollo")}>
                        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>+</Text>
                        <Text style={[styles.statLabel, { color: '#9ca3af' }]}>Nuevo</Text>
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
    container: { 
        flex: 1 
    },
    premiumHeader: {
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 20,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '500',
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    filterScroll: {
        maxWidth: width * 0.35,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#374151',
        marginRight: 6,
        backgroundColor: '#1f2937',
    },
    filterChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    filterText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9ca3af',
    },
    filterTextActive: {
        color: '#fff',
    },
    statsSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 10,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    statContent: {
        alignItems: 'center',
    },
    usersList: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    userCard: {
        borderRadius: 16,
        padding: 12,
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        fontWeight: '500',
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    roleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    roleText: {
        fontSize: 9,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 8,
        fontWeight: '700',
    },
    moreButton: {
        padding: 4,
    },
    userActions: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 12,
    },
    actionButton: {
        width: 32,
        height: 32,
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
