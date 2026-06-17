import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyClinics } from '@/src/services/directorio';
import { getClinicLabTests, requestLabTest, updateLabTestResults, LabTestCreatePayload } from '@/src/services/laboratory';
import { showAlert } from '@/src/components/AppAlert';

export function useLaboratory() {
    const queryClient = useQueryClient();

    const [filter, setFilter] = useState<'pending' | 'completed'>('pending');
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
    const [resultData, setResultData] = useState({ results: '', notes: '' });
    const [newTest, setNewTest] = useState<LabTestCreatePayload>({
        patientId: '', testType: '', testName: '', description: ''
    });

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: labTests = [], isLoading: loadingTests } = useQuery({
        queryKey: ['clinic-lab', clinic?.id, filter],
        queryFn: () => getClinicLabTests(clinic!.id, filter),
        enabled: !!clinic?.id,
        refetchInterval: 30000,
    });

    const handleSaveTest = async () => {
        if (!newTest.patientId || !newTest.testName || !newTest.testType) {
            showAlert({ type: 'error', title: 'Error', message: 'ID de Paciente, Tipo y Nombre son obligatorios' });
            return;
        }
        setLoadingAction(true);
        try {
            await requestLabTest(clinic!.id, newTest);
            setModalVisible(false);
            setNewTest({ patientId: '', testType: '', testName: '', description: '' });
            showAlert({ type: 'success', title: 'Éxito', message: 'Prueba solicitada correctamente' });
            queryClient.invalidateQueries({ queryKey: ['clinic-lab', clinic?.id] });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo solicitar la prueba' });
        } finally {
            setLoadingAction(false);
        }
    };

    const updateResultsMutation = useMutation({
        mutationFn: ({ testId, data }: { testId: string; data: any }) =>
            updateLabTestResults(clinic!.id, testId, data),
        onSuccess: () => {
            setResultModalVisible(false);
            setSelectedTestId(null);
            setResultData({ results: '', notes: '' });
            showAlert({ type: 'success', title: 'Éxito', message: 'Resultados actualizados correctamente' });
            queryClient.invalidateQueries({ queryKey: ['clinic-lab', clinic?.id] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudieron actualizar los resultados' });
        },
    });

    const handleOpenResultModal = (testId: string) => {
        setSelectedTestId(testId);
        setResultData({ results: '', notes: '' });
        setResultModalVisible(true);
    };

    const handleSaveResults = () => {
        if (!selectedTestId || !resultData.results.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'Los resultados son obligatorios' });
            return;
        }
        updateResultsMutation.mutate({
            testId: selectedTestId,
            data: { results: resultData.results, notes: resultData.notes, status: 'completed' },
        });
    };

    return {
        // State
        filter,
        setFilter,
        modalVisible,
        setModalVisible,
        loadingAction,
        newTest,
        setNewTest,
        resultModalVisible,
        setResultModalVisible,
        resultData,
        setResultData,
        // Data
        loadingClinics,
        loadingTests,
        labTests,
        // Actions
        handleSaveTest,
        handleOpenResultModal,
        handleSaveResults,
        isSavingResults: updateResultsMutation.isPending,
    };
}
