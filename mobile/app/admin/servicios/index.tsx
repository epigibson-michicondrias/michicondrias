import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminServices } from '@/src/hooks/admin/useAdminServices';
import { ClinicServiceItem } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import SearchBar from '@/src/components/SearchBar';
import EmptyState from '@/src/components/EmptyState';
import { Briefcase, CheckCircle2, Layers } from 'lucide-react-native';
import StatTile from '@/src/components/StatTile';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { spacing, type, layout, radius, shadow, tint } from '@/constants/design';
import { sentenceCase } from '@/src/utils/formatters';

export default function AdminServiciosScreen() {
    const { theme } = useTheme();
    const {
        servicios,
        isLoading,
        searchText,
        setSearchText,
        activeCount,
        categoryCount,
    } = useAdminServices();

    const renderServiceCard = ({ item }: { item: ClinicServiceItem }) => {
        const color = theme.primary;
        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <View style={[styles.iconBox, { backgroundColor: color + tint.faint }]}>
                    <Briefcase size={22} color={color} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[type.bodyStrong, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[type.caption, { color: theme.textMuted }]}>{sentenceCase(item.category) || 'Sin categoría'}{item.price != null ? ` • $${item.price}` : ''}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.is_active ? theme.success + tint.faint : theme.error + tint.faint }]}>
                    <Text style={[type.caption, { color: item.is_active ? theme.success : theme.error, fontWeight: '800' }]}>{item.is_active ? 'Activo' : 'Pausado'}</Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando servicios..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader title="Servicios" subtitle="Catálogo de todas las clínicas" />
            <View style={styles.headerStats}>
                <StatTile icon={CheckCircle2} value={activeCount} label="Activos" color={theme.success} />
                <StatTile icon={Layers} value={categoryCount} label="Categorías" color={theme.info} />
            </View>

            <View style={styles.searchBarContainer}>
                <SearchBar
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Buscar servicios..."
                />
            </View>

            <FlatList
                refreshControl={<AppRefreshControl />}
                data={servicios}
                renderItem={renderServiceCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon={<Briefcase size={layout.icon.xl} color={theme.textMuted} />}
                        title={searchText ? 'Sin resultados' : 'Sin servicios'}
                        subtitle={searchText ? 'Prueba con otro término de búsqueda.' : 'Los servicios que registren las clínicas aparecerán aquí.'}
                    />
                }
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerStats: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.md,
    },
    searchBarContainer: { 
        paddingHorizontal: spacing.xl,
    },
    list: { 
        padding: spacing.xl, 
        paddingBottom: 100,
        paddingTop: spacing.sm 
    },
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: spacing.lg, 
        borderRadius: 24, 
        borderWidth: 1.5, 
        marginBottom: spacing.lg,
        elevation: 3,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    iconBox: { 
        width: 52, 
        height: 52, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 1,
    },
    cardInfo: { flex: 1, marginLeft: spacing.lg },
    statusBadge: { 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderRadius: 10 
    },
    moreBtn: { 
        width: 36, 
        height: 36, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginLeft: spacing.sm,
    }
});
