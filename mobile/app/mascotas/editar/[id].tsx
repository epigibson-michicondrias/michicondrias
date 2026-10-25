import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Trash2, CreditCard } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useEditPet } from '@/src/hooks/mascotas/useEditPet';
import { useTrackerBilling } from '@/src/hooks/mascotas/useTrackerBilling';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Skeleton } from '@/src/components/Skeleton';
import Button from '@/src/components/Button';
import PetForm from '@/src/features/mascotas/PetForm';
import { layout, spacing, radius, type } from '@/constants/design';

export default function EditarMascotaScreen() {
    const { theme } = useTheme();
    const { form, updateField, image, setImage, isLoadingPet, hasTracker, isUpdating, isDeleting, handleUpdate, handleDelete } = useEditPet();
    const { openTrackerBilling, isOpeningBilling } = useTrackerBilling();

    if (isLoadingPet) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Editar mascota" />
                <View style={styles.loading}>
                    <Skeleton width={120} height={120} borderRadius={radius.pill} style={styles.loadingPhoto} />
                    <Skeleton height={320} borderRadius={radius.lg} />
                    <Skeleton height={180} borderRadius={radius.lg} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader title="Editar mascota" />
            <PetForm
                form={form}
                updateField={updateField}
                image={image}
                setImage={setImage}
                submitLabel="Guardar cambios"
                onSubmit={handleUpdate}
                busy={isUpdating}
            >
                {/* Zona de peligro (solo al editar). Con Michi-Tracker activo el backend no deja eliminarla: primero se cancela */}
                <View style={[styles.dangerCard, { backgroundColor: theme.surface, borderColor: theme.error + '40' }]}>
                    <Text style={[type.title, { color: theme.error }]}>Eliminar mascota</Text>
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {hasTracker
                            ? 'Tiene Michi-Tracker Pro activo. Cancela la suscripción en Facturación y después podrás eliminarla.'
                            : 'Dejará de aparecer en tu lista. Su carnet y sus citas se conservan.'}
                    </Text>
                    {hasTracker ? (
                        <Button
                            label="Gestionar suscripción"
                            variant="secondary"
                            icon={<CreditCard size={layout.icon.sm} color={theme.text} />}
                            onPress={openTrackerBilling}
                            loading={isOpeningBilling}
                        />
                    ) : (
                        <Button
                            label="Eliminar mascota"
                            variant="danger"
                            icon={<Trash2 size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={handleDelete}
                            loading={isDeleting}
                            disabled={isUpdating}
                        />
                    )}
                </View>
            </PetForm>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    loading: { padding: spacing.xl, gap: spacing.lg },
    loadingPhoto: { alignSelf: 'center' },
    dangerCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
});
