import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useBranches } from '@/src/hooks/clinica/useBranches';
import { Clinic } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Building, MapPin, Phone, Mail, Globe, Clock, ShieldAlert, Edit, Trash2, X } from 'lucide-react-native';

export default function SucursalesScreen() {
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, editingClinic, loadingAction,
        name, setName, address, setAddress, city, setCity, state, setState,
        phone, setPhone, email, setEmail, website, setWebsite,
        description, setDescription, is24Hours, setIs24Hours,
        hasEmergency, setHasEmergency, isLoading, clinics,
        handleEdit, handleDelete, handleSave, openCreateModal,
    } = useBranches();

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
        <ScreenContainer>
            <ScreenHeader
                title="Mis Clínicas"
                actionIcon={Plus}
                onAction={openCreateModal}
            />

            <View style={styles.content}>
                {isLoading ? (
                    <LoadingOverlay message="Cargando clínicas..." />
                ) : (
                    <FlatList
                        data={clinics}
                        renderItem={renderClinicItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <EmptyState
                                icon={<Building size={64} color={theme.textMuted} strokeWidth={1} />}
                                title="No tienes clínicas o sucursales registradas"
                            />
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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1 },
    listContainer: { padding: 24, gap: 16, paddingBottom: 100 },
    clinicCard: {
        padding: 16, borderRadius: 24, borderWidth: 1, gap: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    clinicName: { fontSize: 16, fontWeight: '800' },
    badgeContainer: { flexDirection: 'row', gap: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
    cardBody: { gap: 6 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 13, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
    statusBox: {},
    approvalBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    approvalText: { fontSize: 10, fontWeight: '800' },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 20,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: { fontSize: 18, fontWeight: '800' },
    saveBtnText: { fontSize: 16, fontWeight: '800' },
    formGroup: { marginBottom: 20 },
    row: { flexDirection: 'row', gap: 12 },
    label: { fontSize: 12, fontWeight: '800', marginBottom: 8, textTransform: 'uppercase' },
    input: { height: 52, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 14, fontWeight: '600' },
    textArea: { height: 100, borderRadius: 16, paddingHorizontal: 16, paddingTop: 12, borderWidth: 1, fontSize: 14, fontWeight: '600', textAlignVertical: 'top' },
    switchGroup: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16,
    },
    switchLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    switchTitle: { fontSize: 14, fontWeight: '800' },
    switchSubtitle: { fontSize: 11, fontWeight: '600' },
});
