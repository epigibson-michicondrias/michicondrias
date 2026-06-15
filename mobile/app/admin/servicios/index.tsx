import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Dimensions, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Briefcase, Plus, Search, MoreVertical, Settings2, Activity, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '@/src/components/AppAlert';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { getAllServices, ClinicServiceItem } from '@/src/services/directorio';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS: Record<string, string> = {
    Médico: '#3b82f6',
    Estética: '#8b5cf6',
    Cuidado: '#f59e0b',
    Consultas: '#3b82f6',
    Preventiva: '#10b981',
    Especialidad: '#ef4444',
};

export default function AdminServiciosScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: servicios = [], isLoading } = useQuery({
        queryKey: ['admin-services'],
        queryFn: getAllServices,
    });

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
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#14b8a6" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={['#14b8a6', '#14b8a6E6', '#14b8a6CC']}
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
                        <Text style={styles.title}>Servicios</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Gestión Operativa</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => showAlert({ type: 'info', title: 'Nuevo Servicio', message: 'Abrir formulario de alta' })}
                    >
                        <Plus size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerStats}>
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>{servicios.filter(s => s.is_active).length}</Text>
                        <Text style={styles.statLab}>Activos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statMini}>
                        <Text style={styles.statVal}>{new Set(servicios.map(s => s.category).filter(Boolean)).size}</Text>
                        <Text style={styles.statLab}>Categorías</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.searchBarContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput 
                        placeholder="Buscar servicios..." 
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                    />
                </View>
            </View>

            <FlatList
                data={servicios}
                renderItem={renderServiceCard}
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
    searchBarContainer: { 
        paddingHorizontal: 20, 
        marginTop: -16,
        zIndex: 20,
    },
    searchBar: { 
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
