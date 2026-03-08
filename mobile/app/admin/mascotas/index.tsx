import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Dimensions, Image, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bone, Search, Filter, Plus, Heart, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const { width } = Dimensions.get('window');

const MOCK_MASCOTAS = [
    { id: '1', name: 'Luna', species: 'Perro', breed: 'Husky', owner: 'Juan Perez', status: 'Verificada', color: '#3b82f6' },
    { id: '2', name: 'Simba', species: 'Gato', breed: 'Persa', owner: 'Maria Garcia', status: 'Pendiente', color: '#f59e0b' },
    { id: '3', name: 'Rocky', species: 'Perro', breed: 'Bulldog', owner: 'Carlos Lopez', status: 'Verificada', color: '#ef4444' },
    { id: '4', name: 'Milo', species: 'Perro', breed: 'Poodle', owner: 'Ana Martinez', status: 'Verificada', color: '#10b981' },
    { id: '5', name: 'Nala', species: 'Gato', breed: 'Siames', owner: 'Elena Ruiz', status: 'Verificada', color: '#8b5cf6' },
];

export default function AdminMascotasScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const renderPetCard = ({ item }: { item: typeof MOCK_MASCOTAS[0] }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.avatarBox, { backgroundColor: item.color + '20' }]}>
                <Bone size={24} color={item.color} />
            </View>
            <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.petName, { color: theme.text }]}>{item.name}</Text>
                    {item.status === 'Verificada' && <Shield size={14} color="#3b82f6" fill="#3b82f630" />}
                </View>
                <Text style={[styles.petDetails, { color: theme.textMuted }]}>{item.species} • {item.breed}</Text>
                <Text style={[styles.ownerName, { color: theme.primary }]}>Dueño: {item.owner}</Text>
            </View>
            <ChevronLeft size={18} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={['#f59e0b', '#f59e0bE6', '#f59e0bCC']}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Mascotas</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Censo Global</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => Alert.alert("Nueva Mascota", "Formulario de registro")}
                    >
                        <Plus size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerStats}>
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>1,428</Text>
                        <Text style={styles.statLab}>Población</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>56</Text>
                        <Text style={styles.statLab}>Nuevos</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.filterRow}>
                <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput 
                        placeholder="Buscar por nombre o dueño..." 
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                    />
                </View>
                <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Filter size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_MASCOTAS}
                renderItem={renderPetCard}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        paddingHorizontal: 24, 
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#fff', 
        letterSpacing: -0.5 
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    liveDot: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        backgroundColor: '#10b981' 
    },
    subtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.8)',
    },
    headerStats: { 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 20, 
        marginTop: 28 
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
    filterRow: { 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        gap: 12, 
        marginTop: -18,
        zIndex: 20,
    },
    searchBox: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        height: 54, 
        borderRadius: 18, 
        borderWidth: 1.5, 
        gap: 12, 
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 10 
    },
    searchInput: { 
        flex: 1, 
        fontSize: 15, 
        fontWeight: '700' 
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
