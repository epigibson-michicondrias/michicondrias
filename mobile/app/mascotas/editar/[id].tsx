import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useEditPet } from '@/src/hooks/mascotas/useEditPet';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import Button from '@/src/components/Button';
import PetForm from '@/src/features/mascotas/PetForm';
import { spacing, radius } from '@/constants/design';

export default function EditarMascotaScreen() {
    const { theme } = useTheme();
    const { form, updateField, image, setImage, isLoadingPet, isUpdating, isDeleting, handleUpdate, handleDelete } = useEditPet();

    if (isLoadingPet) {
        return (
            <ScreenContainer style={styles.center}>
                <LoadingOverlay message="Cargando datos de tu mascota..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader title="Editar Mascota" />
            <PetForm
                form={form}
                updateField={updateField}
                image={image}
                setImage={setImage}
                submitLabel="Guardar Cambios"
                onSubmit={handleUpdate}
                busy={isUpdating}
            >
                {/* Zona de peligro (solo al editar) */}
                <View style={[styles.dangerCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <Text style={[styles.dangerTitle, { color: theme.text }]}>Eliminar mascota</Text>
                    <Text style={[styles.dangerText, { color: theme.textMuted }]}>
                        Dejará de aparecer en tu lista. Si tiene Michi-Tracker Pro activo, cancela primero la suscripción.
                    </Text>
                    <Button
                        label="Eliminar mascota"
                        variant="danger"
                        icon={<Trash2 size={18} color="#fff" />}
                        onPress={handleDelete}
                        loading={isDeleting}
                        disabled={isUpdating}
                    />
                </View>
            </PetForm>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dangerCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    dangerTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    dangerText: {
        fontSize: 13,
        lineHeight: 19,
    },
});
