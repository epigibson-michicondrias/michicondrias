import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHospitalClinics, createClinic, updateClinic, deleteClinic, Clinic, ClinicCreate } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useBranches() {
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [is24Hours, setIs24Hours] = useState(false);
    const [hasEmergency, setHasEmergency] = useState(false);

    const { data: clinics = [], isLoading } = useQuery({
        queryKey: ['hospital-clinics'],
        queryFn: getHospitalClinics,
    });

    const resetForm = () => {
        setName('');
        setAddress('');
        setCity('');
        setState('');
        setPhone('');
        setEmail('');
        setWebsite('');
        setDescription('');
        setIs24Hours(false);
        setHasEmergency(false);
        setEditingClinic(null);
    };

    const handleEdit = (item: Clinic) => {
        setEditingClinic(item);
        setName(item.name);
        setAddress(item.address || '');
        setCity(item.city || '');
        setState(item.state || '');
        setPhone(item.phone || '');
        setEmail(item.email || '');
        setWebsite(item.website || '');
        setDescription(item.description || '');
        setIs24Hours(item.is_24_hours || false);
        setHasEmergency(item.has_emergency || false);
        setModalVisible(true);
    };

    const handleDelete = (item: Clinic) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Sucursal',
            message: `¿Estás seguro de eliminar la clínica "${item.name}"? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: async () => {
                try {
                    setLoadingAction(true);
                    await deleteClinic(item.id);
                    showAlert({ type: 'success', title: 'Éxito', message: 'Clínica eliminada correctamente.' });
                    queryClient.invalidateQueries({ queryKey: ['hospital-clinics'] });
                } catch (err: any) {
                    showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo eliminar la clínica.' });
                } finally {
                    setLoadingAction(false);
                }
            }
        });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre de la clínica es obligatorio.' });
            return;
        }

        setLoadingAction(true);
        const clinicData: ClinicCreate = {
            name: name.trim(),
            address: address.trim() || null,
            city: city.trim() || null,
            state: state.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            website: website.trim() || null,
            description: description.trim() || null,
            is_24_hours: is24Hours,
            has_emergency: hasEmergency,
        };

        try {
            if (editingClinic) {
                await updateClinic(editingClinic.id, clinicData);
                showAlert({ type: 'success', title: 'Éxito', message: 'Clínica actualizada correctamente.' });
            } else {
                await createClinic(clinicData);
                showAlert({ type: 'success', title: 'Éxito', message: 'Clínica registrada correctamente.' });
            }
            setModalVisible(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['hospital-clinics'] });
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo guardar la clínica.' });
        } finally {
            setLoadingAction(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    return {
        // State
        modalVisible,
        setModalVisible,
        editingClinic,
        loadingAction,
        name, setName,
        address, setAddress,
        city, setCity,
        state, setState,
        phone, setPhone,
        email, setEmail,
        website, setWebsite,
        description, setDescription,
        is24Hours, setIs24Hours,
        hasEmergency, setHasEmergency,
        // Data
        isLoading,
        clinics,
        // Actions
        handleEdit,
        handleDelete,
        handleSave,
        openCreateModal,
    };
}
