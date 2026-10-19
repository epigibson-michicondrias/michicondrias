import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminRoles, Role } from '@/src/hooks/admin/useAdminRoles';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Shield, Plus, Edit3, Trash2, X } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing } from '@/constants/design';

export default function AdminRolesScreen() {
    const { theme } = useTheme();
    const {
        roles,
        isLoading,
        isModalVisible,
        editingRole,
        formData,
        setFormData,
        isSaving,
        handleAction,
        handleDelete,
        handleSubmit,
        closeModal,
    } = useAdminRoles();

    const renderItem = ({ item }: { item: Role }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: (item.color || '#64748b') + '15' }]}>
                <Shield size={24} color={item.color || theme.primary} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={[styles.roleName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.roleDesc, { color: theme.textMuted }]}>{item.description}</Text>
                <View style={styles.badgeRow}>
                    <View style={[styles.countBadge, { backgroundColor: theme.background }]}>
                        <Text style={[styles.countText, { color: theme.text }]}>{item.users_count} Usuarios</Text>
                    </View>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity accessibilityRole="button" 
                    style={styles.editBtn}
                    onPress={() => handleAction(item)}
                >
                    <Edit3 size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" 
                    style={styles.editBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Trash2 size={18} color={theme.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Roles"
                subtitle="Gestión de Permisos"
                actionIcon={Plus}
                actionLabel="Nuevo rol"
                onAction={() => handleAction()}
            />

            {isLoading ? (
                <LoadingOverlay message="Cargando roles..." />
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={roles}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            )}

            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                            </Text>
                            <TouchableOpacity accessibilityRole="button" onPress={closeModal}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <KeyboardScreen>
                        <View style={styles.form}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>NOMBRE</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Ej: Administrador, Soporte, etc."
                                placeholderTextColor={theme.textMuted}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <Text style={[styles.label, { color: theme.textMuted, marginTop: spacing.lg }]}>DESCRIPCIÓN</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Breve descripción de permisos..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={3}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                            />

                            <TouchableOpacity accessibilityRole="button" 
                                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                                disabled={isSaving}
                                onPress={handleSubmit}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        </KeyboardScreen>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { 
        padding: spacing.xl, 
        paddingBottom: 100,
        paddingTop: spacing.md 
    },
    card: { 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        padding: spacing.xl, 
        borderRadius: 28, 
        marginBottom: spacing.lg, 
        borderWidth: 1.5, 
        gap: spacing.lg,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    iconBox: { 
        width: 52, 
        height: 52, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 1,
    },
    cardInfo: { flex: 1 },
    roleName: { 
        fontSize: font.xxl, 
        fontWeight: '800' 
    },
    roleDesc: { 
        fontSize: font.md, 
        fontWeight: '600', 
        marginTop: spacing.sm, 
        lineHeight: 18 
    },
    badgeRow: { 
        flexDirection: 'row', 
        marginTop: spacing.lg 
    },
    countBadge: { 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderRadius: 10 
    },
    countText: { 
        fontSize: font.xs, 
        fontWeight: '800' 
    },
    actions: { flexDirection: 'row', gap: spacing.xs },
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: spacing.xxxl, 
        paddingBottom: spacing.huge,
        elevation: 20,
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: spacing.xxxl 
    },
    modalTitle: { 
        fontSize: font.h2, 
        fontWeight: '800',
        letterSpacing: -0.5 
    },
    form: { gap: spacing.md },
    label: { 
        fontSize: font.sm, 
        fontWeight: '800', 
        letterSpacing: 1.2,
        marginLeft: spacing.xs,
    },
    input: { 
        borderRadius: 18, 
        padding: spacing.xl, 
        borderWidth: 1.5, 
        fontSize: font.lg,
        fontWeight: '600' 
    },
    textArea: { 
        height: 120, 
        textAlignVertical: 'top' 
    },
    submitBtn: { 
        borderRadius: 18, 
        padding: spacing.xl, 
        alignItems: 'center', 
        marginTop: spacing.xxl, 
        elevation: 6,
    },
    submitBtnText: { 
        color: '#fff', 
        fontSize: font.xl, 
        fontWeight: '800' 
    },
    editBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    }
});
