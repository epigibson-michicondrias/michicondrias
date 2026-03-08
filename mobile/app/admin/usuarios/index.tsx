import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, FlatList, TextInput, StatusBar, SafeAreaView, Platform, RefreshControl, Modal, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    EyeOff,
    Heart,
    Lock,
    Settings,
    ChevronRight,
    LogOut,
    Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ROLE_IDS, ROLE_NAMES, ROLE_COLORS, getRoleName } from '@/src/constants/roles';

const { width } = Dimensions.get('window');

interface User extends AdminUser {
    // La interfaz AdminUser ya contiene todos los campos necesarios
}

export default function AdminUsersScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_id: ROLE_IDS.CONSUMIDOR as string,
    });

    // API real de usuarios
    const { data: users = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminUsersService.getUsers(),
    });

    const toggleUserStatus = useMutation({
        mutationFn: async (userId: string) => {
            return adminUsersService.toggleUserStatus(userId);
        },
        onSuccess: (data) => {
            Alert.alert("Éxito", `Usuario ${data.is_active ? 'activado' : 'desactivado'} correctamente.`);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "No se pudo cambiar el estado del usuario");
        }
    });

    const createUserMutation = useMutation({
        mutationFn: (data: any) => adminUsersService.createUser(data),
        onSuccess: () => {
            Alert.alert("Éxito", "Usuario creado correctamente.");
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message || "No se pudo crear el usuario")
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => adminUsersService.updateUser(id, data),
        onSuccess: () => {
            Alert.alert("Éxito", "Usuario actualizado correctamente.");
            setModalVisible(false);
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message || "No se pudo actualizar el usuario")
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return adminUsersService.deleteUser(userId);
        },
        onSuccess: () => {
            Alert.alert("Éxito", "Usuario eliminado correctamente.");
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "No se pudo eliminar el usuario");
        }
    });

    const handleDeletePress = (userId: string, name: string) => {
        Alert.alert(
            "Eliminar Usuario",
            `¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => deleteUserMutation.mutate(userId)
                }
            ]
        );
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchText.toLowerCase());
        
        const userRoleName = getRoleName(user.role_id, user.role_name).toLowerCase();
        
        // Normalización para que coincida con las llaves del filtro
        let normalizedUserRole = userRoleName;
        if (userRoleName === 'veterinarian') normalizedUserRole = 'veterinario';
        if (userRoleName === 'user' || userRoleName === 'usuario') normalizedUserRole = 'consumidor';
        if (userRoleName === 'desconocido') normalizedUserRole = 'unassigned';

        const matchesRole = filterRole === 'all' || normalizedUserRole === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleColorLocal = (role: string) => {
        if (!role || role === 'unassigned' || role === 'desconocido') return '#6b7280';
        const normalizedRole = role.toLowerCase();
        if (normalizedRole === 'veterinarian') return ROLE_COLORS.veterinario;
        if (normalizedRole === 'user') return ROLE_COLORS.consumidor;
        return ROLE_COLORS[normalizedRole as keyof typeof ROLE_COLORS] || "#6b7280";
    };

    const getRoleLabelLocal = (role: string) => {
        if (!role || role === 'unassigned' || role === 'desconocido') return 'Sin Rol';
        const normalizedRole = role.toLowerCase();
        switch (normalizedRole) {
            case 'admin': return 'Administrador';
            case 'veterinario':
            case 'veterinarian': return 'Veterinario';
            case 'paseador': return 'Paseador';
            case 'consumidor':
            case 'user': return 'Usuario';
            default: return role;
        }
    };

    const renderUser = ({ item }: { item: User }) => (
        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => Alert.alert("Detalles", `Viendo detalles de ${item.full_name}`)}
        > 
            <View style={styles.userHeader}>
                <LinearGradient
                    colors={[theme.primary, theme.primary + 'CC']}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>{item.full_name.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]}>{item.full_name}</Text>
                    <View style={styles.emailRow}>
                        <Mail size={10} color={theme.textMuted} style={{ marginRight: 4 }} />
                        <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.email}</Text>
                    </View>
                    <View style={styles.userMeta}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColorLocal(getRoleName(item.role_id, item.role_name)) + '15' }]}>
                            <Text style={[styles.roleText, { color: getRoleColorLocal(getRoleName(item.role_id, item.role_name)) }]}>
                                {getRoleLabelLocal(getRoleName(item.role_id, item.role_name))}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10b98115' : '#ef444415' }]}>
                            <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#10b981' : '#ef4444' }]} />
                            <Text style={[styles.statusText, { color: item.is_active ? '#10b981' : '#ef4444' }]}>
                                {item.is_active ? 'Activo' : 'Inactivo'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionIconButton, { backgroundColor: theme.backgroundSecondary }]}
                        onPress={() => toggleUserStatus.mutate(item.id)}
                        disabled={toggleUserStatus.isPending}
                    >
                        {item.is_active ? <EyeOff size={14} color={theme.textMuted} /> : <Eye size={14} color={theme.primary} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionIconButton, { backgroundColor: theme.backgroundSecondary }]}
                        onPress={() => {
                            setEditingUser(item);
                            setFormData({
                                full_name: item.full_name,
                                email: item.email,
                                password: '',
                                role_id: item.role_id || ROLE_IDS.CONSUMIDOR,
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Edit size={14} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionIconButton, { backgroundColor: theme.backgroundSecondary }]}
                        onPress={() => handleDeletePress(item.id, item.full_name)}
                    >
                        <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            
            {/* Header Premium */}
            <LinearGradient
                colors={[theme.primary, theme.primary + 'DD', theme.primary + 'AA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.premiumHeader, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Usuarios</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveBadge} />
                            <Text style={styles.subtitle}>{users.length} Registrados</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.headerIcon}
                        onPress={() => {
                            setEditingUser(null);
                            setFormData({
                                full_name: '',
                                email: '',
                                password: '',
                                role_id: ROLE_IDS.CONSUMIDOR,
                            });
                            setModalVisible(true);
                        }}
                    >
                        <UserPlus size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Stats Cards Section */}
            <View style={styles.statsContainer}>
                <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                        <Users size={16} color={theme.primary} />
                    </View>
                    <View>
                        <Text style={[styles.statVal, { color: theme.text }]}>{users.length}</Text>
                        <Text style={[styles.statLab, { color: theme.textMuted }]}>Total</Text>
                    </View>
                </View>
                
                <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={[styles.iconCircle, { backgroundColor: '#10b98115' }]}>
                        <ShieldCheck size={16} color="#10b981" />
                    </View>
                    <View>
                        <Text style={[styles.statVal, { color: theme.text }]}>{users.filter(u => u.is_active).length}</Text>
                        <Text style={[styles.statLab, { color: theme.textMuted }]}>Activos</Text>
                    </View>
                </View>
            </View>

            {/* Search and Filters Premium */}
            <View style={styles.searchSection}>
                <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Search size={18} color={theme.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Buscar nombre o email..."
                        placeholderTextColor={theme.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <XCircle size={16} color={theme.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.filterSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
                    {['all', 'admin', 'veterinario', 'paseador', 'consumidor', 'unassigned'].map(role => (
                        <TouchableOpacity
                            key={role}
                            style={[
                                styles.filterChip,
                                { backgroundColor: theme.surface, borderColor: theme.border },
                                filterRole === role && { backgroundColor: theme.primary, borderColor: theme.primary }
                            ]}
                            onPress={() => setFilterRole(role)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: theme.textMuted },
                                filterRole === role && { color: '#fff' }
                            ]}>
                                {role === 'all' ? 'Todos' : getRoleLabelLocal(role)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
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
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={() => refetch()}
                            tintColor={theme.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Users size={64} color={theme.textMuted} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No hay usuarios</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>No se encontraron usuarios con los filtros actuales</Text>
                        </View>
                    }
                />
            )}

            {/* Modal de Formulario */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContent}
                    >
                        <View style={[styles.modalInner, { backgroundColor: theme.surface }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <XCircle size={24} color={theme.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
                                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>NOMBRE COMPLETO</Text>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                                    value={formData.full_name}
                                    onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                                    placeholder="Ej. Juan Pérez"
                                    placeholderTextColor={theme.textMuted}
                                />

                                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>EMAIL</Text>
                                <TextInput
                                    style={[styles.modalInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    placeholder="email@ejemplo.com"
                                    placeholderTextColor={theme.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                {!editingUser && (
                                    <>
                                        <Text style={[styles.inputLabel, { color: theme.textMuted }]}>CONTRASEÑA</Text>
                                        <TextInput
                                            style={[styles.modalInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                                            value={formData.password}
                                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                                            placeholder="Mínimo 6 caracteres"
                                            placeholderTextColor={theme.textMuted}
                                            secureTextEntry
                                        />
                                    </>
                                )}

                                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>ROL DE USUARIO</Text>
                                <View style={styles.rolePickerGrid}>
                                    {[
                                        { id: ROLE_IDS.ADMIN, label: 'Admin', color: ROLE_COLORS.admin },
                                        { id: ROLE_IDS.VETERINARIO, label: 'Veterinario', color: ROLE_COLORS.veterinario },
                                        { id: ROLE_IDS.PASEADOR, label: 'Paseador', color: ROLE_COLORS.paseador },
                                        { id: ROLE_IDS.CONSUMIDOR, label: 'Usuario', color: ROLE_COLORS.consumidor },
                                    ].map((role) => (
                                        <TouchableOpacity
                                            key={role.id}
                                            style={[
                                                styles.roleOption,
                                                { borderColor: theme.border },
                                                formData.role_id === role.id && { backgroundColor: role.color + '20', borderColor: role.color }
                                            ]}
                                            onPress={() => setFormData({ ...formData, role_id: role.id })}
                                        >
                                            <View style={[styles.roleDot, { backgroundColor: role.color }]} />
                                            <Text style={[
                                                styles.roleOptionText, 
                                                { color: theme.textMuted },
                                                formData.role_id === role.id && { color: role.color, fontWeight: '800' }
                                            ]}>
                                                {role.label}
                                            </Text>
                                            {formData.role_id === role.id && <Check size={14} color={role.color} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.border }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={[styles.btnText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.submitBtn, { backgroundColor: theme.primary }]}
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    onPress={() => {
                                        if (editingUser) {
                                            updateUserMutation.mutate({ 
                                                id: editingUser.id, 
                                                data: {
                                                    full_name: formData.full_name,
                                                    email: formData.email,
                                                    role_id: formData.role_id
                                                }
                                            });
                                        } else {
                                            createUserMutation.mutate(formData);
                                        }
                                    }}
                                >
                                    {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={[styles.btnText, { color: '#fff' }]}>
                                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    premiumHeader: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.5,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    liveBadge: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
        marginRight: 6,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '600',
    },
    headerIcon: {
        padding: 10,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: -12,
        gap: 12,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statVal: {
        fontSize: 16,
        fontWeight: '800',
    },
    statLab: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    filterSection: {
        marginBottom: 20,
    },
    filterScrollContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '700',
    },
    usersList: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userCard: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        borderWidth: 1,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
        marginBottom: 2,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userEmail: {
        fontSize: 12,
        fontWeight: '500',
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionIconButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        maxHeight: '90%',
    },
    modalInner: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    modalForm: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 8,
        marginTop: 16,
    },
    modalInput: {
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontWeight: '600',
        borderWidth: 1,
    },
    rolePickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 4,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        minWidth: '45%',
    },
    roleDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    roleOptionText: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        borderWidth: 1,
    },
    submitBtn: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    btnText: {
        fontSize: 15,
        fontWeight: '800',
    },
});
