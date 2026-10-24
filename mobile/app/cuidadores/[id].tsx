import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Dog, Cat, Home, Sun, Moon, Trees, UserX, PawPrint, Send, ShieldCheck, Ban } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitterDetail } from '@/src/hooks/cuidadores/useSitterDetail';
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
import { formatCurrency, sentenceCase } from '@/src/utils/formatters';
import { layout, spacing, type } from '@/constants/design';

const toDate = (iso: string) => new Date(`${iso}T12:00:00`);

export default function SitterDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const s = useSitterDetail();
    const { sitter } = s;

    if (s.isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" />
                <View style={styles.loading}>
                    <Skeleton width={96} height={96} borderRadius={48} style={styles.center} />
                    <Skeleton width="50%" height={24} style={styles.center} />
                    <Skeleton height={72} />
                    <Skeleton height={120} />
                </View>
            </ScreenContainer>
        );
    }

    if (s.error || !sitter) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" />
                <EmptyState
                    icon={<UserX size={layout.icon.xl} color={theme.textMuted} />}
                    title="No pudimos cargar este perfil"
                    subtitle="Puede que ya no esté disponible o que no tengas conexión."
                    actionLabel="Ver cuidadores"
                    onAction={() => router.replace('/cuidadores')}
                />
            </ScreenContainer>
        );
    }

    const offersHosting = sitter.service_type === 'hosting' || sitter.service_type === 'both';
    const offersVisits = sitter.service_type === 'visiting' || sitter.service_type === 'both';

    // El promedio guardado en el perfil no siempre está al día: se calcula con las reseñas
    const average = s.reviews.length ? s.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / s.reviews.length : 0;
    const isSuspended = sitter.is_active === false;

    return (
        <ScreenContainer>
            <ScreenHeader title={sitter.display_name} subtitle={isSuspended ? 'Cuidador suspendido' : sitter.is_verified ? 'Cuidador verificado' : 'Cuidador'} />

            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />} contentContainerStyle={styles.content}>
                <ProviderHero
                    photoUrl={sitter.photo_url}
                    name={sitter.display_name}
                    rating={s.reviews.length ? average : undefined}
                    reviewCount={s.reviews.length}
                    accent={theme.secondary}
                >
                    {sitter.is_verified && !isSuspended ? (
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
                    { value: String(sitter.total_sits), label: 'Cuidados' },
                    { value: String(sitter.experience_years ?? 0), label: sitter.experience_years === 1 ? 'Año' : 'Años' },
                    { value: String(sitter.max_pets ?? 0), label: 'A la vez' },
                ]} />

                {sitter.bio ? (
                    <ProviderSection title="Sobre mí">
                        <ProviderBio text={sitter.bio} />
                    </ProviderSection>
                ) : null}

                <ProviderSection title="Servicios">
                    <ProviderServices services={[
                        { name: 'Hospedaje en su casa', active: offersHosting, icon: <Moon size={layout.icon.md} color={offersHosting ? theme.primary : theme.textMuted} /> },
                        { name: 'Visitas a domicilio', active: offersVisits, icon: <Sun size={layout.icon.md} color={offersVisits ? theme.primary : theme.textMuted} /> },
                        { name: 'Perros', active: sitter.accepts_dogs, icon: <Dog size={layout.icon.md} color={sitter.accepts_dogs ? theme.primary : theme.textMuted} /> },
                        { name: 'Gatos', active: sitter.accepts_cats, icon: <Cat size={layout.icon.md} color={sitter.accepts_cats ? theme.primary : theme.textMuted} /> },
                    ]} />
                </ProviderSection>

                {offersHosting && (sitter.home_type || sitter.has_yard) ? (
                    <ProviderSection title="Su casa">
                        <ProviderServices services={[
                            ...(sitter.home_type ? [{ name: sentenceCase(sitter.home_type), active: true, icon: <Home size={layout.icon.md} color={theme.primary} /> }] : []),
                            ...(sitter.has_yard ? [{ name: 'Patio', active: true, icon: <Trees size={layout.icon.md} color={theme.primary} /> }] : []),
                        ]} />
                    </ProviderSection>
                ) : null}

                {sitter.location ? (
                    <ProviderSection title="Zona">
                        <ProviderLocation text={sitter.location} />
                    </ProviderSection>
                ) : null}

                <ProviderSection title="Tarifas">
                    <View style={styles.prices}>
                        <ProviderPrice label="Por día" amount={sitter.price_per_day ? formatCurrency(sitter.price_per_day) : 'Por acordar'} />
                        {sitter.price_per_visit ? <ProviderPrice label="Por visita" amount={formatCurrency(sitter.price_per_visit)} /> : null}
                    </View>
                </ProviderSection>

                <ProviderSection title="Opiniones">
                    <ProviderRatingSummary rating={average} count={s.reviews.length} />
                    {s.unreviewedCompletedRequests.length > 0 ? (
                        <ProviderReviewForm
                            onSubmit={(rating, comment) => {
                                const req = s.unreviewedCompletedRequests[0];
                                if (req) s.handleCreateReview(req.id, { rating, comment });
                            }}
                            isSubmitting={s.isCreatingReview}
                        />
                    ) : null}
                    <ProviderReviews reviews={s.reviews.map((r: any) => ({ id: r.id, user_name: r.user_name, rating: r.rating, comment: r.comment, created_at: r.created_at }))} />
                </ProviderSection>
            </ScrollView>

            {!s.isOwnProfile ? (
                <ProviderFooter
                    label={isSuspended ? 'No disponible' : 'Solicitar cuidado'}
                    onPress={s.handleBook}
                    disabled={isSuspended}
                    icon={<Calendar size={layout.icon.sm} color={theme.onPrimary} />}
                />
            ) : null}

            <BottomSheet
                visible={s.sitModalVisible}
                onClose={() => s.setSitModalVisible(false)}
                title="Solicitar cuidado"
                subtitle={`Con ${sitter.display_name}`}
                footer={(
                    <>
                        <Button label="Cancelar" variant="secondary" onPress={() => s.setSitModalVisible(false)} style={styles.flex} />
                        <Button
                            label="Enviar"
                            icon={<Send size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={s.handleSubmitSitRequest}
                            loading={s.isRequestingSit}
                            style={styles.primary}
                        />
                    </>
                )}
            >
                <View style={styles.group}>
                    <Text style={[type.labelSentence, { color: theme.text }]}>¿A quién cuida?</Text>
                    {s.myPets.length === 0 ? (
                        <View style={styles.inline}>
                            <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>Primero agrega a tu mascota.</Text>
                            <Button label="Agregar" size="sm" onPress={() => { s.setSitModalVisible(false); router.push('/mascotas/nuevo'); }} />
                        </View>
                    ) : (
                        <View style={styles.chips}>
                            {s.myPets.map((pet: { id: string; name: string }) => {
                                const active = s.selectedPetId === pet.id;
                                return (
                                    <FilterChip
                                        key={pet.id}
                                        label={pet.name}
                                        active={active}
                                        onPress={() => s.setSelectedPetId(pet.id)}
                                        icon={<PawPrint size={layout.icon.xs} color={active ? theme.onPrimary : theme.textMuted} />}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>
                {sitter.service_type === 'both' ? (
                    <View style={styles.group}>
                        <Text style={[type.labelSentence, { color: theme.text }]}>Tipo de cuidado</Text>
                        <View style={styles.chips}>
                            <FilterChip label="Hospedaje en su casa" active={s.sitServiceType === 'hosting'} onPress={() => s.setSitServiceType('hosting')} />
                            <FilterChip label="Visitas a mi casa" active={s.sitServiceType === 'visiting'} onPress={() => s.setSitServiceType('visiting')} />
                        </View>
                    </View>
                ) : null}
                <View style={styles.row}>
                    <View style={styles.flex}>
                        <DatePicker label="Desde" value={toDate(s.startDate)} onChange={(d) => s.setStartDate(toLocalIsoDate(d))} minimumDate={new Date()} />
                    </View>
                    <View style={styles.flex}>
                        <DatePicker label="Hasta" value={toDate(s.endDate)} onChange={(d) => s.setEndDate(toLocalIsoDate(d))} minimumDate={toDate(s.startDate)} />
                    </View>
                </View>
                <FormField
                    label="Notas para el cuidador"
                    value={s.sitNotes}
                    onChangeText={s.setSitNotes}
                    placeholder="Alimentación, medicinas, dirección para visitas…"
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
    row: { flexDirection: 'row', gap: spacing.md },
    inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
