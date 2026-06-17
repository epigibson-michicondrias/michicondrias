import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminPets, Pet } from '@/src/hooks/admin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import { ChevronLeft, Bone, Filter, Plus, Shield } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

const SPECIES_COLORS: Record<string, string> = {
    Perro: '#3b82f6',
    Gato: '#8b5cf6',
    Ave: '#10b981',
    Conejo: '#f59e0b',
};

export default function AdminMascotasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { mascotas, isLoading, isFetching, refetch, searchText, setSearchText, vaccinatedCount } = useAdminPets();

    const renderPetCard = ({ item }: { item: Pet }) => {
        const color = SPECIES_COLORS[item.species] || '#6b7280';
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.avatarBox, { backgroundColor: color + '20' }]}>
                    <Bone size={24} color={color} />
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.petName, { color: theme.text }]}>{item.name}</Text>
                        {item.is_vaccinated && <Shield size={14} color="#3b82f6" fill="#3b82f630" />}
                    </View>
                    <Text style={[styles.petDetails, { color: theme.textMuted }]}>{item.species}{item.breed ? ` • ${item.breed}` : ''}</Text>
                    <Text style={[styles.ownerName, { color: theme.primary }]}>Dueño: {item.owner_id}</Text>
                </View>
                <ChevronLeft size={18} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
        );
    };

    const ListHeader = (
        <View>
            {/* Stats in header area */}
            <View style={styles.statsRow}>
                <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{mascotas.length}</Text>
                    <Text style={[styles.statLab, { color: theme.textMuted }]}>Población</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{vaccinatedCount}</Text>
                    <Text style={[styles.statLab, { color: theme.textMuted }]}>Vacunadas</Text>
                </View>
            </View>

            {/* Search + Filter */}
            <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                    <SearchBar
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Buscar por nombre o dueño..."
                    />
                </View>
                <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Filter size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mascotas"
                subtitle="Censo Global"
                gradient={['#f59e0b', '#f59e0bE6', '#f59e0bCC']}
                actionIcon={Plus}
                onAction={() => showAlert({ type: 'info', title: 'Nueva Mascota', message: 'Formulario de registro' })}
            />

            <DataList
                data={mascotas}
                renderItem={renderPetCard}
                keyExtractor={item => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando mascotas..."
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                emptyIcon={<Bone size={48} color={theme.textMuted} strokeWidth={1} />}
                emptyTitle="No hay mascotas"
                emptySubtitle="No hay mascotas registradas."
                contentStyle={styles.list}
                header={ListHeader}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statVal: { 
        fontSize: 22, 
        fontWeight: '900',
    },
    statLab: { 
        fontSize: 10, 
        fontWeight: '800', 
        letterSpacing: 0.5,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    filterRow: { 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        gap: 12, 
    },
    filterBtn: { 
        width: 54, 
        height: 54, 
        borderRadius: 18, 
        borderWidth: 1.5, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 10 
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
    avatarBox: { 
        width: 60, 
        height: 60, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 1,
    },
    cardInfo: { flex: 1, marginLeft: 16 },
    nameRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
    },
    petName: { 
        fontSize: 17, 
        fontWeight: '900' 
    },
    petDetails: { 
        fontSize: 13, 
        fontWeight: '700', 
        marginTop: 2 
    },
    ownerName: { 
        fontSize: 12, 
        fontWeight: '800', 
        marginTop: 6 
    }
});
