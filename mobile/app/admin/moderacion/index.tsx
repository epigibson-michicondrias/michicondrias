import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminModeration, TabType } from '@/src/hooks/admin/useAdminModeration';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import {
    Heart,
    CheckCircle2,
    MapPin,
    Hospital,
    XCircle,
    ClipboardList,
    PawPrint,
    AlertCircle,
    ShoppingBag,
    UserCircle,
    FileText
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminModerationScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        activeTab,
        setActiveTab,
        isLoading,
        handleAction,
        getDataForTab,
    } = useAdminModeration();

    const renderEmpty = () => (
        <EmptyState
            icon={<CheckCircle2 size={48} color={theme.primary} strokeWidth={1} />}
            title="¡Todo en orden!"
            subtitle="No hay elementos pendientes de moderación en esta categoría."
        />
    );

    const renderAdoptionItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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

    const renderLostPetItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Image 
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400' }} 
                style={styles.cardCover} 
            />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.pet_name}</Text>
                    <View style={[styles.badge, { backgroundColor: item.report_type === 'lost' ? '#ef444415' : '#3b82f615' }]}>
                        <Text style={[styles.badgeText, { color: item.report_type === 'lost' ? '#ef4444' : '#3b82f6' }]}>
                            {item.report_type === 'lost' ? 'PERDIDO' : 'ENCONTRADO'}
                        </Text>
                    </View>
                </View>
                <View style={styles.infoRowCompact}>
                    <MapPin size={12} color={theme.textMuted} />
                    <Text style={[styles.userEmail, { color: theme.textMuted }]}>{item.last_seen_location}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textMuted, marginTop: 10 }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#ef444415' }]}
                        onPress={() => handleAction('reject', 'perdidas', item.id, item.pet_name)}
                    >
                        <XCircle size={18} color="#ef4444" />
                        <Text style={[styles.btnActionText, { color: '#ef4444' }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#10b98115' }]}
                        onPress={() => handleAction('approve', 'perdidas', item.id, item.pet_name)}
                    >
                        <CheckCircle2 size={18} color="#10b981" />
                        <Text style={[styles.btnActionText, { color: '#10b981' }]}>Aprobar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderClinicItem = ({ item }: { item: any }) => {
        const isVet = item.specialty !== undefined || item.professional_license !== undefined;
        const Icon = isVet ? UserCircle : Hospital;
        const typeLabel = isVet ? 'VETERINARIO' : 'CLÍNICA';
        const typeColor = isVet ? '#8b5cf6' : '#3b82f6';

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.cardIconBox, { backgroundColor: theme.background }]}>
                    <Icon size={32} color={isVet ? '#8b5cf6' : theme.primary} />
                </View>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name || item.full_name}</Text>
                        <View style={[styles.badge, { backgroundColor: typeColor + '15' }]}>
                            <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.userEmail, { color: theme.textMuted }]}>
                            {item.city ? `${item.city}, ${item.state}` : (item.email || 'Sin ubicación')}
                        </Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity
                            style={[styles.btnAction, { backgroundColor: '#ef444415' }]}
                            onPress={() => handleAction('reject', 'directorio', item.id, item.name || item.full_name)}
                        >
                            <XCircle size={18} color="#ef4444" />
                            <Text style={[styles.btnActionText, { color: '#ef4444' }]}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnAction, { backgroundColor: '#10b98115' }]}
                            onPress={() => handleAction('approve', 'directorio', item.id, item.name || item.full_name)}
                        >
                            <CheckCircle2 size={18} color="#10b981" />
                            <Text style={[styles.btnActionText, { color: '#10b981' }]}>Activar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderRequestItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
                        style={[styles.btnAction, { backgroundColor: '#10b98115' }]}
                        onPress={() => handleAction('approve', 'solicitudes', item.id, `Solicitud de ${item.applicant_name}`)}
                    >
                        <CheckCircle2 size={18} color="#10b981" />
                        <Text style={[styles.btnActionText, { color: '#10b981' }]}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnActionSquare, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => router.push(`/adopciones/solicitudes?id=${item.listing_id}` as any)}
                    >
                        <FileText size={18} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <LoadingOverlay message="Obteniendo reportes pendientes..." />
            );
        }

        const data = getDataForTab();
        let renderFn = (item: any) => <View />;

        switch (activeTab) {
            case 'adopciones':
                renderFn = (item) => renderAdoptionItem({ item });
                break;
            case 'solicitudes':
                renderFn = (item) => renderRequestItem({ item });
                break;
            case 'ecommerce':
                renderFn = (item) => renderProductItem({ item });
                break;
            case 'directorio':
                renderFn = (item) => renderClinicItem({ item });
                break;
            case 'perdidas':
                renderFn = (item) => renderLostPetItem({ item });
                break;
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
        <ScreenContainer>
            <ScreenHeader
                title="Moderación"
                gradient={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                rightElement={
                    <View style={styles.headerAction}>
                        <ClipboardList size={22} color="#fff" style={{ opacity: 0.8 }} />
                    </View>
                }
            />

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.tabsScroll}
                >
                    {[
                        { key: 'adopciones', label: 'Adopciones', icon: PawPrint },
                        { key: 'solicitudes', label: 'Solicitudes', icon: Heart },
                        { key: 'ecommerce', label: 'Productos', icon: ShoppingBag },
                        { key: 'directorio', label: 'Directorio', icon: Hospital },
                        { key: 'perdidas', label: 'Mascotas Perdidas', icon: AlertCircle },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as TabType)}
                                style={[
                                    styles.tab,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                    isActive && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                            >
                                <Icon size={16} color={isActive ? '#fff' : theme.textMuted} />
                                <Text style={[styles.tabText, { color: isActive ? '#fff' : theme.textMuted }]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {renderContent()}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerAction: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: { 
        marginTop: -12, 
        marginBottom: 16,
        zIndex: 20,
    },
    tabsScroll: { 
        paddingHorizontal: 24, 
        gap: 10,
        paddingBottom: 8,
    },
    tab: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 16, 
        borderWidth: 1,
    },
    tabText: { 
        fontSize: 13, 
        fontWeight: '800' 
    },
    content: { flex: 1 },
    listContainer: { 
        paddingHorizontal: 20, 
        paddingBottom: 40, 
        paddingTop: 8 
    },
    card: { 
        borderRadius: 24, 
        marginBottom: 20, 
        overflow: 'hidden', 
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    cardPadding: { padding: 20 },
    cardCover: { 
        width: '100%', 
        height: 180,
        backgroundColor: '#f1f5f9' 
    },
    cardIconBox: { 
        width: 64, 
        height: 64, 
        borderRadius: 20, 
        alignSelf: 'center', 
        marginTop: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 2,
    },
    cardContent: { padding: 20 },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    cardTitle: { 
        fontSize: 17, 
        fontWeight: '900', 
        flex: 1 
    },
    cardDesc: { 
        fontSize: 13, 
        fontWeight: '500', 
        lineHeight: 19, 
        marginBottom: 20 
    },
    badge: { 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8 
    },
    badgeText: { 
        fontSize: 10, 
        fontWeight: '900' 
    },
    priceTag: { 
        fontSize: 16, 
        fontWeight: '900',
        marginLeft: 12 
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 20 
    },
    userEmail: { 
        fontSize: 12, 
        fontWeight: '700' 
    },
    cardActions: { 
        flexDirection: 'row', 
        gap: 12 
    },
    btnAction: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8, 
        height: 50, 
        borderRadius: 16 
    },
    btnActionText: { 
        fontSize: 14, 
        fontWeight: '800' 
    },
    btnActionSquare: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoRowCompact: {
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6,
    },
    dateText: { 
        fontSize: 11, 
        fontWeight: '700',
    },
    notesBox: { 
        padding: 16, 
        borderRadius: 16, 
        marginTop: 4, 
        marginBottom: 20, 
        borderLeftWidth: 4, 
        borderLeftColor: '#7c3aed' 
    },
    notesText: { 
        fontSize: 13, 
        fontWeight: '600', 
        fontStyle: 'italic',
        lineHeight: 18,
    }
});
