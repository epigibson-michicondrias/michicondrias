import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminPets, type Pet } from '@/src/hooks/admin/useAdminPets';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import { ChevronLeft, Bone, Shield } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

const SPECIES_COLORS: Record<string, string> = {
    Perro: '#3b82f6',
    Gato: '#8b5cf6',
    Ave: '#10b981',
    Conejo: '#f59e0b',
};

export default function AdminMascotasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { mascotas, isLoading, isFetching, refetch, searchText, setSearchText, vaccinatedCount, ownerName } = useAdminPets();

    const renderPetCard = ({ item }: { item: Pet }) => {
        const color = SPECIES_COLORS[item.species] || '#6b7280';
        return (
            <TouchableOpacity accessibilityRole="button"
                style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(`/mascotas/${item.id}` as any)}
            >
                <View style={[styles.avatarBox, { backgroundColor: color + '20' }]}>
                    <Bone size={24} color={color} />
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.petName, { color: theme.text }]}>{item.name}</Text>
                        {item.is_vaccinated && <Shield size={14} color={theme.info} fill={theme.info + '30'} />}
                    </View>
                    <Text style={[styles.petDetails, { color: theme.textMuted }]}>{item.species}{item.breed ? ` • ${item.breed}` : ''}</Text>
                    <Text style={[styles.ownerName, { color: theme.primary }]} numberOfLines={1}>Dueño: {ownerName(item.owner_id)}</Text>
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
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mascotas"
                subtitle="Censo Global"
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
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statVal: { 
        fontSize: font.h2, 
        fontWeight: '800',
    },
    statLab: { 
        fontSize: font.xs, 
        fontWeight: '800', 
        letterSpacing: 0.5,
        marginTop: spacing.xxs,
        textTransform: 'uppercase',
    },
    filterRow: { 
        flexDirection: 'row', 
        paddingHorizontal: spacing.xl, 
        paddingVertical: spacing.md, 
        gap: spacing.md, 
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
    avatarBox: { 
        width: 60, 
        height: 60, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 1,
    },
    cardInfo: { flex: 1, marginLeft: spacing.lg },
    nameRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm 
    },
    petName: { 
        fontSize: font.xxl, 
        fontWeight: '800' 
    },
    petDetails: { 
        fontSize: font.base, 
        fontWeight: '700', 
        marginTop: spacing.xxs 
    },
    ownerName: { 
        fontSize: font.md, 
        fontWeight: '800', 
        marginTop: spacing.sm 
    }
});
