import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { useInventory } from '@/src/hooks/clinica/useInventory';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Package, AlertTriangle, PlusCircle, Box, Search, X } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function InventarioScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        showSearch, searchQuery, setSearchQuery, modalVisible, setModalVisible,
        loadingAction, newItem, setNewItem, isLoading, criticalItems,
        filteredInventory, toggleSearch, handleSaveItem,
        editModalVisible, setEditModalVisible, editingItem, setEditingItem,
        handleEditItem, handleUpdateItem, handleDeleteItem, isUpdating, isDeleting,
    } = useInventory();

    if (isLoading) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando inventario..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Inventario Médico"
                actions={[{ icon: showSearch ? X : Search, label: showSearch ? 'Cerrar búsqueda' : 'Buscar en el inventario', onPress: toggleSearch }]}
            />

            {showSearch && (
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Buscar en el inventario..."
                    />
                </View>
            )}

            <KeyboardScreen>
                <View style={styles.content}>
                    
                    {/* Critical Alerts Dashboard */}
                    {criticalItems.length > 0 && (
                        <View style={styles.alertSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Atención Inmediata</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
                                {criticalItems.map(item => (
                                    <View key={item.id} style={[styles.criticalCard, { backgroundColor: theme.error + '15', borderColor: theme.error + '50' }]}>
                                        <View style={styles.criticalIconBox}>
                                            <AlertTriangle size={20} color={theme.error} />
                                        </View>
                                        <View>
                                            <Text style={[styles.criticalName, { color: theme.text }]}>{item.name}</Text>
                                            <Text style={[styles.criticalStock, { color: theme.error }]}>Quedan: {item.currentStock} {item.unit}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Inventory Actions */}
                    <View style={styles.actionsRow}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Catálogo General</Text>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Agregar producto al inventario"
                            style={[styles.addBtn, { backgroundColor: theme.primary + '15' }]}
                            onPress={() => setModalVisible(true)}
                        >
                            <PlusCircle size={16} color={theme.primary} />
                            <Text style={[styles.addBtnText, { color: theme.primary }]}>Nuevo Producto</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Inventory List */}
                    {filteredInventory.length === 0 ? (
                        <EmptyState
                            icon={<Box size={40} color={theme.textMuted} />}
                            title={searchQuery ? "No hay resultados para tu búsqueda" : "No hay productos en inventario"}
                        />
                    ) : (
                        filteredInventory.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Editar ${item.name}, ${item.currentStock} ${item.unit}`}
                                onPress={() => handleEditItem(item)}
                                style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            >
                                <View style={[styles.itemIcon, { backgroundColor: theme.secondary + '15' }]}>
                                    <Package size={22} color={theme.secondary} />
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={[styles.itemCategory, { color: theme.textMuted }]}>{item.category || 'Sin categoría'}</Text>
                                </View>
                                <View style={styles.stockInfo}>
                                    <Text style={[styles.stockValue, { color: item.currentStock <= item.minStock ? theme.error : theme.success }]}>
                                        {item.currentStock}
                                    </Text>
                                    <Text style={[styles.stockUnit, { color: theme.textMuted }]}>{item.unit}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </KeyboardScreen>

            {/* Add Item Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo Producto</Text>
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <FormField label="Nombre del Producto *" value={newItem.name} onChangeText={t => setNewItem({...newItem, name: t})} placeholder="Ej. Amoxicilina 500mg" />

                            <FormField label="Categoría" value={newItem.category ?? ''} onChangeText={t => setNewItem({...newItem, category: t})} placeholder="Ej. Antibióticos" />

                            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                                <View style={{ flex: 1 }}>
                                    <FormField label="Stock Inicial" value={newItem.currentStock?.toString() ?? ''} onChangeText={t => setNewItem({...newItem, currentStock: parseInt(t) || 0})} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormField label="Stock Mínimo" value={newItem.minStock?.toString() ?? ''} onChangeText={t => setNewItem({...newItem, minStock: parseInt(t) || 0})} keyboardType="numeric" />
                                </View>
                            </View>

                            <FormField label="Unidad de medida *" value={newItem.unit ?? ''} onChangeText={t => setNewItem({...newItem, unit: t})} placeholder="ml, mg, frasco, caja..." />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.surface }]} onPress={() => setModalVisible(false)} accessibilityRole="button" accessibilityLabel="Cancelar">
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <Button label="Guardar" onPress={handleSaveItem} loading={loadingAction} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Item Modal */}
            <Modal visible={editModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Producto</Text>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            <FormField label="Nombre *" value={editingItem?.name || ''} onChangeText={t => setEditingItem({ ...editingItem, name: t })} />
                            <FormField label="Categoría" value={editingItem?.category || ''} onChangeText={t => setEditingItem({ ...editingItem, category: t })} />
                            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                                <View style={{ flex: 1 }}>
                                    <FormField label="Stock actual" value={String(editingItem?.currentStock ?? 0)} onChangeText={t => setEditingItem({ ...editingItem, currentStock: Math.max(0, parseInt(t) || 0) })} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormField label="Stock mínimo" value={String(editingItem?.minStock ?? 0)} onChangeText={t => setEditingItem({ ...editingItem, minStock: Math.max(0, parseInt(t) || 0) })} keyboardType="numeric" />
                                </View>
                            </View>
                            <FormField label="Unidad de medida" value={editingItem?.unit || ''} onChangeText={t => setEditingItem({ ...editingItem, unit: t })} />
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Eliminar producto del inventario"
                                disabled={isDeleting}
                                onPress={() => editingItem?.id && handleDeleteItem(editingItem.id)}
                                style={{ marginTop: spacing.xl, alignItems: 'center', paddingVertical: spacing.md }}
                            >
                                <Text style={{ color: theme.error, fontWeight: '800' }}>Eliminar producto</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { backgroundColor: theme.surface }]}
                                onPress={() => { setEditModalVisible(false); setEditingItem(null); }}
                                accessibilityRole="button"
                                accessibilityLabel="Cancelar"
                            >
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <Button label="Guardar" onPress={handleUpdateItem} loading={isUpdating} />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { padding: spacing.xxl, paddingBottom: 100 },
    sectionTitle: { fontSize: font.lg, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.lg },
    alertSection: { marginBottom: spacing.xxxl },
    criticalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        gap: spacing.md,
        minWidth: 200,
    },
    criticalIconBox: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    criticalName: { fontSize: font.base, fontWeight: '800' },
    criticalStock: { fontSize: font.md, fontWeight: '700', color: '#ef4444', marginTop: spacing.xxs },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12
    },
    addBtnText: { fontSize: font.md, fontWeight: '800' },
    itemCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: spacing.lg, borderRadius: 20, borderWidth: 1,
        marginBottom: spacing.md, gap: spacing.lg
    },
    itemIcon: {
        width: 46, height: 46, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center'
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: font.lg, fontWeight: '800' },
    itemCategory: { fontSize: font.md, fontWeight: '600', marginTop: spacing.xxs },
    stockInfo: { alignItems: 'flex-end' },
    stockValue: { fontSize: font.h3, fontWeight: '900' },
    stockUnit: { fontSize: font.sm, fontWeight: '700', textTransform: 'uppercase' },
    searchContainer: { marginTop: spacing.lg, paddingHorizontal: layout.screenPadding },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: spacing.xxl, paddingBottom: spacing.huge, maxHeight: '80%' },
    modalTitle: { fontSize: font.h3, fontWeight: '900', marginBottom: spacing.xl },
    inputLabel: { fontSize: font.md, fontWeight: '700', marginBottom: spacing.sm, marginTop: spacing.lg },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.lg, fontSize: font.lg, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxxl },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: font.lg, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
});
