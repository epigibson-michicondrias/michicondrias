import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminRoles, Role } from '@/src/hooks/admin/useAdminRoles';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Shield, Plus, Edit3, Trash2, X } from 'lucide-react-native';

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
                <TouchableOpacity 
                    style={styles.editBtn}
                    onPress={() => handleAction(item)}
                >
                    <Edit3 size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.editBtn}
                    onPress={() => handleDelete(item.id, item.name)}
                >
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Roles"
                subtitle="Gestión de Permisos"
                gradient={['#ef4444', '#ef4444E6', '#ef4444CC']}
                actionIcon={Plus}
                onAction={() => handleAction()}
            />

            {isLoading ? (
                <LoadingOverlay message="Cargando roles..." />
            ) : (
                <FlatList
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
                            <TouchableOpacity onPress={closeModal}>
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

                            <Text style={[styles.label, { color: theme.textMuted, marginTop: 16 }]}>DESCRIPCIÓN</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Breve descripción de permisos..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={3}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                            />

                            <TouchableOpacity 
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
        padding: 20, 
        paddingBottom: 100,
        paddingTop: 12 
    },
    card: { 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        padding: 20, 
        borderRadius: 28, 
        marginBottom: 16, 
        borderWidth: 1.5, 
        gap: 16,
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
        fontSize: 17, 
        fontWeight: '900' 
    },
    roleDesc: { 
        fontSize: 12, 
        fontWeight: '600', 
        marginTop: 6, 
        lineHeight: 18 
    },
    badgeRow: { 
        flexDirection: 'row', 
        marginTop: 14 
    },
    countBadge: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 10 
    },
    countText: { 
        fontSize: 10, 
        fontWeight: '800' 
    },
    actions: { flexDirection: 'row', gap: 4 },
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end' 
    },
    modalContent: { 
        borderTopLeftRadius: 32, 
        borderTopRightRadius: 32, 
        padding: 28, 
        paddingBottom: 40,
        elevation: 20,
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 28 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: '900',
        letterSpacing: -0.5 
    },
    form: { gap: 12 },
    label: { 
        fontSize: 11, 
        fontWeight: '900', 
        letterSpacing: 1.2,
        marginLeft: 4,
    },
    input: { 
        borderRadius: 18, 
        padding: 18, 
        borderWidth: 1.5, 
        fontSize: 15,
        fontWeight: '600' 
    },
    textArea: { 
        height: 120, 
        textAlignVertical: 'top' 
    },
    submitBtn: { 
        borderRadius: 18, 
        padding: 20, 
        alignItems: 'center', 
        marginTop: 24, 
        elevation: 6,
    },
    submitBtnText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: '900' 
    },
    editBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    }
});
