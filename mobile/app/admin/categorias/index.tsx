import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory, Category } from '@/src/services/ecommerce';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, Package, Edit2, Trash2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminCategoriasScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data: categories = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: getCategories,
    });

    const [formData, setFormData] = useState({ name: '', description: '' });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            Alert.alert("Éxito", "Categoría creada correctamente.");
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Category> }) => updateCategory(id, data),
        onSuccess: () => {
            Alert.alert("Éxito", "Categoría actualizada correctamente.");
            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            Alert.alert("Éxito", "Categoría eliminada.");
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const handleAction = (category?: Category) => {
        setEditingCategory(category || null);
        setFormData({
            name: category?.name || '',
            description: category?.description || '',
        });
        setModalVisible(true);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Eliminar Categoría",
            `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                <Package size={24} color={theme.primary} />
            </View>
            <View style={styles.cardInfo}>
                <Text style={[styles.categoryName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.categoryDesc, { color: theme.textMuted }]} numberOfLines={1}>
                    {item.description || "Sin descripción"}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleAction(item)} style={styles.actionBtn}>
                    <Edit2 size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
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
                        <Text style={styles.title}>Categorías</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Gestión de Catálogo</Text>
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
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Package size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay categorías creadas.</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.form}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>NOMBRE</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Ej: Juguetes, Consulta, etc."
                                placeholderTextColor={theme.textMuted}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />

                            <Text style={[styles.label, { color: theme.textMuted, marginTop: 16 }]}>DESCRIPCIÓN</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                placeholder="Breve detalle..."
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
                                    if (editingCategory) {
                                        updateMutation.mutate({ id: editingCategory.id, data: formData });
                                    } else {
                                        createMutation.mutate(formData);
                                    }
                                }}
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
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
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 100 
    },
    empty: { 
        alignItems: 'center', 
        marginTop: 60, 
        paddingHorizontal: 40 
    },
    emptyText: { 
        fontSize: 14, 
        fontWeight: '700', 
        marginTop: 20,
        textAlign: 'center' 
    },
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 24, 
        marginBottom: 16, 
        borderWidth: 1, 
        gap: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
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
    categoryName: { 
        fontSize: 16, 
        fontWeight: '900' 
    },
    categoryDesc: { 
        fontSize: 12, 
        fontWeight: '600', 
        marginTop: 4,
        lineHeight: 16,
    },
    actions: { 
        flexDirection: 'row', 
        gap: 8 
    },
    actionBtn: { 
        width: 40, 
        height: 40, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
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
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    submitBtnText: { 
        color: '#fff', 
        fontSize: 16, 
        fontWeight: '900' 
    }
});
