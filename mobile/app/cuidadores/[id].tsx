import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitterDetail } from '@/src/hooks/cuidadores';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { showAlert } from '@/src/components/AppAlert';
import { 
    MapPin, Star, Clock, Home, Users, Phone, MessageCircle, Calendar, 
    Shield, Heart, Share2, Dog, Cat, CheckCircle, Sun, Moon
} from 'lucide-react-native';

export default function SitterDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        sitter,
        isLoading,
        error,
        isFavorite,
        toggleFavorite,
        handleContact,
        handleBook,
        getServiceName,
        // Sit request
        sitModalVisible,
        setSitModalVisible,
        selectedPetId,
        setSelectedPetId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sitNotes,
        setSitNotes,
        myPets,
        handleSubmitSitRequest,
        isRequestingSit,
    } = useSitterDetail();

    const [contactModalVisible, setContactModalVisible] = React.useState(false);
    const [contactMessage, setContactMessage] = React.useState('');

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'daycare': return <Sun size={20} color={theme.primary} />;
            case 'boarding': return <Moon size={20} color={theme.primary} />;
            default: return <Home size={20} color={theme.primary} />;
        }
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" rightElement={<View style={styles.placeholder} />} />
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message="Cargando información..." />
                </View>
            </ScreenContainer>
        );
    }

    if (error || !sitter) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" rightElement={<View style={styles.placeholder} />} />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del cuidador.
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
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }}>
                <ScreenHeader
                    title="Perfil del Cuidador"
                    rightElement={
                        <TouchableOpacity onPress={toggleFavorite}>
                            <Heart size={24} color={isFavorite ? '#ef4444' : theme.textMuted} fill={isFavorite ? '#ef4444' : 'none'} />
                        </TouchableOpacity>
                    }
                />

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.secondary + '20' }]}>
                        {sitter.photo_url ? (
                            <Image source={{ uri: sitter.photo_url }} style={styles.avatar} />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.secondary }]}>
                                {sitter.display_name.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.text }]}>{sitter.display_name}</Text>
                        <View style={styles.ratingRow}>
                            <Star size={16} color="#fbbf24" fill="#fbbf24" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>
                                {sitter.rating ? sitter.rating.toFixed(1) : '5.0'} ({sitter.total_sits} cuidados)
                            </Text>
                        </View>
                        
                        {sitter.is_verified && (
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
                        <Home size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.total_sits}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cuidados</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Clock size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.experience_years || 1}+</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Años</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Users size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.max_pets}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Mascotas</Text>
                    </View>
                </View>

                {/* Bio */}
                {sitter.bio && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre mí</Text>
                        <Text style={[styles.bioText, { color: theme.textMuted }]}>{sitter.bio}</Text>
                    </View>
                )}

                {/* Services */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Ofrecidos</Text>
                    <View style={styles.servicesContainer}>
                        <View style={[styles.serviceCard, { backgroundColor: theme.primary + '10' }]}>
                            {getServiceIcon(sitter.service_type)}
                            <View style={styles.serviceInfo}>
                                <Text style={[styles.serviceName, { color: theme.primary }]}>
                                    {getServiceName(sitter.service_type)}
                                </Text>
                                <Text style={[styles.serviceDesc, { color: theme.textMuted }]}>
                                    {sitter.service_type === 'daycare' ? 
                                        'Cuidado durante el día, perfecto para dueños ocupados' :
                                        'Cuidado nocturno, ideal para viajes y fines de semana'
                                    }
                                </Text>
                            </View>
                            <CheckCircle size={20} color="#10b981" />
                        </View>
                    </View>
                </View>

                {/* Pet Types */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipos de Mascotas</Text>
                    <View style={styles.petTypesContainer}>
                        <View style={[styles.petTypeCard, { backgroundColor: sitter.accepts_dogs ? theme.primary + '10' : theme.surface }]}>
                            <Dog size={24} color={sitter.accepts_dogs ? theme.primary : theme.textMuted} />
                            <Text style={[styles.petTypeName, { color: sitter.accepts_dogs ? theme.primary : theme.textMuted }]}>
                                Perros
                            </Text>
                            <CheckCircle size={16} color={sitter.accepts_dogs ? '#10b981' : theme.textMuted} />
                        </View>
                        <View style={[styles.petTypeCard, { backgroundColor: sitter.accepts_cats ? theme.primary + '10' : theme.surface }]}>
                            <Cat size={24} color={sitter.accepts_cats ? theme.primary : theme.textMuted} />
                            <Text style={[styles.petTypeName, { color: sitter.accepts_cats ? theme.primary : theme.textMuted }]}>
                                Gatos
                            </Text>
                            <CheckCircle size={16} color={sitter.accepts_cats ? '#10b981' : theme.textMuted} />
                        </View>
                    </View>
                </View>

                {/* Home Features */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Características del Hogar</Text>
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureItem}>
                            <Home size={20} color={theme.primary} />
                            <Text style={[styles.featureText, { color: theme.textMuted }]}>Hogar seguro</Text>
                        </View>
                        {sitter.has_yard && (
                            <View style={styles.featureItem}>
                                <Sun size={20} color={theme.secondary} />
                                <Text style={[styles.featureText, { color: theme.textMuted }]}>Patio privado</Text>
                            </View>
                        )}
                        <View style={styles.featureItem}>
                            <Shield size={20} color={theme.primary} />
                            <Text style={[styles.featureText, { color: theme.textMuted }]}>Supervisión 24/7</Text>
                        </View>
                    </View>
                </View>

                {/* Location */}
                {sitter.location && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={20} color={theme.primary} />
                            <Text style={[styles.locationText, { color: theme.textMuted }]}>
                                {sitter.location}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Pricing */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                    <View style={styles.pricingCard}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Cuidado por día</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            ${sitter.price_per_day || 30}
                        </Text>
                    </View>
                    {sitter.price_per_visit && (
                        <View style={styles.pricingCard}>
                            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Visita individual</Text>
                            <Text style={[styles.priceAmount, { color: theme.primary }]}>
                                ${sitter.price_per_visit}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={[styles.contactButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => setContactModalVisible(true)}
                    >
                        <MessageCircle size={20} color={theme.primary} />
                        <Text style={[styles.contactButtonText, { color: theme.primary }]}>Enviar Mensaje</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.bookButton, { backgroundColor: theme.primary }]}
                        onPress={() => handleBook(getServiceName(sitter.service_type))}
                    >
                        <Calendar size={20} color="#fff" />
                        <Text style={styles.bookButtonText}>Reservar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer} />
            </ScrollView>

            {/* Sit Request Modal */}
            <Modal visible={sitModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Solicitar Cuidado</Text>
                        
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

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Fecha de Inicio</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 50 }]}
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textMuted}
                        />

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Fecha de Fin</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 50 }]}
                            value={endDate}
                            onChangeText={setEndDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.textMuted}
                        />

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Notas (opcional)</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={sitNotes}
                            onChangeText={setSitNotes}
                            placeholder="Instrucciones especiales..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} onPress={() => setSitModalVisible(false)}>
                                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSubmitSitRequest}
                                disabled={isRequestingSit}
                            >
                                {isRequestingSit ? <ActivityIndicator color="#fff" size="small" /> : (
                                    <Text style={styles.modalSubmitText}>Enviar Solicitud</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Contact Modal */}
            <Modal visible={contactModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Enviar Mensaje</Text>
                        
                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Escribe tu mensaje para {sitter.display_name}</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={contactMessage}
                            onChangeText={setContactMessage}
                            placeholder="Hola, me gustaría saber si tienes disponibilidad para..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} 
                                onPress={() => {
                                    setContactModalVisible(false);
                                    setContactMessage('');
                                }}
                            >
                                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    if (!contactMessage.trim()) {
                                        showAlert({ type: 'error', title: 'Mensaje Vacío', message: 'Por favor escribe un mensaje antes de enviar.' });
                                        return;
                                    }
                                    setContactModalVisible(false);
                                    setContactMessage('');
                                    showAlert({ 
                                        type: 'success', 
                                        title: '¡Mensaje Enviado!', 
                                        message: `Tu mensaje ha sido enviado a ${sitter.display_name}. Se pondrá en contacto contigo pronto.` 
                                    });
                                }}
                            >
                                <Text style={styles.modalSubmitText}>Enviar Mensaje</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
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
    servicesContainer: {
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
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    serviceDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    petTypesContainer: {
        gap: 12,
    },
    petTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    petTypeName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    featuresGrid: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    featureText: {
        fontSize: 14,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
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
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    contactButtonText: {
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
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    modalLabel: { fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    petChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1 },
    petChipText: { fontSize: 14, fontWeight: '700' },
    noPetsText: { fontSize: 14, paddingVertical: 8 },
    modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { fontSize: 15, fontWeight: '700' },
    modalSubmitBtn: { flex: 2, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalSubmitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
