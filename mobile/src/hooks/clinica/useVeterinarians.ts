import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyClinics, getManagedClinicVets, createVet, updateVet, dissociateVeterinarian, getHospitalVeterinarians, associateVeterinarian } from '@/src/services/directorio';
import type { Vet } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useVeterinarians() {
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingVet, setEditingVet] = useState<any>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [bio, setBio] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: veterinarians = [], isLoading: loadingVets } = useQuery({
        queryKey: ['clinic-vets', clinic?.id],
        queryFn: () => clinic ? getManagedClinicVets(clinic.id) : Promise.resolve([]),
        enabled: !!clinic?.id,
    });

    // Hospital veterinarians available for association
    const { data: hospitalVets = [], isLoading: loadingHospitalVets } = useQuery<Vet[]>({
        queryKey: ['hospital-veterinarians'],
        queryFn: getHospitalVeterinarians,
    });

    // Associate a vet to the clinic
    const associateVetMutation = useMutation({
        mutationFn: (vetId: string) => associateVeterinarian(clinic!.id, vetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-vets', clinic?.id] });
            showAlert({ type: 'success', title: 'Éxito', message: 'Veterinario asociado a la clínica correctamente' });
        },
        onError: (err: any) => {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo asociar el veterinario' });
        },
    });

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setSpecialty('');
        setLicenseNumber('');
        setBio('');
        setEditingVet(null);
    };

    const handleEdit = (vet: any) => {
        setEditingVet(vet);
        setName(vet.name || `${vet.first_name || ''} ${vet.last_name || ''}`.trim());
        setEmail(vet.email || '');
        setPhone(vet.phone || '');
        setSpecialty(vet.specialty || '');
        setLicenseNumber(vet.license_number || '');
        setBio(vet.bio || '');
        setModalVisible(true);
    };

    const handleDelete = (vet: any) => {
        const vetName = vet.name || `${vet.first_name || ''} ${vet.last_name || ''}`.trim();
        showAlert({
            type: 'warning',
            title: 'Desasociar Veterinario',
            message: `¿Estás seguro de desasociar a ${vetName} de tu clínica?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Desasociar',
            onButtonPress: async () => {
                try {
                    setLoadingAction(true);
                    await dissociateVeterinarian(clinic.id, vet.id);
                    showAlert({ type: 'success', title: 'Éxito', message: 'Veterinario desasociado correctamente' });
                    queryClient.invalidateQueries({ queryKey: ['clinic-vets', clinic.id] });
                    queryClient.invalidateQueries({ queryKey: ['hospital-veterinarians'] });
                    queryClient.invalidateQueries({ queryKey: ['public-vets'] });
                } catch (err: any) {
                    showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo desasociar' });
                } finally {
                    setLoadingAction(false);
                }
            }
        });
    };

    const handleSave = async () => {
        if (!name.trim() || !email.trim() || !specialty.trim()) {
            showAlert({ type: 'error', title: 'Faltan datos', message: 'Nombre, correo y especialidad son obligatorios.' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            showAlert({ type: 'error', title: 'Correo inválido', message: 'Escribe un correo electrónico válido.' });
            return;
        }

        setLoadingAction(true);
        try {
            const parts = name.trim().split(/\s+/);
            const vetData = {
                first_name: parts[0],
                last_name: parts.slice(1).join(' '),
                email: email.trim(),
                phone: phone.trim() || null,
                specialty: specialty.trim(),
                license_number: licenseNumber.trim() || null,
                bio: bio.trim() || null,
                photo_url: editingVet?.photo_url || null,
                clinic_id: clinic.id
            };

            if (editingVet) {
                await updateVet(editingVet.id, vetData);
                showAlert({ type: 'success', title: 'Éxito', message: 'Veterinario actualizado correctamente' });
            } else {
                await createVet(vetData);
                showAlert({ type: 'success', title: 'Éxito', message: 'Veterinario agregado correctamente' });
            }
            setModalVisible(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['clinic-vets', clinic.id] });
            queryClient.invalidateQueries({ queryKey: ['hospital-veterinarians'] });
            queryClient.invalidateQueries({ queryKey: ['public-vets'] });
        } catch (error: any) {
            showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo guardar el veterinario' });
        } finally {
            setLoadingAction(false);
        }
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const activeVetsCount = veterinarians.filter((v: any) => v.is_approved).length;

    return {
        // State
        modalVisible,
        setModalVisible,
        editingVet,
        loadingAction,
        name, setName,
        email, setEmail,
        phone, setPhone,
        specialty, setSpecialty,
        licenseNumber, setLicenseNumber,
        bio, setBio,
        // Data
        loadingClinics,
        loadingVets,
        clinic,
        veterinarians,
        activeVetsCount,
        // Hospital Vets
        hospitalVets,
        loadingHospitalVets,
        handleAssociateVet: (vetId: string) => associateVetMutation.mutate(vetId),
        isAssociatingVet: associateVetMutation.isPending,
        // Actions
        handleEdit,
        handleDelete,
        handleSave,
        openCreateModal,
    };
}
