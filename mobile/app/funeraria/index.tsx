import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryServices } from '@/src/hooks/funerary/useFuneraryServices';
import { FuneraryService, cremationLabel } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Heart, DollarSign, Plus, ClipboardList } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

import { useAuth } from '@/src/contexts/AuthContext';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { families, font, layout, spacing } from '@/constants/design';

export default function FunerariaScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, services, isLoading, router } = useFuneraryServices();

    const roleName = user?.role_name || '';
    const isFuneralHome = roleName === 'funeraria' || roleName === 'admin';

    const renderServiceItem = ({ item }: { item: FuneraryService }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/funeraria/reservar', params: { service_id: item.id } } as any)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.secondary + '20' }]}>
                    <Heart size={24} color={theme.secondary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: theme.primary + '10' }]}>
                    <DollarSign size={12} color={theme.primary} />
                    <Text style={[styles.tagText, { color: theme.primary }]}>${item.price}</Text>
                </View>
                {item.cremation_type && (
                    <View style={[styles.tag, { backgroundColor: theme.secondary + '10' }]}>
                        <Text style={[styles.tagText, { color: theme.secondary }]}>{cremationLabel(item.cremation_type)}</Text>
                    </View>
                )}
                {item.urn_included && (
                    <View style={[styles.tag, { backgroundColor: theme.warningLight }]}>
                        <Text style={[styles.tagText, { color: theme.warning }]}>Urna incluida</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Funeraria"
                subtitle="Servicios funerarios y memorial para tus mascotas"
            />

            <View style={styles.actionButtons}>
                {isFuneralHome ? (
                    <>
                        <TouchableOpacity
                            accessibilityRole="button"
                            style={[styles.actionButton, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/funeraria/nuevo-servicio')}
                        >
                            <Plus size={18} color={theme.onPrimary} />
                            <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Crear Servicio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                            onPress={() => router.push('/funeraria/gestion' as any)}
                        >
                            <Heart size={18} color={theme.onPrimary} />
                            <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Solicitudes</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            accessibilityRole="button"
                            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                            onPress={() => router.push('/funeraria/mis-reservas')}
                        >
                            <Heart size={18} color={theme.onPrimary} />
                            <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Mis Reservas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            style={[styles.actionButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
                            onPress={() => router.push('/funeraria/reporte-defuncion')}
                        >
                            <ClipboardList size={18} color={theme.textMuted} />
                            <Text style={[styles.actionButtonText, { color: theme.text }]}>Reportar defunción</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <View style={{ marginHorizontal: layout.screenPadding, marginBottom: spacing.xl }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar servicios funerarios..."
                />
            </View>

            {isLoading ? (
                <LoadingOverlay message="Cargando servicios..." />
            ) : (
                <FlatList
                    refreshControl={<AppRefreshControl />}
                    data={services}
                    renderItem={renderServiceItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Heart size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'No se encontraron servicios.' : 'No hay servicios disponibles.'}
                            subtitle={searchQuery ? 'Prueba con otra palabra.' : 'Pronto habrá funerarias disponibles en tu zona.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flexDirection: 'row',
        flexGrow: 1,
        flexBasis: '46%',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    actionButtonText: {
        fontSize: font.base,
        fontFamily: families.semibold,
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: layout.listClearance,
    },
    card: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.lg,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: font.xxl,
        fontFamily: families.extrabold,
        marginBottom: spacing.xs,
    },
    cardDesc: {
        fontSize: font.base,
        lineHeight: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
        gap: spacing.xs,
        justifyContent: 'center',
    },
    tagText: {
        fontSize: font.md,
        fontFamily: families.semibold,
    },
});
