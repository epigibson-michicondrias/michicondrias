import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import { useBranches } from '@/src/hooks/clinica/useBranches';
import { Clinic } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Building, MapPin, Phone, Mail, Globe, Clock, ShieldAlert, Edit, Trash2, X } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing, layout } from '@/constants/design';

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
                        <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.success }]}>24 Horas</Text>
                        </View>
                    )}
                    {item.has_emergency && (
                        <View style={[styles.badge, { backgroundColor: theme.error + '20' }]}>
                            <Text style={[styles.badgeText, { color: theme.error }]}>Urgencias</Text>
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
                    <View style={[styles.approvalBadge, { backgroundColor: item.is_approved ? theme.success + '15' : theme.warning + '15' }]}>
                        <Text style={[styles.approvalText, { color: item.is_approved ? theme.success : theme.warning }]}>
                            {item.is_approved ? 'Verificada' : 'Pendiente'}
                        </Text>
                    </View>
                </View>
                <View style={styles.actionRow}>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Editar"
                        style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => handleEdit(item)}
                    >
                        <Edit size={16} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Eliminar"
                        style={[styles.actionBtn, { backgroundColor: theme.error + '20' }]}
                        onPress={() => handleDelete(item)}
                    >
                        <Trash2 size={16} color={theme.error} />
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
                actionLabel="Agregar sucursal"
                onAction={openCreateModal}
            />

            <View style={styles.content}>
                {isLoading ? (
                    <LoadingOverlay message="Cargando clínicas..." />
                ) : (
                    <FlatList
            refreshControl={<AppRefreshControl />}
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
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setModalVisible(false)}>
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

                    <KeyboardScreen style={{ padding: spacing.xxl }}>
                        <View style={styles.formGroup}>
                            <FormField label="Nombre de la Clínica *" value={name} onChangeText={setName} placeholder="Hospital Veterinario Central" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Dirección" value={address} onChangeText={setAddress} placeholder="Calle Falsa 123" />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <FormField label="Ciudad" value={city} onChangeText={setCity} placeholder="CDMX" />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <FormField label="Estado" value={state} onChangeText={setState} placeholder="CDMX" />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Teléfono" value={phone} onChangeText={setPhone} placeholder="+52 55 1234 5678" keyboardType="phone-pad" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Correo Electrónico" value={email} onChangeText={setEmail} placeholder="contacto@clinica.com" keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        <View style={styles.formGroup}>
                            <FormField label="Sitio Web" value={website} onChangeText={setWebsite} placeholder="https://clinica.com" keyboardType="url" autoCapitalize="none" />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Descripción de Servicios</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe el equipamiento, especialidades..."
                                placeholderTextColor={theme.textMuted}
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
    listContainer: { padding: spacing.xxl, gap: spacing.lg, paddingBottom: 100 },
    clinicCard: {
        padding: spacing.lg, borderRadius: 24, borderWidth: 1, gap: spacing.md,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 5,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
    clinicName: { fontSize: font.xl, fontWeight: '800' },
    badgeContainer: { flexDirection: 'row', gap: spacing.sm },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
    badgeText: { fontSize: font.xs, fontWeight: '800', textTransform: 'uppercase' },
    cardBody: { gap: spacing.sm },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    infoText: { fontSize: font.base, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: spacing.md },
    statusBox: {},
    approvalBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6 },
    approvalText: { fontSize: font.xs, fontWeight: '800' },
    actionRow: { flexDirection: 'row', gap: spacing.sm },
    actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding, paddingVertical: spacing.xl,
        borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)',
    },
    modalTitle: { fontSize: font.xxl, fontWeight: '800' },
    saveBtnText: { fontSize: font.xl, fontWeight: '800' },
    formGroup: { marginBottom: spacing.xl },
    row: { flexDirection: 'row', gap: spacing.md },
    label: { fontSize: font.md, fontWeight: '800', marginBottom: spacing.sm, textTransform: 'uppercase' },
    input: { height: 52, borderRadius: 16, paddingHorizontal: spacing.lg, borderWidth: 1, fontSize: font.base, fontWeight: '600' },
    textArea: { height: 100, borderRadius: 16, paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderWidth: 1, fontSize: font.base, fontWeight: '600', textAlignVertical: 'top' },
    switchGroup: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: spacing.lg, borderRadius: 20, borderWidth: 1, marginBottom: spacing.lg,
    },
    switchLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    switchTitle: { fontSize: font.base, fontWeight: '800' },
    switchSubtitle: { fontSize: font.sm, fontWeight: '600' },
});
