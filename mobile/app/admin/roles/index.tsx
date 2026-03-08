import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/src/services/adminUsers';
import { Modal, TextInput } from 'react-native';
import { useState } from 'react';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Shield, ShieldCheck, ShieldAlert, Plus, Edit3, Trash2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Role = {
    id: string;
    name: string;
    description: string;
    users_count: number;
    color: string;
};

export default function AdminRolesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const queryClient = useQueryClient();
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminUsersService.getRoles(),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => adminUsersService.createRole(data),
        onSuccess: () => {
            Alert.alert("Éxito", "Rol creado correctamente.");
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => adminUsersService.updateRole(id, data),
        onSuccess: () => {
            Alert.alert("Éxito", "Rol actualizado correctamente.");
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUsersService.deleteRole(id),
        onSuccess: () => {
            Alert.alert("Éxito", "Rol eliminado.");
            queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const handleAction = (role?: Role) => {
        setEditingRole(role || null);
        setFormData({
            name: role?.name || '',
            description: role?.description || '',
        });
        setModalVisible(true);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Eliminar Rol",
            `¿Estás seguro de eliminar "${name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={['#ef4444', '#ef4444E6', '#ef4444CC']}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Roles</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Gestión de Permisos</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => handleAction()}
                    >
                        <Plus size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
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
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        
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
                                disabled={createMutation.isPending || updateMutation.isPending}
                                onPress={() => {
                                    if (editingRole) {
                                        updateMutation.mutate({ id: editingRole.id, data: formData });
                                    } else {
                                        createMutation.mutate(formData);
                                    }
                                }}
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        paddingHorizontal: 24, 
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#fff', 
        letterSpacing: -0.5 
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    liveDot: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        backgroundColor: '#10b981' 
    },
    subtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.8)',
    },
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
