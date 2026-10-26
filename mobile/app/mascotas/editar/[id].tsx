import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Trash2, CreditCard, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useEditPet } from '@/src/hooks/mascotas/useEditPet';
import { useTrackerBilling } from '@/src/hooks/mascotas/useTrackerBilling';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Skeleton } from '@/src/components/Skeleton';
import Button from '@/src/components/Button';
import PetForm from '@/src/features/mascotas/PetForm';
import { layout, spacing, radius, type, shadow } from '@/constants/design';

export default function EditarMascotaScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        pet,
        form,
        updateField,
        image,
        setImage,
        isLoadingPet,
        hasTracker,
        isUpdating,
        isDeleting,
        handleUpdate,
        handleDelete,
    } = useEditPet();
    const { openTrackerBilling, isOpeningBilling } = useTrackerBilling();

    if (isLoadingPet) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Editar mascota" subtitle="Cargando información..." />
                <View style={styles.loadingContainer}>
                    {/* Hero skeleton */}
                    <View
                        style={[
                            styles.skeletonCard,
                            shadow.card,
                            { backgroundColor: theme.surface, borderColor: theme.borderLight },
                        ]}
                    >
                        <Skeleton
                            width={116}
                            height={116}
                            borderRadius={radius.pill}
                            style={styles.loadingPhoto}
                        />
                        <Skeleton width="45%" height={24} style={styles.skeletonCenter} />
                        <View style={styles.skeletonPills}>
                            <Skeleton width={70} height={26} borderRadius={radius.pill} />
                            <Skeleton width={70} height={26} borderRadius={radius.pill} />
                            <Skeleton width={90} height={26} borderRadius={radius.pill} />
                        </View>
                    </View>

                    {/* Cards skeleton */}
                    <View
                        style={[
                            styles.skeletonCard,
                            shadow.card,
                            { backgroundColor: theme.surface, borderColor: theme.borderLight },
                        ]}
                    >
                        <Skeleton width="40%" height={20} />
                        <Skeleton height={46} borderRadius={radius.md} />
                        <Skeleton height={46} borderRadius={radius.md} />
                    </View>

                    <View
                        style={[
                            styles.skeletonCard,
                            shadow.card,
                            { backgroundColor: theme.surface, borderColor: theme.borderLight },
                        ]}
                    >
                        <Skeleton width="40%" height={20} />
                        <Skeleton height={46} borderRadius={radius.md} />
                    </View>
                </View>
            </ScreenContainer>
        );
    }

    const petName = pet?.name || form.name.trim() || 'mascota';

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader
                title={`Editar a ${petName}`}
                subtitle="Actualiza su perfil y datos de salud"
            />
            <PetForm
                form={form}
                updateField={updateField}
                image={image}
                setImage={setImage}
                submitLabel="Guardar cambios"
                onSubmit={handleUpdate}
                onCancel={() => router.back()}
                busy={isUpdating}
            >
                {/* Zona de peligro con estilo premium */}
                <View
                    style={[
                        styles.dangerCard,
                        shadow.card,
                        {
                            backgroundColor: theme.surface,
                            borderColor: theme.error + '35',
                        },
                    ]}
                >
                    <View style={styles.dangerHeader}>
                        <View
                            style={[
                                styles.dangerIconBadge,
                                { backgroundColor: theme.errorLight },
                            ]}
                        >
                            {hasTracker ? (
                                <AlertTriangle size={18} color={theme.error} />
                            ) : (
                                <Trash2 size={18} color={theme.error} />
                            )}
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.title, { color: theme.error }]}>
                                Eliminar mascota
                            </Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                {hasTracker
                                    ? 'Suscripción activa a Michi-Tracker Pro'
                                    : 'Acción definitiva de desvinculación'}
                            </Text>
                        </View>
                    </View>

                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {hasTracker
                            ? 'Esta mascota cuenta con Michi-Tracker Pro activo. Para poder eliminarla de tu cuenta, cancela la suscripción en Facturación primero.'
                            : 'Dejará de aparecer en tu lista de mascotas activas. Su carnet sanitario y su historial clínico se conservarán en los registros.'}
                    </Text>

                    <View style={styles.dangerActionContainer}>
                        {hasTracker ? (
                            <Button
                                label="Gestionar en Facturación"
                                variant="secondary"
                                icon={<CreditCard size={layout.icon.sm} color={theme.text} />}
                                onPress={() => router.push('/perfil/facturacion')}
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
                </View>
            </PetForm>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    loadingContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        gap: spacing.lg,
    },
    skeletonCard: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.xl,
        gap: spacing.md,
    },
    loadingPhoto: {
        alignSelf: 'center',
        marginBottom: spacing.xs,
    },
    skeletonCenter: {
        alignSelf: 'center',
    },
    skeletonPills: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    dangerCard: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    dangerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    dangerIconBadge: {
        width: 38,
        height: 38,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dangerActionContainer: {
        marginTop: spacing.xs,
    },
});