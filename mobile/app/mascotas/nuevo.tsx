import React from 'react';
import { useTheme } from '@/src/hooks/useTheme';
import { usePetForm } from '@/src/hooks/mascotas/usePetForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import PetForm from '@/src/features/mascotas/PetForm';

export default function NuevaMascotaScreen() {
    const { theme } = useTheme();
    const { form, updateField, image, setImage, loading, handleSubmit } = usePetForm();

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader title="Nueva Mascota" />
            <PetForm
                form={form}
                updateField={updateField}
                image={image}
                setImage={setImage}
                submitLabel="Registrar Mascota"
                onSubmit={handleSubmit}
                busy={loading}
            />
        </ScreenContainer>
    );
}
