import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import { useVeterinarians } from '@/src/hooks/clinica/useVeterinarians';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Users, Mail, Phone, Star, Edit, Trash2, X, Stethoscope, ShieldCheck } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing, layout } from '@/constants/design';

export default function VeterinariosClinicaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, editingVet, loadingAction,
        name, setName, email, setEmail, phone, setPhone,
        specialty, setSpecialty, licenseNumber, setLicenseNumber,
        bio, setBio,
        loadingClinics, loadingVets, clinic, veterinarians, activeVetsCount,
        handleEdit, handleDelete, handleSave, openCreateModal,
    } = useVeterinarians();

    const renderVeterinarioItem = ({ item }: { item: any }) => {
        const vetName = item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim();
        return (
            <View style={[styles.vetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.vetHeader}>
                    <View style={styles.vetInfo}>
                        {item.photo_url ? (
                            <Image source={{ uri: item.photo_url }} style={styles.vetAvatar} />
                        ) : (
                            <View style={[styles.vetAvatar, { backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center' }]}>
                                <Stethoscope size={26} color={theme.primary} />
                            </View>
                        )}
                        <View style={styles.vetDetails}>
                            <Text style={[styles.vetName, { color: theme.text }]}>{vetName}</Text>
                            <Text style={[styles.vetSpecialty, { color: theme.primary }]}>{item.specialty || 'General'}</Text>
                            {item.total_reviews ? (
                                <View style={styles.vetMeta}>
                                    <View style={styles.ratingContainer}>
                                        <Star size={14} color={theme.warning} fill={theme.warning} />
                                        <Text style={[styles.ratingText, { color: theme.text }]}>
                                            {Number(item.average_rating || 0).toFixed(1)} ({item.total_reviews})
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={[styles.experienceText, { color: theme.textMuted }]}>Sin reseñas todavía</Text>
                            )}
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: item.is_approved ? theme.success + '20' : theme.warning + '20' 
                    }]}>
                        <Text style={[styles.statusText, { 
                            color: item.is_approved ? theme.success : theme.warning 
                        }]}>
                            {item.is_approved ? 'Aprobado' : 'En revisión'}
                        </Text>
                    </View>
                </View>

                <View style={styles.vetContact}>
                    <View style={styles.contactRow}>
                        <Mail size={14} color={theme.textMuted} />
                        <Text style={[styles.contactText, { color: theme.textMuted }]}>{item.email || 'Sin correo'}</Text>
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
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Editar"
                            style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                            onPress={() => handleEdit(item)}
                        >
                            <Edit size={16} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Desasociar veterinario"
                            style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
                            onPress={() => handleDelete(item)}
                        >
                            <Trash2 size={16} color={theme.error} />
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
                actionLabel="Agregar veterinario"
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
                        <Stethoscope size={24} color={theme.success} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{activeVetsCount}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Aprobados</Text>
                    </View>
                </View>

                {loadingVets ? (
                    <LoadingOverlay message="Cargando veterinarios..." />
                ) : (
                    <FlatList
            refreshControl={<AppRefreshControl />}
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
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setModalVisible(false)}>
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

                    <KeyboardScreen style={{ paddingHorizontal: layout.screenPadding }}>
                        <View style={styles.formGroup}>
                            <FormField label="Nombre Completo *" value={name} onChangeText={setName} placeholder="Dr. Juan Pérez" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Email *" value={email} onChangeText={setEmail} placeholder="email@clinica.com" keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Teléfono" value={phone} onChangeText={setPhone} placeholder="+52 55 1234 5678" keyboardType="phone-pad" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Especialidad *" value={specialty} onChangeText={setSpecialty} placeholder="Medicina General" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Número de Cédula" value={licenseNumber} onChangeText={setLicenseNumber} placeholder="VET-12345" />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Biografía</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Breve descripción profesional..."
                                placeholderTextColor={theme.textMuted}
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
    content: { flex: 1, paddingHorizontal: layout.screenPadding },
    statsContainer: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xxl },
    statCard: { flex: 1, padding: spacing.xl, borderRadius: 16, alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
    statNumber: { fontSize: font.h2, fontWeight: '900' },
    statLabel: { fontSize: font.md, fontWeight: '600' },
    list: { paddingBottom: 100 },
    vetCard: { padding: spacing.xl, borderRadius: 16, marginBottom: spacing.lg, borderWidth: 1 },
    vetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
    vetInfo: { flexDirection: 'row', gap: spacing.lg, flex: 1 },
    vetAvatar: { width: 60, height: 60, borderRadius: 30 },
    vetDetails: { flex: 1 },
    vetName: { fontSize: font.xxl, fontWeight: '800', marginBottom: spacing.xs },
    vetSpecialty: { fontSize: font.base, fontWeight: '600', marginBottom: spacing.xs },
    vetMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    ratingText: { fontSize: font.base, fontWeight: '600' },
    experienceText: { fontSize: font.base },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 8 },
    statusText: { fontSize: font.sm, fontWeight: '700' },
    vetContact: { gap: spacing.sm, marginBottom: spacing.md },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    contactText: { fontSize: font.base, flex: 1 },
    vetBio: { fontSize: font.base, lineHeight: 18, marginBottom: spacing.lg },
    vetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    licenseContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    licenseText: { fontSize: font.md },
    actionButtons: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.xl },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xxl },
    modalTitle: { fontSize: font.h3, fontWeight: '900' },
    saveBtnText: { fontSize: font.xl, fontWeight: '700' },
    formGroup: { marginBottom: spacing.xxl },
    label: { fontSize: font.base, fontWeight: '700', marginBottom: spacing.sm },
    input: { height: 56, borderRadius: 12, paddingHorizontal: spacing.lg, borderWidth: 1, fontSize: font.xl, fontWeight: '600' },
    textArea: { height: 120, borderRadius: 12, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, borderWidth: 1, fontSize: font.xl, textAlignVertical: 'top' },
    modalFooter: { height: 40 },
});
