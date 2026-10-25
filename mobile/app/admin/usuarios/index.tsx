import Button from '@/src/components/Button';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Modal, KeyboardAvoidingView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminUsers } from '@/src/hooks/admin/useAdminUsers';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import IconButton from '@/src/components/IconButton';
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
import { getRoleName, ALL_ROLES } from '@/src/constants/roles';
import { families, font, spacing, tint } from '@/constants/design';

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
        roleOptions,
        getRoleColorLocal,
        getRoleLabelLocal,
    } = useAdminUsers();

    const renderUser = ({ item }: { item: AdminUser }) => (
        <View style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.userHeader}>
                <LinearGradient
                    colors={theme.heroGradient}
                    style={styles.avatar}
                >
                    <Text style={[styles.avatarText, { color: theme.onPrimary }]}>{item.full_name.charAt(0).toUpperCase()}</Text>
                </LinearGradient>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{item.full_name}</Text>
                    <View style={styles.emailRow}>
                        <Mail size={10} color={theme.textMuted} style={{ marginRight: spacing.xs }} />
                        <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>{item.email}</Text>
                    </View>
                    <View style={styles.userMeta}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColorLocal(getRoleName(item.role_id, item.role_name)) + '15' }]}>
                            <Text style={[styles.roleText, { color: getRoleColorLocal(getRoleName(item.role_id, item.role_name)) }]}>
                                {getRoleLabelLocal(getRoleName(item.role_id, item.role_name))}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: item.is_active ? theme.success + '15' : theme.error + '15' }]}>
                            <View style={[styles.statusDot, { backgroundColor: item.is_active ? theme.success : theme.error }]} />
                            <Text style={[styles.statusText, { color: item.is_active ? theme.success : theme.error }]}>
                                {item.is_active ? 'Activo' : 'Inactivo'}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <IconButton
                        icon={item.is_active ? EyeOff : Eye}
                        accessibilityLabel={item.is_active ? `Desactivar a ${item.full_name}` : `Activar a ${item.full_name}`}
                        onPress={() => toggleUserStatus.mutate(item.id)}
                        disabled={toggleUserStatus.isPending}
                        size="sm"
                    />
                    <IconButton icon={Edit} accessibilityLabel={`Editar a ${item.full_name}`} onPress={() => openEditModal(item)} size="sm" />
                    <IconButton icon={Trash2} accessibilityLabel={`Eliminar a ${item.full_name}`} onPress={() => handleDeletePress(item.id, item.full_name)} color={theme.error} size="sm" />
                </View>
            </View>
        </View>
    );

    return (
        <ScreenContainer>

            <ScreenHeader
                title="Usuarios"
                subtitle={`${users.length} Registrados`}
                actionIcon={UserPlus}
                actionLabel="Nuevo usuario"
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
                    <View style={[styles.iconCircle, { backgroundColor: theme.success + tint.faint }]}>
                        <ShieldCheck size={16} color={theme.success} />
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
                    {['all', ...ALL_ROLES, 'unassigned'].map(role => (
                        <TouchableOpacity accessibilityRole="button"
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
                                filterRole === role && { color: theme.onPrimary }
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
                                <TouchableOpacity accessibilityRole="button" onPress={closeModal}>
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

                                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>Correo electrónico</Text>
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
                                    {roleOptions.map((role) => (
                                        <TouchableOpacity accessibilityRole="button"
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
                                                formData.role_id === role.id && { color: role.color, fontFamily: families.extrabold }
                                            ]}>
                                                {role.label}
                                            </Text>
                                            {formData.role_id === role.id && <Check size={14} color={role.color} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity accessibilityRole="button" 
                                    style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.border }]}
                                    onPress={closeModal}
                                >
                                    <Text style={[styles.btnText, { color: theme.textMuted }]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity accessibilityRole="button" 
                                    style={[styles.modalBtn, styles.submitBtn, { backgroundColor: theme.primary }]}
                                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                                    onPress={handleSubmit}
                                >
                                    {(createUserMutation.isPending || updateUserMutation.isPending) ? (
                                        <ActivityIndicator color={theme.onPrimary} size="small" />
                                    ) : (
                                        <Text style={[styles.btnText, { color: theme.onPrimary }]}>
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
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 4,
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    statVal: {
        fontSize: font.xl,
        fontFamily: families.extrabold,
    },
    statLab: {
        fontSize: font.xs,
        fontFamily: families.semibold,
        textTransform: 'uppercase',
    },
    searchSection: {
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    filterSection: {
        marginBottom: spacing.xl,
    },
    filterScrollContent: {
        paddingHorizontal: spacing.xl,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        fontSize: font.md,
        fontFamily: families.bold,
    },
    usersList: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.huge,
    },
    userCard: {
        borderRadius: 24,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        elevation: 3,
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
        marginRight: spacing.lg,
    },
    avatarText: {
        fontSize: font.xxl,
        fontFamily: families.extrabold,
        
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
        marginRight: spacing.sm,
    },
    userName: {
        fontSize: font.xl,
        fontFamily: families.extrabold,
        marginBottom: spacing.xxs,
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    userEmail: {
        fontSize: font.md,
        fontFamily: families.medium,
    },
    userMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    roleBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    roleText: {
        fontSize: font.xs,
        fontFamily: families.extrabold,
        textTransform: 'uppercase',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        gap: spacing.sm,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: font.xs,
        fontFamily: families.extrabold,
        textTransform: 'uppercase',
    },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.xs,
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
        maxHeight: '90%',
        overflow: 'hidden',
        width: '100%',
    },
    modalInner: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: spacing.xxl,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    modalTitle: {
        fontSize: font.h3,
        fontFamily: families.extrabold,
    },
    modalForm: {
        marginBottom: spacing.xxl,
    },
    inputLabel: {
        fontSize: font.sm,
        fontFamily: families.extrabold,
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
    },
    modalInput: {
        height: 54,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        fontSize: font.lg,
        fontFamily: families.semibold,
        borderWidth: 1,
    },
    rolePickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
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
        fontSize: font.base,
        fontFamily: families.bold,
        flex: 1,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: spacing.md,
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
    },
    btnText: {
        fontSize: font.lg,
        fontFamily: families.extrabold,
    },
});
