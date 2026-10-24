import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Dog, Cat, UserX, PawPrint, Send, ShieldCheck, Ban } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkerDetail } from '@/src/hooks/paseadores/useWalkerDetail';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import Badge from '@/src/components/Badge';
import BottomSheet from '@/src/components/BottomSheet';
import FilterChip from '@/src/components/FilterChip';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import DatePicker from '@/src/components/DatePicker';
import { Skeleton } from '@/src/components/Skeleton';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import {
    ProviderHero, ProviderStats, ProviderSection, ProviderBio, ProviderServices, ProviderLocation, ProviderPrice,
    ProviderRatingSummary, ProviderReviews, ProviderReviewForm, ProviderFooter,
} from '@/src/features/proveedor/ProviderProfile';
import { toLocalIsoDate } from '@/src/hooks/servicios-pro/requestStatus';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, spacing, type } from '@/constants/design';

const DURATIONS = [30, 45, 60, 90];

export default function WalkerDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const w = useWalkerDetail();
    const { walker } = w;

    if (w.isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Paseador" />
                <View style={styles.loading}>
                    <Skeleton width={96} height={96} borderRadius={48} style={styles.center} />
                    <Skeleton width="50%" height={24} style={styles.center} />
                    <Skeleton height={72} />
                    <Skeleton height={120} />
                </View>
            </ScreenContainer>
        );
    }

    if (w.error || !walker) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Paseador" />
                <EmptyState
                    icon={<UserX size={layout.icon.xl} color={theme.textMuted} />}
                    title="No pudimos cargar este perfil"
                    subtitle="Puede que ya no esté disponible o que no tengas conexión."
                    actionLabel="Ver paseadores"
                    onAction={() => router.replace('/paseadores')}
                />
            </ScreenContainer>
        );
    }

    // El promedio guardado en el perfil no siempre está al día: se calcula con las reseñas
    const average = w.reviews.length ? w.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / w.reviews.length : 0;
    const isSuspended = walker.is_active === false;

    return (
        <ScreenContainer>
            <ScreenHeader title={walker.display_name} subtitle={isSuspended ? 'Paseador suspendido' : walker.is_verified ? 'Paseador verificado' : 'Paseador'} />

            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />} contentContainerStyle={styles.content}>
                <ProviderHero
                    photoUrl={walker.photo_url}
                    name={walker.display_name}
                    rating={w.reviews.length ? average : undefined}
                    reviewCount={w.reviews.length}
                >
                    {walker.is_verified && !isSuspended ? (
                        <Badge
                            label="Verificado"
                            color={theme.success}
                            icon={<ShieldCheck size={layout.icon.xs} color={theme.success} />}
                            accessibilityLabel="Profesional verificado por el equipo"
                        />
                    ) : null}
                </ProviderHero>

                {isSuspended ? (
                    <View style={[styles.notice, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
                        <Ban size={layout.icon.md} color={theme.error} />
                        <Text style={[type.body, styles.flex, { color: theme.text }]}>
                            Este perfil está suspendido y no acepta solicitudes por ahora.
                        </Text>
                    </View>
                ) : null}

                <ProviderStats items={[
                    { value: String(walker.total_walks), label: 'Paseos' },
                    { value: String(walker.experience_years ?? 0), label: walker.experience_years === 1 ? 'Año' : 'Años' },
                    { value: String(walker.max_pets_per_walk), label: 'Por paseo' },
                ]} />

                {walker.bio ? (
                    <ProviderSection title="Sobre mí">
                        <ProviderBio text={walker.bio} />
                    </ProviderSection>
                ) : null}

                <ProviderSection title="Pasea a">
                    <ProviderServices services={[
                        { name: 'Perros', active: walker.accepts_dogs, icon: <Dog size={layout.icon.md} color={walker.accepts_dogs ? theme.primary : theme.textMuted} /> },
                        { name: 'Gatos', active: walker.accepts_cats, icon: <Cat size={layout.icon.md} color={walker.accepts_cats ? theme.primary : theme.textMuted} /> },
                    ]} />
                </ProviderSection>

                {walker.location ? (
                    <ProviderSection title="Zona">
                        <ProviderLocation text={walker.location} extra={walker.service_radius_km ? `Hasta ${walker.service_radius_km} km a la redonda` : undefined} />
                    </ProviderSection>
                ) : null}

                <ProviderSection title="Tarifas">
                    <View style={styles.prices}>
                        <ProviderPrice label="Por hora" amount={walker.price_per_hour ? formatCurrency(walker.price_per_hour) : 'Por acordar'} />
                        {walker.price_per_walk ? <ProviderPrice label="Paseo individual" amount={formatCurrency(walker.price_per_walk)} /> : null}
                    </View>
                </ProviderSection>

                <ProviderSection title="Opiniones">
                    <ProviderRatingSummary rating={average} count={w.reviews.length} />
                    {w.unreviewedCompletedRequests.length > 0 ? (
                        <ProviderReviewForm
                            onSubmit={(rating, comment) => {
                                const req = w.unreviewedCompletedRequests[0];
                                if (req) w.handleCreateReview(req.id, { rating, comment });
                            }}
                            isSubmitting={w.isCreatingReview}
                        />
                    ) : null}
                    <ProviderReviews reviews={w.reviews.map((r: any) => ({ id: r.id, user_name: r.user_name, rating: r.rating, comment: r.comment, created_at: r.created_at }))} />
                </ProviderSection>
            </ScrollView>

            {!w.isOwnProfile ? (
                <ProviderFooter
                    label={isSuspended ? 'No disponible' : 'Solicitar paseo'}
                    onPress={w.handleBook}
                    disabled={isSuspended}
                    icon={<Calendar size={layout.icon.sm} color={theme.onPrimary} />}
                />
            ) : null}

            <BottomSheet
                visible={w.walkModalVisible}
                onClose={() => w.setWalkModalVisible(false)}
                title="Solicitar paseo"
                subtitle={`Con ${walker.display_name}`}
                footer={(
                    <>
                        <Button label="Cancelar" variant="secondary" onPress={() => w.setWalkModalVisible(false)} style={styles.flex} />
                        <Button
                            label="Enviar"
                            icon={<Send size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={w.handleSubmitWalkRequest}
                            loading={w.isRequestingWalk}
                            style={styles.primary}
                        />
                    </>
                )}
            >
                <View style={styles.group}>
                    <Text style={[type.labelSentence, { color: theme.text }]}>¿A quién pasea?</Text>
                    {w.myPets.length === 0 ? (
                        <View style={styles.inline}>
                            <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>Primero agrega a tu mascota.</Text>
                            <Button label="Agregar" size="sm" onPress={() => { w.setWalkModalVisible(false); router.push('/mascotas/nuevo'); }} />
                        </View>
                    ) : (
                        <View style={styles.chips}>
                            {w.myPets.map((pet) => {
                                const active = w.selectedPetId === pet.id;
                                return (
                                    <FilterChip
                                        key={pet.id}
                                        label={pet.name}
                                        active={active}
                                        onPress={() => w.setSelectedPetId(pet.id)}
                                        icon={<PawPrint size={layout.icon.xs} color={active ? theme.onPrimary : theme.textMuted} />}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>
                <DatePicker
                    label="Día del paseo"
                    value={new Date(`${w.walkDate}T12:00:00`)}
                    onChange={(d) => w.setWalkDate(toLocalIsoDate(d))}
                    minimumDate={new Date()}
                />
                <View style={styles.group}>
                    <Text style={[type.labelSentence, { color: theme.text }]}>Duración</Text>
                    <View style={styles.chips}>
                        {DURATIONS.map((d) => (
                            <FilterChip key={d} label={`${d} min`} active={w.walkDuration === d} onPress={() => w.setWalkDuration(d)} />
                        ))}
                    </View>
                </View>
                <FormField
                    label="Notas para el paseador"
                    value={w.walkNotes}
                    onChangeText={w.setWalkNotes}
                    placeholder="Hora preferida, dirección, si jala la correa…"
                    multiline
                />
            </BottomSheet>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    primary: { flex: 1.6 },
    center: { alignSelf: 'center' },
    loading: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.xl, gap: spacing.md },
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xl },
    notice: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: 16, borderWidth: 1, marginBottom: spacing.md },
    prices: { gap: spacing.sm },
    group: { gap: spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
