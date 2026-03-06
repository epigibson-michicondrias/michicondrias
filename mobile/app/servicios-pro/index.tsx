import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listWalkers, Walker } from '../../src/services/paseadores';
import { listSitters, Sitter } from '../../src/services/cuidadores';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Star, ShieldCheck, MapPin, Dog, Cat, ChevronRight, User } from 'lucide-react-native';

export default function ServiciosProScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [activeTab, setActiveTab] = useState<'walkers' | 'sitters'>('walkers');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: walkers = [], isLoading: loadingWalkers } = useQuery({
        queryKey: ['walkers'],
        queryFn: () => listWalkers(),
        enabled: activeTab === 'walkers',
    });

    const { data: sitters = [], isLoading: loadingSitters } = useQuery({
        queryKey: ['sitters'],
        queryFn: () => listSitters(),
        enabled: activeTab === 'sitters',
    });

    const filteredData = (activeTab === 'walkers' ? walkers : sitters).filter((item: any) =>
        item.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/servicios-pro/${activeTab}/${item.id}` as any)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200' }}
                        style={styles.profileImage}
                    />
                    {item.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={12} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.mainInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: theme.text }]}>{item.display_name}</Text>
                        <View style={styles.ratingBox}>
                            <Star size={14} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>{item.rating?.toFixed(1) || '5.0'}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.location, { color: theme.textMuted }]}>{item.location || 'Ciudad de México'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.tagsContainer}>
                    {item.accepts_dogs && <View style={[styles.tag, { backgroundColor: theme.primary + '15' }]}><Dog size={12} color={theme.primary} /><Text style={[styles.tagText, { color: theme.primary }]}>Perros</Text></View>}
                    {item.accepts_cats && <View style={[styles.tag, { backgroundColor: theme.secondary + '15' }]}><Cat size={12} color={theme.secondary} /><Text style={[styles.tagText, { color: theme.secondary }]}>Gatos</Text></View>}
                </View>
                <Text style={[styles.price, { color: theme.primary }]}>
                    ${activeTab === 'walkers' ? item.price_per_walk || 150 : item.price_per_day || 250}
                    <Text style={[styles.priceUnit, { color: theme.textMuted }]}> / {activeTab === 'walkers' ? 'paseo' : 'día'}</Text>
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Servicios Pro</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Expertos al cuidado de tu mascota</Text>
                </View>
                <TouchableOpacity
                    style={[styles.profileBtn, { backgroundColor: theme.surface }]}
                    onPress={() => router.push('/perfil/pro' as any)}
                >
                    <User size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'walkers' && { backgroundColor: theme.primary }]}
                    onPress={() => setActiveTab('walkers')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'walkers' ? '#fff' : theme.textMuted }]}>Paseadores</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sitters' && { backgroundColor: theme.primary }]}
                    onPress={() => setActiveTab('sitters')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'sitters' ? '#fff' : theme.textMuted }]}>Cuidadores</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        placeholder={`Buscar ${activeTab === 'walkers' ? 'paseadores' : 'cuidadores'}...`}
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {(loadingWalkers || loadingSitters) ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredData as any}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No se encontraron profesionales disponibles.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    profileBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    searchSection: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    card: {
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 20,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#6366f1',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1e293b',
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 17,
        fontWeight: '800',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
    },
    priceUnit: {
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        paddingTop: 60,
    }
});
