import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics, getClinicServices, createClinicService, updateClinicService, deleteClinicService, ClinicServiceItem } from '../../src/services/directorio';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, Pencil, Trash2, Clock, DollarSign, Tag, Briefcase, ChevronRight, X, AlertTriangle } from 'lucide-react-native';

export default function ServiciosClinicaScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<ClinicServiceItem | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('30');
    const [category, setCategory] = useState('General');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    const { data: services = [], isLoading: loadingServices, refetch } = useQuery({
        queryKey: ['clinic-services-pro', clinic?.id],
        queryFn: () => getClinicServices(clinic!.id),
        enabled: !!clinic?.id,
    });

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setDuration('30');
        setCategory('General');
        setEditingService(null);
    };

    const handleEdit = (service: ClinicServiceItem) => {
        setEditingService(service);
        setName(service.name);
        setDescription(service.description || '');
        setPrice(service.price?.toString() || '');
        setDuration(service.duration_minutes.toString());
        setCategory(service.category || 'General');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name || !price || !duration) {
            Alert.alert("Error", "Por favor completa los campos obligatorios");
            return;
        }

        setLoadingAction(true);
        try {
            const payload = {
                name,
                description,
                price: parseFloat(price),
                duration_minutes: parseInt(duration),
                category,
            };

            if (editingService) {
                await updateClinicService(editingService.id, payload);
            } else {
                await createClinicService(clinic!.id, payload);
            }

            refetch();
            setModalVisible(false);
            resetForm();
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar el servicio");
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Servicio",
            "¿Estás seguro de que deseas eliminar este servicio del catálogo?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteClinicService(id);
                            refetch();
                        } catch (e) {
                            Alert.alert("Error", "No se pudo eliminar el servicio");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: ClinicServiceItem }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
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
                    <Text style={[styles.priceText, { color: theme.primary }]}>${item.price}</Text>
                </View>
            </View>

            <View style={[styles.actions, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                    <Pencil size={16} color={theme.textMuted} />
                    <Text style={[styles.actionText, { color: theme.textMuted }]}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={[styles.actionText, { color: '#ef4444' }]}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Servicios</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Catálogo de prestaciones</Text>
                </View>
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={() => { resetForm(); setModalVisible(true); }}
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loadingServices ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
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
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Nombre del Servicio *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Ej: Consulta General"
                                    placeholderTextColor={theme.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Descripción</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Detalles sobre lo que incluye el servicio..."
                                    placeholderTextColor={theme.textMuted}
                                    multiline={true}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.textMuted }]}>Precio *</Text>
                                    <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <Text style={{ color: theme.textMuted, fontSize: 16 }}>$</Text>
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
                                <Text style={[styles.label, { color: theme.textMuted }]}>Categoría</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                                    placeholder="Ej: Cirugía, Estética, Vacuna..."
                                    placeholderTextColor={theme.textMuted}
                                    value={category}
                                    onChangeText={setCategory}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSave}
                                disabled={loadingAction}
                            >
                                {loadingAction ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editingService ? 'Actualizar Servicio' : 'Crear Servicio'}</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '900' },
    headerSubtitle: { fontSize: 14, fontWeight: '600' },
    addBtn: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 24, paddingBottom: 100 },
    card: { borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardMain: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, gap: 4 },
    serviceName: { fontSize: 16, fontWeight: '800' },
    serviceDesc: { fontSize: 12, fontWeight: '600' },
    metaRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 10, fontWeight: '700' },
    priceBox: { alignItems: 'flex-end' },
    priceText: { fontSize: 18, fontWeight: '900' },
    actions: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, gap: 16 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
    actionText: { fontSize: 13, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    modalScroll: { overflow: 'visible' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 15, fontWeight: '600' },
    textArea: { height: 100, textAlignVertical: 'top', paddingVertical: 16 },
    row: { flexDirection: 'row', gap: 16 },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1 },
    smallInput: { flex: 1, height: '100%', fontSize: 15, fontWeight: '600' },
    saveBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 40 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
