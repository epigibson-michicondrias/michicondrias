import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Modal, KeyboardAvoidingView, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminUsers } from '@/src/hooks/admin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import { AdminUser } from '@/src/services/adminUsers';
import {
    Users,
    ShieldCheck,
    XCircle,
    Mail,
    Edit,
    Trash2,
    UserPlus,
    Eye,
    EyeOff,
    Check
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ROLE_IDS, ROLE_COLORS, getRoleName } from '@/src/constants/roles';
import { showAlert } from '@/src/components/AppAlert';

export default function AdminUsersScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();
    const {
        users,
        filteredUsers,
        activeCount,
        isLoading,
        isFetching,
        refetch,
        searchText,
        setSearchText,
        filterRole,
        setFilterRole,
        modalVisible,
        editingUser,
        formData,
        setFormData,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,
        toggleUserStatus,
        createUserMutation,
        updateUserMutation,
        handleDeletePress,
        getRoleColorLocal,
        getRoleLabelLocal,
    } = useAdminUsers();

    const renderUser = ({ item }: { item: AdminUser }) => (
        <TouchableOpacity 
            activeOpacity={0.7}
            style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => showAlert({ type: 'info', title: 'Detalles', message: `Viendo detalles de ${item.full_name}` })}
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
                        onPress={() => openEditModal(item)}
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
        <ScreenContainer>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <ScreenHeader
                title="Usuarios"
                subtitle={`${users.length} Registrados`}
                gradient={[theme.primary, theme.primary + 'DD', theme.primary + 'AA']}
                actionIcon={UserPlus}
                onAction={openCreateModal}
            />

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
                        <Text style={[styles.statVal, { color: theme.text }]}>{activeCount}</Text>
                        <Text style={[styles.statLab, { color: theme.textMuted }]}>Activos</Text>
                    </View>
                </View>
            </View>

            {/* Search and Filters */}
            <View style={styles.searchSection}>
                <SearchBar
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Buscar nombre o email..."
                />
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
            <DataList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando usuarios..."
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                emptyIcon={<Users size={48} color={theme.textMuted} strokeWidth={1} />}
                emptyTitle="No hay usuarios"
                emptySubtitle="No se encontraron usuarios con los filtros actuales"
                contentStyle={styles.usersList}
            />

            {/* Modal de Formulario */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
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
                                <TouchableOpacity onPress={closeModal}>
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
                                    onPress={closeModal}
                                >
                                    <Text style={[styles.btnText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.submitBtn, { backgroundColor: theme.primary }]}
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    onPress={handleSubmit}
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
