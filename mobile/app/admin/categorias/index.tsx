import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminCategories } from '@/src/hooks/admin/useAdminCategories';
import { Category } from '@/src/services/ecommerce';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Plus, Package, Edit2, Trash2, X } from 'lucide-react-native';

export default function AdminCategoriasScreen() {
    const { theme } = useTheme();
    const {
        categories,
        isLoading,
        isModalVisible,
        editingCategory,
        formData,
        setFormData,
        isSaving,
        handleAction,
        handleDelete,
        handleSubmit,
        closeModal,
    } = useAdminCategories();

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
        <ScreenContainer>
            <ScreenHeader
                title="Categorías"
                gradient={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                actionIcon={Plus}
                onAction={() => handleAction()}
            />

            {isLoading ? (
                <LoadingOverlay message="Cargando categorías..." />
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Package size={48} color={theme.textMuted} strokeWidth={1} />}
                            title="No hay categorías"
                            subtitle="No hay categorías creadas."
                        />
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
                            <TouchableOpacity onPress={closeModal}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        
                        <KeyboardScreen>
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
                                disabled={isSaving}
                                onPress={handleSubmit}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitBtnText}>
                                        {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
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
