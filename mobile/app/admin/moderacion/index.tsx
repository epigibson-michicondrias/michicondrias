import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
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
    PawPrint,
    Package,
    AlertCircle,
    ShoppingBag,
    UserCircle,
    FileText
} from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { accents, families, font, layout, spacing, tint } from '@/constants/design';

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
            {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={[styles.cardCover, { backgroundColor: theme.backgroundSecondary }]} accessibilityLabel={item.name || 'Mascota en adopción'} />
            ) : (
                <View style={[styles.cardCover, styles.coverFallback, { backgroundColor: theme.primary + tint.faint }]}>
                    <PawPrint size={layout.icon.xl} color={theme.primary} />
                </View>
            )}
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>{item.species?.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.error + tint.faint }]}
                        onPress={() => handleAction('reject', 'adopciones', item.id, item.name)}
                    >
                        <XCircle size={18} color={theme.error} />
                        <Text style={[styles.btnActionText, { color: theme.error }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.success + tint.faint }]}
                        onPress={() => handleAction('approve', 'adopciones', item.id, item.name)}
                    >
                        <CheckCircle2 size={18} color={theme.success} />
                        <Text style={[styles.btnActionText, { color: theme.success }]}>Aprobar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderProductItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={[styles.cardCover, { backgroundColor: theme.backgroundSecondary }]} accessibilityLabel={item.name || 'Producto'} />
            ) : (
                <View style={[styles.cardCover, styles.coverFallback, { backgroundColor: theme.primary + tint.faint }]}>
                    <Package size={layout.icon.xl} color={theme.primary} />
                </View>
            )}
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.priceTag, { color: theme.primary }]}>${item.price}</Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.error + tint.faint }]}
                        onPress={() => handleAction('reject', 'ecommerce', item.id, item.name)}
                    >
                        <XCircle size={18} color={theme.error} />
                        <Text style={[styles.btnActionText, { color: theme.error }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.success + tint.faint }]}
                        onPress={() => handleAction('approve', 'ecommerce', item.id, item.name)}
                    >
                        <CheckCircle2 size={18} color={theme.success} />
                        <Text style={[styles.btnActionText, { color: theme.success }]}>Aprobar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderLostPetItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={[styles.cardCover, { backgroundColor: theme.backgroundSecondary }]} accessibilityLabel={item.pet_name || 'Mascota reportada'} />
            ) : (
                <View style={[styles.cardCover, styles.coverFallback, { backgroundColor: theme.primary + tint.faint }]}>
                    <PawPrint size={layout.icon.xl} color={theme.primary} />
                </View>
            )}
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.pet_name || 'Mascota sin nombre'}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: (item.report_type === 'lost' ? theme.error : theme.info) + tint.faint }]}>
                        <Text style={[styles.badgeText, { color: item.report_type === 'lost' ? theme.error : theme.info }]}>
                            {item.report_type === 'lost' ? 'PERDIDO' : 'ENCONTRADO'}
                        </Text>
                    </View>
                </View>
                <View style={styles.infoRowCompact}>
                    <MapPin size={12} color={theme.textMuted} />
                    <Text style={[styles.userEmail, { color: theme.textMuted }]} numberOfLines={1}>
                        {item.last_seen_location || 'Ubicación no indicada'}
                    </Text>
                </View>
                <Text style={[styles.cardDesc, { color: theme.textMuted, marginTop: spacing.md }]} numberOfLines={2}>
                    {item.description || 'Sin descripción.'}
                </Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.error + tint.faint }]}
                        onPress={() => handleAction('reject', 'perdidas', item.id, item.pet_name)}
                    >
                        <XCircle size={18} color={theme.error} />
                        <Text style={[styles.btnActionText, { color: theme.error }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.success + tint.faint }]}
                        onPress={() => handleAction('approve', 'perdidas', item.id, item.pet_name)}
                    >
                        <CheckCircle2 size={18} color={theme.success} />
                        <Text style={[styles.btnActionText, { color: theme.success }]}>Aprobar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderClinicItem = ({ item }: { item: any }) => {
        const isVet = item.specialty !== undefined || item.professional_license !== undefined;
        const Icon = isVet ? UserCircle : Hospital;
        const typeLabel = isVet ? 'VETERINARIO' : 'CLÍNICA';
        const typeColor = isVet ? theme.secondary : theme.info;

        return (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.cardIconBox, { backgroundColor: theme.background }]}>
                    <Icon size={32} color={isVet ? theme.secondary : theme.primary} />
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
                        <TouchableOpacity accessibilityRole="button"
                            style={[styles.btnAction, { backgroundColor: theme.error + tint.faint }]}
                            onPress={() => handleAction('reject', 'directorio', item.id, item.name || item.full_name)}
                        >
                            <XCircle size={18} color={theme.error} />
                            <Text style={[styles.btnActionText, { color: theme.error }]}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button"
                            style={[styles.btnAction, { backgroundColor: theme.success + tint.faint }]}
                            onPress={() => handleAction('approve', 'directorio', item.id, item.name || item.full_name)}
                        >
                            <CheckCircle2 size={18} color={theme.success} />
                            <Text style={[styles.btnActionText, { color: theme.success }]}>Activar</Text>
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
                    <View style={[styles.badge, { backgroundColor: theme.warning + tint.faint }]}>
                        <Text style={[styles.badgeText, { color: theme.warning }]}>SOLICITUD</Text>
                    </View>
                    <Text style={[styles.dateText, { color: theme.textMuted }]}>Para: {item.pet_name || 'mascota'}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: theme.text, marginTop: spacing.sm }]}>
                    {item.applicant_name || 'Solicitante sin nombre'}
                </Text>
                <View style={[styles.notesBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.notesText, { color: theme.textMuted }]}>
                        {item.reason ? `«${item.reason}»` : 'Sin mensaje del solicitante.'}
                    </Text>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.error + tint.faint }]}
                        onPress={() => handleAction('reject', 'solicitudes', item.id, `Solicitud de ${item.applicant_name || 'un solicitante'}`)}
                    >
                        <XCircle size={18} color={theme.error} />
                        <Text style={[styles.btnActionText, { color: theme.error }]}>Rechazar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnAction, { backgroundColor: theme.success + tint.faint }]}
                        onPress={() => handleAction('approve', 'solicitudes', item.id, `Solicitud de ${item.applicant_name || 'un solicitante'}`)}
                    >
                        <CheckCircle2 size={18} color={theme.success} />
                        <Text style={[styles.btnActionText, { color: theme.success }]}>Aprobar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.btnActionSquare, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => router.push(`/adopciones/ver-solicitudes/${item.listing_id}`)}
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
            refreshControl={<AppRefreshControl />}
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
                            <TouchableOpacity accessibilityRole="button"
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as TabType)}
                                style={[
                                    styles.tab,
                                    { backgroundColor: theme.surface, borderColor: theme.border },
                                    isActive && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                            >
                                <Icon size={16} color={isActive ? theme.onPrimary : theme.textMuted} />
                                <Text style={[styles.tabText, { color: isActive ? theme.onPrimary : theme.textMuted }]}>
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
    tabsContainer: { 
        marginBottom: spacing.lg,
        zIndex: 20,
    },
    tabsScroll: { 
        paddingHorizontal: layout.screenPadding, 
        gap: spacing.md,
        paddingBottom: spacing.sm,
    },
    tab: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm, 
        paddingHorizontal: spacing.lg, 
        paddingVertical: spacing.md, 
        borderRadius: 16, 
        borderWidth: 1,
        justifyContent: 'center',
    },
    tabText: { 
        fontSize: font.base, 
        fontFamily: families.extrabold 
    },
    content: { flex: 1 },
    listContainer: { 
        paddingHorizontal: spacing.xl, 
        paddingBottom: spacing.huge, 
        paddingTop: spacing.sm 
    },
    card: { 
        borderRadius: 24, 
        marginBottom: spacing.xl, 
        overflow: 'hidden', 
        borderWidth: 1,
        elevation: 3,
    },
    cardPadding: { padding: spacing.xl },
    coverFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardCover: {
        width: '100%',
        height: 180,
    },
    cardIconBox: { 
        width: 64, 
        height: 64, 
        borderRadius: 20, 
        alignSelf: 'center', 
        marginTop: spacing.xl, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 2,
    },
    cardContent: { padding: spacing.xl },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: spacing.md 
    },
    cardTitle: { 
        fontSize: font.xxl, 
        fontFamily: families.extrabold, 
        flex: 1 
    },
    cardDesc: { 
        fontSize: font.base, 
        fontFamily: families.medium, 
        lineHeight: 19, 
        marginBottom: spacing.xl 
    },
    badge: { 
        paddingHorizontal: spacing.md, 
        paddingVertical: spacing.xs, 
        borderRadius: 8 
    },
    badgeText: { 
        fontSize: font.xs, 
        fontFamily: families.extrabold 
    },
    priceTag: { 
        fontSize: font.xl, 
        fontFamily: families.extrabold,
        marginLeft: spacing.md 
    },
    infoRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: spacing.sm, 
        marginBottom: spacing.xl 
    },
    userEmail: { 
        fontSize: font.md, 
        fontFamily: families.bold 
    },
    cardActions: { 
        flexDirection: 'row', 
        gap: spacing.md 
    },
    btnAction: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: spacing.sm, 
        height: 50, 
        borderRadius: 16 
    },
    btnActionText: { 
        fontSize: font.base, 
        fontFamily: families.extrabold 
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
        gap: spacing.sm,
    },
    dateText: { 
        fontSize: font.sm, 
        fontFamily: families.bold,
    },
    notesBox: { 
        padding: spacing.lg, 
        borderRadius: 16, 
        marginTop: spacing.xs, 
        marginBottom: spacing.xl, 
        borderLeftWidth: 4, 
        borderLeftColor: accents.services 
    },
    notesText: { 
        fontSize: font.base, 
        fontFamily: families.semibold, 
        fontStyle: 'italic',
        lineHeight: 18,
    }
});
