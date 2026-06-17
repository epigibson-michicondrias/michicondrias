/**
 * useAdoptionContract — Hook for the adoption contract signing screen
 * Uses signAdoptionContract from adopciones service
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { signAdoptionContract } from '@/src/services/adopciones';
import { showAlert } from '@/src/components/AppAlert';
import type { AdoptionContractCreate } from '@/src/types/adopciones';

const DEFAULT_TERMS = `CONTRATO DE ADOPCIÓN RESPONSABLE

Por medio del presente contrato, el adoptante se compromete a:

1. CUIDADO GENERAL: Proporcionar alimentación adecuada, agua fresca, refugio apropiado y atención veterinaria regular al animal adoptado.

2. SALUD: Mantener al día las vacunas, desparasitaciones y visitas al veterinario. En caso de enfermedad, buscar atención médica inmediata.

3. ESTERILIZACIÓN: Si el animal no ha sido esterilizado, el adoptante se compromete a realizar el procedimiento en el plazo acordado.

4. TRATO DIGNO: No maltratar, abandonar ni utilizar al animal para peleas, reproducción comercial o cualquier actividad que ponga en riesgo su bienestar.

5. IDENTIFICACIÓN: Mantener al animal con una placa de identificación con los datos de contacto del adoptante.

6. VIVIENDA: Proporcionar un espacio seguro y adecuado para el animal, con las condiciones necesarias para su bienestar.

7. DEVOLUCIÓN: En caso de no poder continuar con el cuidado del animal, el adoptante se compromete a notificar al refugio para gestionar su reubicación.

8. SEGUIMIENTO: Permitir visitas de seguimiento por parte del refugio durante los primeros 6 meses posteriores a la adopción.

El incumplimiento de cualquiera de estas cláusulas faculta al refugio a solicitar la devolución del animal.`;

export function useAdoptionContract() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [agreed, setAgreed] = useState(false);
    const [formId] = useState(id || '');
    const [refugeId] = useState('');

    const signMutation = useMutation({
        mutationFn: (data: AdoptionContractCreate) => signAdoptionContract(data),
        onSuccess: () => {
            showAlert({
                type: 'success',
                title: '¡Contrato Firmado!',
                message: '¡Felicidades! El contrato de adopción ha sido firmado exitosamente. Pronto recibirás información sobre los próximos pasos.',
            });
            router.back();
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo firmar el contrato. Intenta de nuevo.',
            });
        },
    });

    const handleSign = () => {
        if (!agreed) {
            showAlert({
                type: 'warning',
                title: 'Atención',
                message: 'Debes aceptar los términos del contrato antes de firmar.',
            });
            return;
        }

        showAlert({
            type: 'info',
            title: '¿Firmar contrato?',
            message: 'Al firmar este contrato te comprometes a cumplir con todas las condiciones de adopción responsable.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Firmar',
            onButtonPress: () => {
                signMutation.mutate({
                    form_id: formId,
                    refuge_id: refugeId,
                    terms: DEFAULT_TERMS,
                });
            },
        });
    };

    return {
        // Data
        terms: DEFAULT_TERMS,
        agreed,
        formId,

        // Actions
        setAgreed,
        handleSign,
        isSigning: signMutation.isPending,
    };
}
