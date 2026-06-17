import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkerDetail } from '@/src/hooks/paseadores';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { 
    MapPin, Star, Clock, Users, MessageCircle, Calendar, 
    Shield, Heart, Share2, Dog, Cat, CheckCircle 
} from 'lucide-react-native';
import ScreenHeader from '@/src/components/layout/ScreenHeader';

export default function WalkerDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        walker,
        isLoading,
        error,
        isFavorite,
        toggleFavorite,
        handleContact,
        handleBook,
        // Walk request
        walkModalVisible,
        setWalkModalVisible,
        selectedPetId,
        setSelectedPetId,
        walkNotes,
        setWalkNotes,
        walkDuration,
        setWalkDuration,
        myPets,
        handleSubmitWalkRequest,
        isRequestingWalk,
    } = useWalkerDetail();

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Paseador" />
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message="Cargando información..." />
                </View>
            </ScreenContainer>
        );
    }

    if (error || !walker) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Paseador" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del paseador.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <>
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Perfil del Paseador"
                rightElement={
                    <TouchableOpacity onPress={toggleFavorite}>
                        <Heart size={24} color={isFavorite ? '#ef4444' : theme.textMuted} fill={isFavorite ? '#ef4444' : 'none'} />
                    </TouchableOpacity>
                }
            />

            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
                    {walker.photo_url ? (
                        <Image source={{ uri: walker.photo_url }} style={styles.avatar} />
                    ) : (
                        <Text style={[styles.avatarText, { color: theme.primary }]}>
                            {walker.display_name.charAt(0).toUpperCase()}
                        </Text>
                    )}
                </View>
                
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: theme.text }]}>{walker.display_name}</Text>
                    <View style={styles.ratingRow}>
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                        <Text style={[styles.ratingText, { color: theme.text }]}>
                            {walker.rating ? walker.rating.toFixed(1) : '5.0'} ({walker.total_walks} paseos)
                        </Text>
                    </View>
                    
                    {walker.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <Shield size={14} color="#10b981" />
                            <Text style={styles.verifiedText}>Verificado</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={20} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
                <View style={styles.statItem}>
                    <Users size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{walker.total_walks}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Paseos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Clock size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{walker.experience_years || 1}+</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Años</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Dog size={20} color={theme.primary} />
                    <Text style={[styles.statNumber, { color: theme.text }]}>{walker.max_pets_per_walk}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Mascotas</Text>
                </View>
            </View>

            {/* Bio */}
            {walker.bio && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre mí</Text>
                    <Text style={[styles.bioText, { color: theme.textMuted }]}>{walker.bio}</Text>
                </View>
            )}

            {/* Services */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios</Text>
                <View style={styles.servicesGrid}>
                    <View style={[styles.serviceCard, { backgroundColor: walker.accepts_dogs ? theme.primary + '10' : theme.surface }]}>
                        <Dog size={24} color={walker.accepts_dogs ? theme.primary : theme.textMuted} />
                        <Text style={[styles.serviceName, { color: walker.accepts_dogs ? theme.primary : theme.textMuted }]}>
                            Paseo de Perros
                        </Text>
                        <CheckCircle size={16} color={walker.accepts_dogs ? '#10b981' : theme.textMuted} />
                    </View>
                    <View style={[styles.serviceCard, { backgroundColor: walker.accepts_cats ? theme.primary + '10' : theme.surface }]}>
                        <Cat size={24} color={walker.accepts_cats ? theme.primary : theme.textMuted} />
                        <Text style={[styles.serviceName, { color: walker.accepts_cats ? theme.primary : theme.textMuted }]}>
                            Paseo de Gatos
                        </Text>
                        <CheckCircle size={16} color={walker.accepts_cats ? '#10b981' : theme.textMuted} />
                    </View>
                </View>
            </View>

            {/* Location */}
            {walker.location && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={20} color={theme.primary} />
                        <Text style={[styles.locationText, { color: theme.textMuted }]}>
                            {walker.location}
                        </Text>
                    </View>
                    {walker.service_radius_km && (
                        <Text style={[styles.radiusText, { color: theme.textMuted }]}>
                            Radio de servicio: {walker.service_radius_km} km
                        </Text>
                    )}
                </View>
            )}

            {/* Pricing */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                <View style={styles.pricingCard}>
                    <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo por hora</Text>
                    <Text style={[styles.priceAmount, { color: theme.primary }]}>
                        ${walker.price_per_hour || 20}
                    </Text>
                </View>
                {walker.price_per_walk && (
                    <View style={styles.pricingCard}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo individual</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            ${walker.price_per_walk}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={handleContact}
                >
                    <MessageCircle size={20} color={theme.primary} />
                    <Text style={[styles.contactBtnText, { color: theme.primary }]}>Enviar Mensaje</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={handleBook}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Reservar Paseo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer} />
        </ScrollView>

        {/* Walk Request Modal */}
        <Modal visible={walkModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Solicitar Paseo</Text>
                    
                    <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Selecciona tu mascota</Text>
                    {myPets.length === 0 ? (
                        <Text style={[styles.noPetsText, { color: theme.textMuted }]}>No tienes mascotas registradas</Text>
                    ) : (
                        <FlatList
                            data={myPets}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={p => p.id}
                            renderItem={({ item: pet }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.petChip,
                                        { backgroundColor: theme.surface, borderColor: selectedPetId === pet.id ? theme.primary : theme.border },
                                        selectedPetId === pet.id && { borderWidth: 2 }
                                    ]}
                                    onPress={() => setSelectedPetId(pet.id)}
                                >
                                    <Text style={[styles.petChipText, { color: selectedPetId === pet.id ? theme.primary : theme.text }]}>
                                        {pet.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Duración (minutos)</Text>
                    <View style={styles.durationRow}>
                        {[30, 45, 60, 90].map(d => (
                            <TouchableOpacity
                                key={d}
                                style={[
                                    styles.durationChip,
                                    { backgroundColor: walkDuration === d ? theme.primary : theme.surface, borderColor: theme.border }
                                ]}
                                onPress={() => setWalkDuration(d)}
                            >
                                <Text style={{ color: walkDuration === d ? '#fff' : theme.text, fontWeight: '700', fontSize: 14 }}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Notas (opcional)</Text>
                    <TextInput
                        style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                        value={walkNotes}
                        onChangeText={setWalkNotes}
                        placeholder="Instrucciones especiales..."
                        placeholderTextColor={theme.textMuted}
                        multiline
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} onPress={() => setWalkModalVisible(false)}>
                            <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSubmitWalkRequest}
                            disabled={isRequestingWalk}
                        >
                            {isRequestingWalk ? <ActivityIndicator color="#fff" size="small" /> : (
                                <Text style={styles.modalSubmitText}>Enviar Solicitud</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 16,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10b981',
    },
    shareButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    section: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    bioText: {
        fontSize: 15,
        lineHeight: 22,
    },
    servicesGrid: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    serviceName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
    },
    radiusText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    priceLabel: {
        fontSize: 15,
    },
    priceAmount: {
        fontSize: 20,
        fontWeight: '800',
    },
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
    },
    contactBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    contactBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    bookButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    footer: {
        height: 20,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '80%' },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    modalLabel: { fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    petChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1 },
    petChipText: { fontSize: 14, fontWeight: '700' },
    noPetsText: { fontSize: 14, paddingVertical: 8 },
    durationRow: { flexDirection: 'row', gap: 12 },
    durationChip: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { fontSize: 15, fontWeight: '700' },
    modalSubmitBtn: { flex: 2, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalSubmitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
