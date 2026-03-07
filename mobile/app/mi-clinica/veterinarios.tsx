import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyClinics, Clinic } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, Users, Mail, Phone, Star, Edit, Trash2, X, Stethoscope, ShieldCheck, Calendar } from 'lucide-react-native';

// Mock data - en producción esto vendría de la API
const mockVets = [
    {
        id: '1',
        name: 'Dr. Carlos Rodríguez',
        email: 'carlos@clinicavet.com',
        phone: '+52 55 1234 5678',
        specialty: 'Medicina General',
        license_number: 'VET-12345',
        experience_years: 8,
        rating: 4.8,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1559839731-f7b2eff31c3f?q=80&w=400',
        bio: 'Médico veterinario con 8 años de experiencia en medicina general de pequeños animales.'
    },
    {
        id: '2',
        name: 'Dra. María González',
        email: 'maria@clinicavet.com',
        phone: '+52 55 8765 4321',
        specialty: 'Cirugía',
        license_number: 'VET-67890',
        experience_years: 12,
        rating: 4.9,
        is_active: true,
        photo_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400',
        bio: 'Cirujana veterinaria especializada en cirugías ortopédicas y de tejidos blandos.'
    },
    {
        id: '3',
        name: 'Dr. Juan Martínez',
        email: 'juan@clinicavet.com',
        phone: '+52 55 2468 1357',
        specialty: 'Dermatología',
        license_number: 'VET-24680',
        experience_years: 5,
        rating: 4.7,
        is_active: false,
        photo_url: 'https://images.unsplash.com/photo-1612278695744-26a0c10531c3?q=80&w=400',
        bio: 'Especialista en dermatología veterinaria con enfoque en enfermedades de la piel en perros y gatos.'
    }
];

export default function VeterinariosClinicaScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingVet, setEditingVet] = useState<any>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [experience, setExperience] = useState('');
    const [bio, setBio] = useState('');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    // Mock query - en producción usar useQuery con API real
    const { data: veterinarians = mockVets, isLoading: loadingVets } = useQuery({
        queryKey: ['clinic-vets', clinic?.id],
        queryFn: () => Promise.resolve(mockVets),
        enabled: !!clinic?.id,
    });

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setSpecialty('');
        setLicenseNumber('');
        setExperience('');
        setBio('');
        setEditingVet(null);
    };

    const handleEdit = (vet: any) => {
        setEditingVet(vet);
        setName(vet.name);
        setEmail(vet.email);
        setPhone(vet.phone);
        setSpecialty(vet.specialty);
        setLicenseNumber(vet.license_number);
        setExperience(vet.experience_years.toString());
        setBio(vet.bio || '');
        setModalVisible(true);
    };

    const handleDelete = (vet: any) => {
        Alert.alert(
            "Eliminar Veterinario",
            `¿Estás seguro de eliminar a ${vet.name} de tu clínica?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert("Eliminado", "Veterinario eliminado correctamente");
                        // En producción: llamar a la API para eliminar
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!name || !email || !specialty) {
            Alert.alert("Error", "Por favor completa los campos obligatorios");
            return;
        }

        setLoadingAction(true);
        try {
            if (editingVet) {
                // En producción: llamar a la API para actualizar
                Alert.alert("Éxito", "Veterinario actualizado correctamente");
            } else {
                // En producción: llamar a la API para crear
                Alert.alert("Éxito", "Veterinario agregado correctamente");
            }
            setModalVisible(false);
            resetForm();
            // Refetch data
            queryClient.invalidateQueries({ queryKey: ['clinic-vets'] });
        } catch (error) {
            Alert.alert("Error", "No se pudo guardar el veterinario");
        } finally {
            setLoadingAction(false);
        }
    };

    const renderVeterinarioItem = ({ item }: { item: any }) => (
        <View style={[styles.vetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.vetHeader}>
                <View style={styles.vetInfo}>
                    <Image source={{ uri: item.photo_url }} style={styles.vetAvatar} />
                    <View style={styles.vetDetails}>
                        <Text style={[styles.vetName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.vetSpecialty, { color: theme.primary }]}>{item.specialty}</Text>
                        <View style={styles.vetMeta}>
                            <View style={styles.ratingContainer}>
                                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                                <Text style={[styles.ratingText, { color: theme.text }]}>
                                    {item.rating}
                                </Text>
                            </View>
                            <Text style={[styles.experienceText, { color: theme.textMuted }]}>
                                {item.experience_years} años exp.
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { 
                    backgroundColor: item.is_active ? '#10b98120' : '#ef444420' 
                }]}>
                    <Text style={[styles.statusText, { 
                        color: item.is_active ? '#10b981' : '#ef4444' 
                    }]}>
                        {item.is_active ? 'Activo' : 'Inactivo'}
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
                    <Text style={[styles.contactText, { color: theme.textMuted }]}>{item.phone}</Text>
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
                        Cédula: {item.license_number}
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

    if (loadingClinics) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!clinic) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Veterinarios</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Stethoscope size={80} color={theme.textMuted} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No tienes clínicas registradas</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Veterinarios</Text>
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                        resetForm();
                        setModalVisible(true);
                    }}
                >
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Users size={24} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{veterinarians.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Veterinarios</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
                        <Stethoscope size={24} color="#10b981" />
                        <Text style={[styles.statNumber, { color: theme.text }]}>
                            {veterinarians.filter((v: any) => v.is_active).length}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activos</Text>
                    </View>
                </View>

                {loadingVets ? (
                    <ActivityIndicator size="large" color={theme.primary} />
                ) : (
                    <FlatList
                        data={veterinarians}
                        renderItem={renderVeterinarioItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Users size={48} color={theme.textMuted} />
                                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                    No tienes veterinarios registrados
                                </Text>
                            </View>
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

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '900', flex: 1 },
    addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 16 },
    emptyText: { fontSize: 16, fontWeight: '600' },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    saveBtnText: { fontSize: 16, fontWeight: '700' },
    modalContent: { flex: 1, paddingHorizontal: 24 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, fontSize: 16, fontWeight: '600' },
    textArea: { height: 120, borderRadius: 12, paddingHorizontal: 16, paddingTop: 16, borderWidth: 1, fontSize: 16, textAlignVertical: 'top' },
    modalFooter: { height: 40 },
});
