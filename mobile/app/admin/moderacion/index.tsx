import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ModeracionService from '@/src/services/moderacion';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
    Shield,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    AlertCircle,
    PawPrint,
    ShoppingBag,
    Hospital,
    UserCheck,
    Clock,
    MoreVertical,
    MapPin,
    Calendar,
    Info,
    Heart,
    Bone
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type TabType = 'adopciones' | 'solicitudes' | 'perdidas' | 'directorio' | 'ecommerce';

export default function AdminModerationScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('adopciones');

    // Queries
    const { data: pendingAdoptions = [], isLoading: loadingAdoptions } = useQuery({
        queryKey: ['pending-adoptions'],
        queryFn: ModeracionService.getPendingAdoptions,
    });

    const { data: pendingProducts = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['pending-products'],
        queryFn: ModeracionService.getPendingProducts,
    });

    const { data: pendingLostPets = [], isLoading: loadingLostPets } = useQuery({
        queryKey: ['pending-lost-pets'],
        queryFn: ModeracionService.getPendingLostPets,
    });

    const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ['pending-requests'],
        queryFn: ModeracionService.getGlobalPendingRequests,
    });

    const { data: pendingClinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['pending-clinics'],
        queryFn: ModeracionService.getPendingClinics,
    });

    const { data: pendingVets = [], isLoading: loadingVets } = useQuery({
        queryKey: ['pending-vets'],
        queryFn: ModeracionService.getPendingVeterinarians,
    });

    const isLoading = loadingAdoptions || loadingProducts || loadingLostPets || loadingClinics || loadingVets || loadingRequests;

    // Mutations
    const handleAction = async (action: 'approve' | 'reject', type: TabType | 'solicitudes', id: string, name: string) => {
        Alert.alert(
            action === 'approve' ? "Aprobar Contenido" : "Rechazar Contenido",
            `¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} a: ${name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: action === 'approve' ? "Aprobar" : "Rechazar",
                    style: action === 'approve' ? "default" : "destructive",
                    onPress: async () => {
                        try {
                            if (type === 'adopciones') {
                                action === 'approve' ? await ModeracionService.approveAdoption(id) : await ModeracionService.rejectAdoption(id);
                                queryClient.invalidateQueries({ queryKey: ['pending-adoptions'] });
                            } else if (type === 'ecommerce') {
                                action === 'approve' ? await ModeracionService.approveProduct(id) : await ModeracionService.rejectProduct(id);
                                queryClient.invalidateQueries({ queryKey: ['pending-products'] });
                            } else if (type === 'perdidas') {
                                action === 'approve' ? await ModeracionService.approveLostPet(id) : await ModeracionService.rejectLostPet(id);
                                queryClient.invalidateQueries({ queryKey: ['pending-lost-pets'] });
                            } else if (type === 'directorio') {
                                action === 'approve' ? await ModeracionService.approveClinic(id) : await ModeracionService.rejectClinic(id);
                                queryClient.invalidateQueries({ queryKey: ['pending-clinics'] });
                            } else if (type === 'solicitudes') {
                                // Redirigir a la gestión si es aprobación, o rechazar
                                if (action === 'reject') {
                                    // No tenemos reject solicitud global directo en el service web, pero usaremos el mismo patrón
                                    await ModeracionService.rejectAdoption(id);
                                }
                                queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
                            }
                            Alert.alert("Éxito", `Contenido procesado correctamente.`);
                        } catch (e) {
                            Alert.alert("Error", "No se pudo completar la acción.");
                        }
                    }
                }
            ]
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBox, { backgroundColor: theme.surface }]}>
                <CheckCircle2 size={48} color={theme.primary} strokeWidth={1} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>¡Todo en orden!</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>No hay elementos pendientes de moderación en esta categoría.</Text>
        </View>
    );

    const renderAdoptionItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Image source={{ uri: item.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400' }} style={styles.cardCover} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>{item.species?.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#ef444415' }]}
                        onPress={() => handleAction('reject', 'adopciones', item.id, item.name)}
                    >
                        <XCircle size={18} color="#ef4444" />
                        <Text style={[styles.btnActionText, { color: '#ef4444' }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#10b98115' }]}
                        onPress={() => handleAction('approve', 'adopciones', item.id, item.name)}
                    >
                        <CheckCircle2 size={18} color="#10b981" />
                        <Text style={[styles.btnActionText, { color: '#10b981' }]}>Aprobar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderProductItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Image source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400' }} style={styles.cardCover} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.priceTag, { color: theme.primary }]}>${item.price}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#ef444415' }]}
                        onPress={() => handleAction('reject', 'ecommerce', item.id, item.name)}
                    >
                        <XCircle size={18} color="#ef4444" />
                        <Text style={[styles.btnActionText, { color: '#ef4444' }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#10b98115' }]}
                        onPress={() => handleAction('approve', 'ecommerce', item.id, item.name)}
                    >
                        <CheckCircle2 size={18} color="#10b981" />
                        <Text style={[styles.btnActionText, { color: '#10b981' }]}>Aprobar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderClinicItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.cardIconBox, { backgroundColor: theme.background }]}>
                <Hospital size={32} color={theme.primary} />
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: '#3b82f615' }]}>
                        <Text style={[styles.badgeText, { color: '#3b82f6' }]}>DIRECTORIO</Text>
                    </View>
                </View>
                <View style={styles.infoRow}>
                    <MapPin size={12} color={theme.textMuted} />
                    <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.city}, {item.state}</Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#ef444415' }]}
                        onPress={() => handleAction('reject', 'directorio', item.id, item.name)}
                    >
                        <XCircle size={18} color="#ef4444" />
                        <Text style={[styles.btnActionText, { color: '#ef4444' }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#10b98115' }]}
                        onPress={() => handleAction('approve', 'directorio', item.id, item.name)}
                    >
                        <CheckCircle2 size={18} color="#10b981" />
                        <Text style={[styles.btnActionText, { color: '#10b981' }]}>Activar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderRequestItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.cardPadding}>
                <View style={styles.cardHeader}>
                    <View style={[styles.badge, { backgroundColor: '#f59e0b15' }]}>
                        <Text style={[styles.badgeText, { color: '#f59e0b' }]}>SOLICITUD</Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>Para: {item.pet_name}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text, marginTop: 8 }]}>{item.applicant_name}</Text>
                <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.notesText, { color: theme.textMuted }]}>"{item.reason}"</Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#ef444415' }]}
                        onPress={() => handleAction('reject', 'solicitudes', item.id, `Solicitud de ${item.applicant_name}`)}
                    >
                        <XCircle size={18} color="#ef4444" />
                        <Text style={[styles.btnActionText, { color: '#ef4444' }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => router.push(`/adopciones/solicitudes?id=${item.listing_id}` as any)}
                    >
                        <Search size={18} color={theme.primary} />
                        <Text style={[styles.btnActionText, { color: theme.primary }]}>Gestionar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Obteniendo reportes pendientes...</Text>
                </View>
            );
        }

        let data: any[] = [];
        let renderFn = (item: any) => <View />;

        switch (activeTab) {
            case 'adopciones':
                data = pendingAdoptions;
                renderFn = (item) => renderAdoptionItem({ item });
                break;
            case 'solicitudes':
                data = pendingRequests;
                renderFn = (item) => renderRequestItem({ item });
                break;
            case 'ecommerce':
                data = pendingProducts;
                renderFn = (item) => renderProductItem({ item });
                break;
            case 'directorio':
                data = [...pendingClinics, ...pendingVets];
                renderFn = (item) => renderClinicItem({ item });
                break;
            case 'perdidas':
                data = pendingLostPets;
                renderFn = (item) => renderAdoptionItem({ item });
                break;
            default:
                data = [];
        }

        return (
            <FlatList
                data={data}
                renderItem={renderFn}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <LinearGradient colors={[theme.primary + '20', 'transparent']} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={[styles.liveBadge, { backgroundColor: '#10b98120' }]}>
                        <View style={[styles.liveDot, { backgroundColor: '#10b981' }]} />
                        <Text style={[styles.liveText, { color: '#10b981' }]}>Moderación en Vivo</Text>
                    </View>
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Admin Moderation Hub</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>Revisa y aprueba el contenido antes de que sea público.</Text>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {[
                        { key: 'adopciones', label: 'Mascotas', icon: PawPrint },
                        { key: 'solicitudes', label: 'Solicitudes', icon: Heart },
                        { key: 'ecommerce', label: 'Tienda', icon: ShoppingBag },
                        { key: 'directorio', label: 'Profesionales', icon: Hospital },
                        { key: 'perdidas', label: 'Perdidas', icon: AlertCircle },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as TabType)}
                                style={[
                                    styles.tab,
                                    { borderColor: theme.border },
                                    isActive && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                            >
                                <Icon size={18} color={isActive ? '#fff' : theme.textMuted} />
                                <Text style={[styles.tabText, { color: isActive ? '#fff' : theme.textMuted }]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {renderContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    liveDot: { width: 6, height: 6, borderRadius: 3 },
    liveText: { fontSize: 10, fontWeight: '800' },
    title: { fontSize: 26, fontWeight: '900' },
    subtitle: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    tabsContainer: { marginBottom: 16 },
    tabsScroll: { paddingHorizontal: 24, gap: 10 },
    tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1 },
    tabText: { fontSize: 13, fontWeight: '700' },
    content: { flex: 1 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, gap: 16 },
    loadingText: { fontSize: 14, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
    emptySubtitle: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
    card: { borderRadius: 24, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardPadding: { padding: 20 },
    cardCover: { width: '100%', height: 160 },
    cardIconBox: { width: 64, height: 64, borderRadius: 16, alignSelf: 'center', marginTop: 20, justifyContent: 'center', alignItems: 'center' },
    cardContent: { padding: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    cardTitle: { fontSize: 18, fontWeight: '900', flex: 1 },
    cardDesc: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 16 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: '900' },
    priceTag: { fontSize: 16, fontWeight: '900' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    userEmail: { fontSize: 11, fontWeight: '700' },
    cardActions: { flexDirection: 'row', gap: 12 },
    btnAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 14 },
    btnActionText: { fontSize: 13, fontWeight: '800' },
    dateText: { fontSize: 11, fontWeight: '600' },
    notesBox: { padding: 12, borderRadius: 12, marginTop: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#7c3aed' },
    notesText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' }
});
