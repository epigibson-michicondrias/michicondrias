import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyClinics } from '@/src/services/directorio';
import {
    getClinicInventory, getCriticalInventory, addInventoryItem,
    updateInventoryItem, deleteInventoryItem,
    InventoryCreatePayload, InventoryItem
} from '@/src/services/inventory';
import { showAlert } from '@/src/components/AppAlert';

export function useInventory() {
    const queryClient = useQueryClient();

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [inventoryFilter, setInventoryFilter] = useState<'all' | 'critical'>('all');

    const [newItem, setNewItem] = useState<InventoryCreatePayload>({
        name: '', category: '', unit: 'unidad', currentStock: 0, minStock: 0
    });

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: inventory = [], isLoading: loadingInventory } = useQuery({
        queryKey: ['clinic-inventory', clinic?.id],
        queryFn: () => getClinicInventory(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    const { data: criticalInventory = [] } = useQuery({
        queryKey: ['clinic-inventory-critical', clinic?.id],
        queryFn: () => getCriticalInventory(clinic!.id),
        enabled: !!clinic?.id && inventoryFilter === 'critical',
        refetchInterval: 30000,
    });

    const isLoading = loadingClinics || (loadingInventory && !inventory.length);

    const criticalItems = inventory.filter(item => item.isCritical || item.currentStock <= item.minStock);

    const activeInventory = inventoryFilter === 'critical' ? criticalInventory : inventory;

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleSearch = () => setShowSearch(!showSearch);

    const handleSaveItem = async () => {
        if (!newItem.name || !newItem.unit) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre y la unidad son obligatorios' });
            return;
        }
        setLoadingAction(true);
        try {
            await addInventoryItem(clinic!.id, newItem);
            setModalVisible(false);
            setNewItem({ name: '', category: '', unit: 'unidad', currentStock: 0, minStock: 0 });
            showAlert({ type: 'success', title: 'Éxito', message: 'Producto agregado al inventario' });
            queryClient.invalidateQueries({ queryKey: ['clinic-inventory', clinic?.id] });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo agregar el producto' });
        } finally {
            setLoadingAction(false);
        }
    };

    const updateMutation = useMutation({
        mutationFn: ({ itemId, data }: { itemId: string; data: Partial<InventoryItem> }) =>
            updateInventoryItem(clinic!.id, itemId, data),
        onSuccess: () => {
            setEditModalVisible(false);
            setEditingItem(null);
            showAlert({ type: 'success', title: 'Éxito', message: 'Producto actualizado' });
            queryClient.invalidateQueries({ queryKey: ['clinic-inventory', clinic?.id] });
            queryClient.invalidateQueries({ queryKey: ['clinic-inventory-critical', clinic?.id] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el producto' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (itemId: string) => deleteInventoryItem(clinic!.id, itemId),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Producto eliminado del inventario' });
            queryClient.invalidateQueries({ queryKey: ['clinic-inventory', clinic?.id] });
            queryClient.invalidateQueries({ queryKey: ['clinic-inventory-critical', clinic?.id] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar el producto' });
        },
    });

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem({ ...item });
        setEditModalVisible(true);
    };

    const handleUpdateItem = () => {
        if (!editingItem?.id) return;
        updateMutation.mutate({ itemId: editingItem.id, data: editingItem });
    };

    const handleDeleteItem = (itemId: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Producto',
            message: '¿Estás seguro de que deseas eliminar este producto del inventario?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(itemId),
        });
    };

    return {
        // State
        showSearch,
        searchQuery,
        setSearchQuery,
        modalVisible,
        setModalVisible,
        editModalVisible,
        setEditModalVisible,
        editingItem,
        setEditingItem,
        loadingAction,
        newItem,
        setNewItem,
        inventoryFilter,
        setInventoryFilter,
        // Data
        isLoading,
        criticalItems,
        filteredInventory,
        activeInventory,
        // Actions
        toggleSearch,
        handleSaveItem,
        handleEditItem,
        handleUpdateItem,
        handleDeleteItem,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
