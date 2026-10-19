import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminServices } from '@/src/hooks/admin/useAdminServices';
import { ClinicServiceItem } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import SearchBar from '@/src/components/SearchBar';
import { Briefcase, CheckCircle2, Layers } from 'lucide-react-native';
import StatTile from '@/src/components/StatTile';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { spacing, font } from '@/constants/design';

const CATEGORY_COLORS: Record<string, string> = {
    Médico: '#3b82f6',
    Estética: '#8b5cf6',
    Cuidado: '#f59e0b',
    Consultas: '#3b82f6',
    Preventiva: '#10b981',
    Especialidad: '#ef4444',
};

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
        const color = CATEGORY_COLORS[item.category || ''] || '#6b7280';
        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                    <Briefcase size={22} color={color} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.serviceName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.serviceCat, { color: theme.textMuted }]}>{item.category || 'Sin categoría'}{item.price != null ? ` • $${item.price}` : ''}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.is_active ? theme.success + '20' : '#f43f5e20' }]}>
                    <Text style={[styles.statusText, { color: item.is_active ? theme.success : '#f43f5e' }]}>{item.is_active ? 'Activo' : 'Pausado'}</Text>
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
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerStats: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.xxl,
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
        shadowColor: '#000',
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
    serviceName: { 
        fontSize: font.xl, 
        fontWeight: '800' 
    },
    serviceCat: { 
        fontSize: font.md, 
        fontWeight: '700', 
        marginTop: spacing.xs 
    },
    statusBadge: { 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.sm, 
        borderRadius: 10 
    },
    statusText: { 
        fontSize: font.xs, 
        fontWeight: '800', 
        textTransform: 'uppercase' 
    },
    moreBtn: { 
        width: 36, 
        height: 36, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginLeft: spacing.sm,
    }
});
