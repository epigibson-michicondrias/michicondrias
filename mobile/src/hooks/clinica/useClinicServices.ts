import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyClinics, getClinicServices, createClinicService, updateClinicService, deleteClinicService, ClinicServiceItem } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useClinicServices() {
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<ClinicServiceItem | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('30');
    const [category, setCategory] = useState('General');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: services = [], isLoading: loadingServices, refetch } = useQuery({
        queryKey: ['clinic-services-pro', clinic?.id],
        queryFn: () => getClinicServices(clinic!.id),
        enabled: !!clinic?.id,
    });

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setDuration('30');
        setCategory('General');
        setEditingService(null);
    };

    const handleEdit = (service: ClinicServiceItem) => {
        setEditingService(service);
        setName(service.name);
        setDescription(service.description || '');
        setPrice(service.price?.toString() || '');
        setDuration(service.duration_minutes.toString());
        setCategory(service.category || 'General');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name || !price || !duration) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoadingAction(true);
        try {
            const payload = {
                name,
                description,
                price: parseFloat(price),
                duration_minutes: parseInt(duration),
                category,
            };

            if (editingService) {
                await updateClinicService(editingService.id, payload);
            } else {
                await createClinicService(clinic!.id, payload);
            }

            refetch();
            setModalVisible(false);
            resetForm();
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo guardar el servicio' });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDelete = (id: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Servicio',
            message: '¿Estás seguro de que deseas eliminar este servicio del catálogo?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: async () => {
                try {
                    await deleteClinicService(id);
                    refetch();
                } catch (e) {
                    showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar el servicio' });
                }
            }
        });
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    return {
        // State
        modalVisible,
        setModalVisible,
        editingService,
        loadingAction,
        name, setName,
        description, setDescription,
        price, setPrice,
        duration, setDuration,
        category, setCategory,
        // Data
        loadingServices,
        services,
        // Actions
        handleEdit,
        handleSave,
        handleDelete,
        openCreateModal,
    };
}
