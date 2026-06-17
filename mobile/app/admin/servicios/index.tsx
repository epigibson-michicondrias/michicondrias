import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminServices } from '@/src/hooks/admin/useAdminServices';
import { ClinicServiceItem } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import SearchBar from '@/src/components/SearchBar';
import { Briefcase, Plus, MoreVertical } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

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
                <View style={[styles.statusBadge, { backgroundColor: item.is_active ? '#10b98120' : '#f43f5e20' }]}>
                    <Text style={[styles.statusText, { color: item.is_active ? '#10b981' : '#f43f5e' }]}>{item.is_active ? 'Activo' : 'Pausado'}</Text>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <MoreVertical size={20} color={theme.textMuted} />
                </TouchableOpacity>
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
            <ScreenHeader
                title="Servicios"
                gradient={['#14b8a6', '#14b8a6E6', '#14b8a6CC']}
                actionIcon={Plus}
                onAction={() => showAlert({ type: 'info', title: 'Nuevo Servicio', message: 'Abrir formulario de alta' })}
                rightElement={
                    <View style={styles.headerRight}>
                        <TouchableOpacity 
                            style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                            onPress={() => showAlert({ type: 'info', title: 'Nuevo Servicio', message: 'Abrir formulario de alta' })}
                        >
                            <Plus size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                }
            />
            <View style={styles.headerStats}>
                <View style={styles.statMini}>
                    <Text style={styles.statVal}>{activeCount}</Text>
                    <Text style={styles.statLab}>Activos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statMini}>
                    <Text style={styles.statVal}>{categoryCount}</Text>
                    <Text style={styles.statLab}>Categorías</Text>
                </View>
            </View>

            <View style={styles.searchBarContainer}>
                <SearchBar
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Buscar servicios..."
                />
            </View>

            <FlatList
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
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerStats: { 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 20, 
        marginTop: -12,
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    statMini: { alignItems: 'center' },
    statVal: { 
        fontSize: 22, 
        fontWeight: '900', 
        color: '#fff' 
    },
    statLab: { 
        fontSize: 10, 
        fontWeight: '800', 
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 0.5,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    searchBarContainer: { 
        paddingHorizontal: 20, 
        marginTop: -16,
        zIndex: 20,
    },
    list: { 
        padding: 20, 
        paddingBottom: 100,
        paddingTop: 8 
    },
    card: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 24, 
        borderWidth: 1.5, 
        marginBottom: 16,
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
    cardInfo: { flex: 1, marginLeft: 16 },
    serviceName: { 
        fontSize: 16, 
        fontWeight: '900' 
    },
    serviceCat: { 
        fontSize: 12, 
        fontWeight: '700', 
        marginTop: 4 
    },
    statusBadge: { 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 10 
    },
    statusText: { 
        fontSize: 9, 
        fontWeight: '900', 
        textTransform: 'uppercase' 
    },
    moreBtn: { 
        width: 36, 
        height: 36, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginLeft: 8,
    }
});
