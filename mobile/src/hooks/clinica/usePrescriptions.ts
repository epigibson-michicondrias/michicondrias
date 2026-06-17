import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyClinics, getClinicAppointments } from '@/src/services/directorio';
import { getClinicPrescriptions, createPrescription, updatePrescriptionStatus, PrescriptionCreatePayload } from '@/src/services/prescriptions';
import { getPetById, Pet } from '@/src/services/mascotas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export function usePrescriptions() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [patientPickerVisible, setPatientPickerVisible] = useState(false);
    const [patientSearch, setPatientSearch] = useState('');
    const [newPresc, setNewPresc] = useState<PrescriptionCreatePayload>({
        patientId: '',
        veterinarianId: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
    });

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: appointments = [] } = useQuery({
        queryKey: ['clinic-appointments', clinic?.id],
        queryFn: () => getClinicAppointments(clinic!.id),
        enabled: !!clinic?.id,
    });

    const uniquePetIds = useMemo(() => {
        const ids = new Set<string>();
        appointments.forEach(a => { if (a.pet_id) ids.add(a.pet_id); });
        return Array.from(ids);
    }, [appointments]);

    const [resolvedPets, setResolvedPets] = useState<Pet[]>([]);
    const [loadingPets, setLoadingPets] = useState(false);

    useEffect(() => {
        if (uniquePetIds.length === 0) return;
        let cancelled = false;
        setLoadingPets(true);
        Promise.all(uniquePetIds.map(id => getPetById(id).catch(() => null)))
            .then(results => {
                if (!cancelled) {
                    setResolvedPets(results.filter((p): p is Pet => p !== null));
                    setLoadingPets(false);
                }
            });
        return () => { cancelled = true; };
    }, [uniquePetIds.join(',')]);

    const filteredPets = useMemo(() => {
        if (!patientSearch.trim()) return resolvedPets;
        const q = patientSearch.toLowerCase();
        return resolvedPets.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }, [resolvedPets, patientSearch]);

    const { data: prescriptions = [], isLoading: loadingPrescriptions } = useQuery({
        queryKey: ['clinic-prescriptions', clinic?.id],
        queryFn: () => getClinicPrescriptions(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    const handleSavePrescription = async () => {
        if (!newPresc.patientId || !newPresc.medications[0].name) {
            showAlert({ type: 'error', title: 'Error', message: 'Paciente y al menos un medicamento son obligatorios' });
            return;
        }
        setLoadingAction(true);
        try {
            await createPrescription(clinic!.id, {
                ...newPresc,
                veterinarianId: user?.id || '',
            });
            setModalVisible(false);
            setNewPresc({
                patientId: '',
                veterinarianId: '',
                medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
                notes: ''
            });
            showAlert({ type: 'success', title: 'Éxito', message: 'Receta emitida correctamente' });
            queryClient.invalidateQueries({ queryKey: ['clinic-prescriptions', clinic?.id] });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear la receta' });
        } finally {
            setLoadingAction(false);
        }
    };

    const selectPatient = (petId: string) => {
        setNewPresc({ ...newPresc, patientId: petId });
        setPatientPickerVisible(false);
        setPatientSearch('');
    };

    const statusMutation = useMutation({
        mutationFn: ({ prescId, status }: { prescId: string; status: string }) =>
            updatePrescriptionStatus(clinic!.id, prescId, status),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Éxito', message: 'Estado de receta actualizado' });
            queryClient.invalidateQueries({ queryKey: ['clinic-prescriptions', clinic?.id] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado' });
        },
    });

    const handleUpdateStatus = (prescId: string, newStatus: string) => {
        statusMutation.mutate({ prescId, status: newStatus });
    };

    return {
        // State
        modalVisible,
        setModalVisible,
        loadingAction,
        patientPickerVisible,
        setPatientPickerVisible,
        patientSearch,
        setPatientSearch,
        newPresc,
        setNewPresc,
        // Data
        loadingClinics,
        loadingPrescriptions,
        prescriptions,
        resolvedPets,
        filteredPets,
        loadingPets,
        // Actions
        handleSavePrescription,
        selectPatient,
        handleUpdateStatus,
        isUpdatingStatus: statusMutation.isPending,
    };
}
