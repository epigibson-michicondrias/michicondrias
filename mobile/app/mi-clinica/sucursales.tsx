import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHospitalClinics, createClinic, updateClinic, deleteClinic, Clinic, ClinicCreate } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { showAlert } from '@/src/components/AppAlert';
import { ChevronLeft, Plus, Building, MapPin, Phone, Mail, Globe, Clock, ShieldAlert, Edit, Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KeyboardScreen from '@/src/components/KeyboardScreen';

export default function SucursalesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [is24Hours, setIs24Hours] = useState(false);
    const [hasEmergency, setHasEmergency] = useState(false);

    const { data: clinics = [], isLoading } = useQuery({
        queryKey: ['hospital-clinics'],
        queryFn: getHospitalClinics,
    });

    const resetForm = () => {
        setName('');
        setAddress('');
        setCity('');
        setState('');
        setPhone('');
        setEmail('');
        setWebsite('');
        setDescription('');
        setIs24Hours(false);
        setHasEmergency(false);
        setEditingClinic(null);
    };

    const handleEdit = (item: Clinic) => {
        setEditingClinic(item);
        setName(item.name);
        setAddress(item.address || '');
        setCity(item.city || '');
        setState(item.state || '');
        setPhone(item.phone || '');
        setEmail(item.email || '');
        setWebsite(item.website || '');
        setDescription(item.description || '');
        setIs24Hours(item.is_24_hours || false);
        setHasEmergency(item.has_emergency || false);
        setModalVisible(true);
    };

    const handleDelete = (item: Clinic) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar Sucursal',
            message: `¿Estás seguro de eliminar la clínica "${item.name}"? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: async () => {
                try {
                    setLoadingAction(true);
                    await deleteClinic(item.id);
                    showAlert({ type: 'success', title: 'Éxito', message: 'Clínica eliminada correctamente.' });
                    queryClient.invalidateQueries({ queryKey: ['hospital-clinics'] });
                } catch (err: any) {
                    showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo eliminar la clínica.' });
                } finally {
                    setLoadingAction(false);
                }
            }
        });
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre de la clínica es obligatorio.' });
            return;
        }

        setLoadingAction(true);
        const clinicData: ClinicCreate = {
            name: name.trim(),
            address: address.trim() || null,
            city: city.trim() || null,
            state: state.trim() || null,
            phone: phone.trim() || null,
            email: email.trim() || null,
            website: website.trim() || null,
            description: description.trim() || null,
            is_24_hours: is24Hours,
            has_emergency: hasEmergency,
        };

        try {
            if (editingClinic) {
                await updateClinic(editingClinic.id, clinicData);
                showAlert({ type: 'success', title: 'Éxito', message: 'Clínica actualizada correctamente.' });
            } else {
                await createClinic(clinicData);
                showAlert({ type: 'success', title: 'Éxito', message: 'Clínica registrada correctamente.' });
            }
            setModalVisible(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['hospital-clinics'] });
        } catch (err: any) {
            showAlert({ type: 'error', title: 'Error', message: err.message || 'No se pudo guardar la clínica.' });
        } finally {
            setLoadingAction(false);
        }
    };

    const renderClinicItem = ({ item }: { item: Clinic }) => (
        <View style={[styles.clinicCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={styles.headerTitleContainer}>
                    <Building size={20} color={theme.primary} />
                    <Text style={[styles.clinicName, { color: theme.text }]}>{item.name}</Text>
                </View>
                <View style={styles.badgeContainer}>
                    {item.is_24_hours && (
                        <View style={[styles.badge, { backgroundColor: '#10b98120' }]}>
                            <Text style={[styles.badgeText, { color: '#10b981' }]}>24 Horas</Text>
                        </View>
                    )}
                    {item.has_emergency && (
                        <View style={[styles.badge, { backgroundColor: '#ef444420' }]}>
                            <Text style={[styles.badgeText, { color: '#ef4444' }]}>Urgencias</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.cardBody}>
                {item.address && (
                    <View style={styles.infoRow}>
                        <MapPin size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            {item.address}, {item.city || ''}
                        </Text>
                    </View>
                )}
                {item.phone && (
                    <View style={styles.infoRow}>
                        <Phone size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>{item.phone}</Text>
                    </View>
                )}
                {item.email && (
                    <View style={styles.infoRow}>
                        <Mail size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>{item.email}</Text>
                    </View>
                )}
                {item.website && (
                    <View style={styles.infoRow}>
                        <Globe size={16} color={theme.textMuted} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>{item.website}</Text>
                    </View>
                )}
            </View>

            <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <View style={styles.statusBox}>
                    <View style={[styles.approvalBadge, { backgroundColor: item.is_approved ? '#10b98115' : '#f59e0b15' }]}>
                        <Text style={[styles.approvalText, { color: item.is_approved ? '#10b981' : '#f59e0b' }]}>
                            {item.is_approved ? 'Verificada' : 'Pendiente'}
                        </Text>
                    </View>
                </View>
                <View style={styles.actionRow}>
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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity style={[styles.backBtn, { borderColor: theme.border }]} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitleText, { color: theme.text }]}>Mis Clínicas</Text>
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
                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                ) : (
                    <FlatList
                        data={clinics}
                        renderItem={renderClinicItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Building size={64} color={theme.textMuted} strokeWidth={1} />
                                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                    No tienes clínicas o sucursales registradas
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Modal de Registro/Edición */}
            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {editingClinic ? 'Editar Clínica' : 'Registrar Clínica'}
                        </Text>
                        <TouchableOpacity onPress={handleSave} disabled={loadingAction}>
                            {loadingAction ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <Text style={[styles.saveBtnText, { color: theme.primary }]}>Guardar</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <KeyboardScreen style={{ padding: 24 }}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Nombre de la Clínica *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Hospital Veterinario Central"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Dirección</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Calle Falsa 123"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Ciudad</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    value={city}
                                    onChangeText={setCity}
                                    placeholder="CDMX"
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Estado</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                    value={state}
                                    onChangeText={setState}
                                    placeholder="CDMX"
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Teléfono</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+52 55 1234 5678"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Correo Electrónico</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="contacto@clinica.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Sitio Web</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={website}
                                onChangeText={setWebsite}
                                placeholder="https://clinica.com"
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Descripción de Servicios</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe el equipamiento, especialidades..."
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={[styles.switchGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.switchLabelContainer}>
                                <Clock size={20} color={theme.text} />
                                <View>
                                    <Text style={[styles.switchTitle, { color: theme.text }]}>Servicio 24 Horas</Text>
                                    <Text style={[styles.switchSubtitle, { color: theme.textMuted }]}>¿Abierto día y noche?</Text>
                                </View>
                            </View>
                            <Switch value={is24Hours} onValueChange={setIs24Hours} trackColor={{ true: theme.primary }} />
                        </View>

                        <View style={[styles.switchGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.switchLabelContainer}>
                                <ShieldAlert size={20} color={theme.text} />
                                <View>
                                    <Text style={[styles.switchTitle, { color: theme.text }]}>Sala de Urgencias</Text>
                                    <Text style={[styles.switchSubtitle, { color: theme.textMuted }]}>¿Atención inmediata ante emergencias?</Text>
                                </View>
                            </View>
                            <Switch value={hasEmergency} onValueChange={setHasEmergency} trackColor={{ true: theme.primary }} />
                        </View>
                        
                        <View style={{ height: 60 }} />
                    </KeyboardScreen>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleText: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center' },
    listContainer: { padding: 24, gap: 16, paddingBottom: 100 },
    clinicCard: {
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    clinicName: {
        fontSize: 16,
        fontWeight: '800',
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardBody: {
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 12,
    },
    statusBox: {},
    approvalBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    approvalText: {
        fontSize: 10,
        fontWeight: '800',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '800',
    },
    modalContent: {
        flex: 1,
        padding: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingTop: 12,
        borderWidth: 1,
        fontSize: 14,
        fontWeight: '600',
        textAlignVertical: 'top',
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    switchLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    switchTitle: {
        fontSize: 14,
        fontWeight: '800',
    },
    switchSubtitle: {
        fontSize: 11,
        fontWeight: '600',
    }
});
