import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useVeterinarians } from '@/src/hooks/clinica/useVeterinarians';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Users, Mail, Phone, Star, Edit, Trash2, X, Stethoscope, ShieldCheck } from 'lucide-react-native';

export default function VeterinariosClinicaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, editingVet, loadingAction,
        name, setName, email, setEmail, phone, setPhone,
        specialty, setSpecialty, licenseNumber, setLicenseNumber,
        experience, setExperience, bio, setBio,
        loadingClinics, loadingVets, clinic, veterinarians, activeVetsCount,
        handleEdit, handleDelete, handleSave, openCreateModal,
    } = useVeterinarians();

    const renderVeterinarioItem = ({ item }: { item: any }) => {
        const vetName = item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim();
        const fallbackPhoto = 'https://images.unsplash.com/photo-1559839731-f7b2eff31c3f?q=80&w=400';
        return (
            <View style={[styles.vetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.vetHeader}>
                    <View style={styles.vetInfo}>
                        <Image source={{ uri: item.photo_url || fallbackPhoto }} style={styles.vetAvatar} />
                        <View style={styles.vetDetails}>
                            <Text style={[styles.vetName, { color: theme.text }]}>{vetName}</Text>
                            <Text style={[styles.vetSpecialty, { color: theme.primary }]}>{item.specialty || 'General'}</Text>
                            <View style={styles.vetMeta}>
                                <View style={styles.ratingContainer}>
                                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                                    <Text style={[styles.ratingText, { color: theme.text }]}>
                                        {item.rating || '5.0'}
                                    </Text>
                                </View>
                                <Text style={[styles.experienceText, { color: theme.textMuted }]}>
                                    {item.experience_years || '5'} años exp.
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: item.is_active !== false ? '#10b98120' : '#ef444420' 
                    }]}>
                        <Text style={[styles.statusText, { 
                            color: item.is_active !== false ? '#10b981' : '#ef4444' 
                        }]}>
                            {item.is_active !== false ? 'Activo' : 'Inactivo'}
                        </Text>
                    </View>
                </View>

                <View style={styles.vetContact}>
                    <View style={styles.contactRow}>
                        <Mail size={14} color={theme.textMuted} />
                        <Text style={[styles.contactText, { color: theme.textMuted }]}>{item.email}</Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Phone size={14} color={theme.textMuted} />
                        <Text style={[styles.contactText, { color: theme.textMuted }]}>{item.phone || 'Sin teléfono'}</Text>
                    </View>
                </View>

                {item.bio && (
                    <Text style={[styles.vetBio, { color: theme.textMuted }]} numberOfLines={2}>
                        {item.bio}
                    </Text>
                )}

                <View style={styles.vetFooter}>
                    <View style={styles.licenseContainer}>
                        <ShieldCheck size={14} color={theme.primary} />
                        <Text style={[styles.licenseText, { color: theme.textMuted }]}>
                            Cédula: {item.license_number || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                            onPress={() => handleEdit(item)}
                        >
                            <Edit size={16} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#ef444420' }]}
                            onPress={() => handleDelete(item)}
                        >
                            <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loadingClinics) {
        return (
            <ScreenContainer>
                <LoadingOverlay message="Cargando veterinarios..." />
            </ScreenContainer>
        );
    }

    if (!clinic) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Veterinarios" />
                <View style={styles.emptyContainer}>
                    <EmptyState
                        icon={<Stethoscope size={80} color={theme.textMuted} />}
                        title="No tienes clínicas registradas"
                    />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Veterinarios"
                actionIcon={Plus}
                onAction={openCreateModal}
            />

            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Users size={24} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{veterinarians.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Veterinarios</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Stethoscope size={24} color="#10b981" />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{activeVetsCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activos</Text>
                    </View>
                </View>

                {loadingVets ? (
                    <LoadingOverlay message="Cargando veterinarios..." />
                ) : (
                    <FlatList
                        data={veterinarians}
                        renderItem={renderVeterinarioItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <EmptyState
                                icon={<Users size={48} color={theme.textMuted} />}
                                title="No tienes veterinarios registrados"
                            />
                        }
                    />
                )}
            </View>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {editingVet ? 'Editar Veterinario' : 'Agregar Veterinario'}
                        </Text>
                        <TouchableOpacity onPress={handleSave} disabled={loadingAction}>
                            {loadingAction ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <Text style={[styles.saveBtnText, { color: theme.primary }]}>Guardar</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <KeyboardScreen style={{ paddingHorizontal: 24 }}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Nombre Completo *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Dr. Juan Pérez"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Email *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="email@clinica.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Teléfono *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+52 55 1234 5678"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Especialidad *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={specialty}
                                onChangeText={setSpecialty}
                                placeholder="Medicina General"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Número de Cédula *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={licenseNumber}
                                onChangeText={setLicenseNumber}
                                placeholder="VET-12345"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Años de Experiencia</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={experience}
                                onChangeText={setExperience}
                                placeholder="5"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Biografía</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Breve descripción profesional..."
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.modalFooter} />
                    </KeyboardScreen>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, paddingHorizontal: 24 },
    statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statCard: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statNumber: { fontSize: 24, fontWeight: '900' },
    statLabel: { fontSize: 12, fontWeight: '600' },
    list: { paddingBottom: 100 },
    vetCard: { padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1 },
    vetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    vetInfo: { flexDirection: 'row', gap: 16, flex: 1 },
    vetAvatar: { width: 60, height: 60, borderRadius: 30 },
    vetDetails: { flex: 1 },
    vetName: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    vetSpecialty: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    vetMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 13, fontWeight: '600' },
    experienceText: { fontSize: 13 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    vetContact: { gap: 8, marginBottom: 12 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactText: { fontSize: 13, flex: 1 },
    vetBio: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
    vetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    licenseContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    licenseText: { fontSize: 12 },
    actionButtons: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    saveBtnText: { fontSize: 16, fontWeight: '700' },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontWeight: '600' },
    textArea: { height: 120, borderRadius: 12, paddingHorizontal: 16, paddingTop: 16, borderWidth: 1, fontSize: 16, textAlignVertical: 'top' },
    modalFooter: { height: 40 },
});
