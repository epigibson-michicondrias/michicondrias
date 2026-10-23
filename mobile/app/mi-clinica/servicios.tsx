import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { useClinicServices } from '@/src/hooks/clinica/useClinicServices';
import { ClinicServiceItem } from '@/src/services/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Plus, Pencil, Trash2, Clock, Tag, Briefcase, X, AlertTriangle } from 'lucide-react-native';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { font, spacing } from '@/constants/design';

export default function ServiciosClinicaScreen() {
    const { theme } = useTheme();
    const {
        modalVisible, setModalVisible, editingService, loadingAction,
        name, setName, description, setDescription, price, setPrice,
        duration, setDuration, category, setCategory,
        loadingServices, services, handleEdit, handleSave, handleDelete,
        openCreateModal,
    } = useClinicServices();

    const renderItem = ({ item }: { item: ClinicServiceItem }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}>
            <View style={styles.cardMain}>
                <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                    <Briefcase size={20} color={theme.primary} />
                </View>
                <View style={styles.info}>
                    <Text style={[styles.serviceName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.serviceDesc, { color: theme.textMuted }]} numberOfLines={1}>
                        {item.description || 'Sin descripción'}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Clock size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.duration_minutes} min</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Tag size={12} color={theme.textMuted} />
                            <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.category || 'General'}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.priceBox}>
                    <Text style={[styles.priceText, { color: theme.primary }]}>{Number(item.price || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</Text>
                </View>
            </View>

            <View style={[styles.actions, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                    <Pencil size={16} color={theme.textMuted} />
                    <Text style={[styles.actionText, { color: theme.textMuted }]}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={16} color={theme.error} />
                    <Text style={[styles.actionText, { color: theme.error }]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Servicios"
                subtitle="Catálogo de prestaciones"
                actionIcon={Plus}
                actionLabel="Nuevo servicio"
                onAction={openCreateModal}
            />

            {loadingServices ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
            refreshControl={<AppRefreshControl />}
                    data={services}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <AlertTriangle size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Aún no has agregado servicios</Text>
                        </View>
                    }
                />
            )}

            {/* Service Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </Text>
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar" onPress={() => setModalVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <FormField label="Nombre del Servicio *" value={name} onChangeText={setName} placeholder="Ej: Consulta General" />
                            </View>

                            <View style={styles.formGroup}>
                                <FormField label="Descripción" value={description} onChangeText={setDescription} placeholder="Detalles sobre lo que incluye el servicio..." multiline={true} />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.textMuted }]}>Precio *</Text>
                                    <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <Text style={{ color: theme.textMuted, fontSize: font.xl }}>$</Text>
                                        <TextInput
                                            style={[styles.smallInput, { color: theme.text }]}
                                            keyboardType="numeric"
                                            value={price}
                                            onChangeText={setPrice}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.textMuted }]}>Duración (min) *</Text>
                                    <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <Clock size={16} color={theme.textMuted} />
                                        <TextInput
                                            style={[styles.smallInput, { color: theme.text }]}
                                            keyboardType="numeric"
                                            value={duration}
                                            onChangeText={setDuration}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <FormField label="Categoría" value={category} onChangeText={setCategory} placeholder="Ej: Cirugía, Estética, Vacuna..." />
                            </View>

                            <Button label={editingService ? 'Actualizar Servicio' : 'Crear Servicio'} onPress={handleSave} loading={loadingAction} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { padding: spacing.xxl, paddingBottom: 100 },
    card: { borderRadius: 28, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
    cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, gap: spacing.xs },
    serviceName: { fontSize: font.xl, fontWeight: '800' },
    serviceDesc: { fontSize: font.md, fontWeight: '600' },
    metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    metaText: { fontSize: font.xs, fontWeight: '700' },
    priceBox: { alignItems: 'flex-end' },
    priceText: { fontSize: font.xxl, fontWeight: '900' },
    actions: { flexDirection: 'row', marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, gap: spacing.lg },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, justifyContent: 'center' },
    actionText: { fontSize: font.base, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { paddingTop: 100, alignItems: 'center', gap: spacing.xl },
    emptyText: { fontSize: font.xl, fontWeight: '600', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: spacing.xxl, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xxl },
    modalTitle: { fontSize: font.h2, fontWeight: '900' },
    modalScroll: { overflow: 'visible' },
    formGroup: { marginBottom: spacing.xl },
    label: { fontSize: font.base, fontWeight: '700', marginBottom: spacing.sm },
    input: { height: 56, borderRadius: 16, paddingHorizontal: spacing.lg, borderWidth: 1, fontSize: font.lg, fontWeight: '600' },
    textArea: { height: 100, textAlignVertical: 'top', paddingVertical: spacing.lg },
    row: { flexDirection: 'row', gap: spacing.lg },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, height: 56, borderRadius: 16, paddingHorizontal: spacing.lg, borderWidth: 1 },
    smallInput: { flex: 1, height: '100%', fontSize: font.lg, fontWeight: '600' },
    saveBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.huge },
    saveBtnText: { color: '#fff', fontSize: font.xl, fontWeight: '800' }
});
