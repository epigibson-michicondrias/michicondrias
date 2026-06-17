import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useInventory } from '@/src/hooks/clinica/useInventory';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Package, AlertTriangle, PlusCircle, Box, Search, X } from 'lucide-react-native';

export default function InventarioScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        showSearch, searchQuery, setSearchQuery, modalVisible, setModalVisible,
        loadingAction, newItem, setNewItem, isLoading, criticalItems,
        filteredInventory, toggleSearch, handleSaveItem,
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
                gradient={['#8b5cf6', '#7c3aed', '#6d28d9']}
                rightElement={
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                        onPress={toggleSearch}
                    >
                        {showSearch ? <X size={20} color="#fff" /> : <Search size={20} color="#fff" />}
                    </TouchableOpacity>
                }
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
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {criticalItems.map(item => (
                                    <View key={item.id} style={[styles.criticalCard, { backgroundColor: '#ef444415', borderColor: '#ef444450' }]}>
                                        <View style={styles.criticalIconBox}>
                                            <AlertTriangle size={20} color="#ef4444" />
                                        </View>
                                        <View>
                                            <Text style={[styles.criticalName, { color: theme.text }]}>{item.name}</Text>
                                            <Text style={styles.criticalStock}>Quedan: {item.currentStock} {item.unit}</Text>
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
                            <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <View style={[styles.itemIcon, { backgroundColor: theme.secondary + '15' }]}>
                                    <Package size={22} color={theme.secondary} />
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={[styles.itemCategory, { color: theme.textMuted }]}>{item.category || 'Sin categoría'}</Text>
                                </View>
                                <View style={styles.stockInfo}>
                                    <Text style={[styles.stockValue, { color: item.currentStock <= item.minStock ? '#ef4444' : '#10b981' }]}>
                                        {item.currentStock}
                                    </Text>
                                    <Text style={[styles.stockUnit, { color: theme.textMuted }]}>{item.unit}</Text>
                                </View>
                            </View>
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
                            <Text style={[styles.inputLabel, { color: theme.text }]}>Nombre del Producto *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newItem.name}
                                onChangeText={t => setNewItem({...newItem, name: t})}
                                placeholder="Ej. Amoxicilina 500mg"
                                placeholderTextColor={theme.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Categoría</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newItem.category}
                                onChangeText={t => setNewItem({...newItem, category: t})}
                                placeholder="Ej. Antibióticos"
                                placeholderTextColor={theme.textMuted}
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Stock Inicial</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        value={newItem.currentStock?.toString()}
                                        onChangeText={t => setNewItem({...newItem, currentStock: parseInt(t) || 0})}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Stock Mínimo</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                        value={newItem.minStock?.toString()}
                                        onChangeText={t => setNewItem({...newItem, minStock: parseInt(t) || 0})}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Unidad de medida *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={newItem.unit}
                                onChangeText={t => setNewItem({...newItem, unit: t})}
                                placeholder="ml, mg, frasco, caja..."
                                placeholderTextColor={theme.textMuted}
                            />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSaveItem}
                                disabled={loadingAction}
                            >
                                {loadingAction ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { padding: 24, paddingBottom: 100 },
    sectionTitle: { fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
    alertSection: { marginBottom: 32 },
    criticalCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
        minWidth: 200,
    },
    criticalIconBox: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    criticalName: { fontSize: 14, fontWeight: '800' },
    criticalStock: { fontSize: 12, fontWeight: '700', color: '#ef4444', marginTop: 2 },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12
    },
    addBtnText: { fontSize: 12, fontWeight: '800' },
    itemCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: 16, borderRadius: 20, borderWidth: 1,
        marginBottom: 12, gap: 14
    },
    itemIcon: {
        width: 46, height: 46, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center'
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '800' },
    itemCategory: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    stockInfo: { alignItems: 'flex-end' },
    stockValue: { fontSize: 20, fontWeight: '900' },
    stockUnit: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    searchContainer: { marginTop: 16, paddingHorizontal: 24 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '500' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 32 },
    cancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    cancelBtnText: { fontSize: 15, fontWeight: '700' },
    saveBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    headerAction: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
});
