import React, { useState } from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, ScrollView, Switch } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabProvider } from '@/src/hooks/laboratorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import FilterChip from '@/src/components/FilterChip';
import { showAlert } from '@/src/components/AppAlert';
import { formatDateMx, statusTone } from '@/src/features/salud/format';
import { FlaskConical, Calendar, AlertTriangle, Plus, X } from 'lucide-react-native';

type Tab = 'ordenes' | 'citas' | 'anomalias' | 'catalogo';
const TABS: { key: Tab; label: string }[] = [
    { key: 'ordenes', label: 'Órdenes' },
    { key: 'citas', label: 'Citas' },
    { key: 'anomalias', label: 'Anomalías' },
    { key: 'catalogo', label: 'Catálogo' },
];

interface ResultRow { parameter_name: string; measured_value: string; unit: string; reference_range: string; is_anomaly: boolean }
const emptyRow = (): ResultRow => ({ parameter_name: '', measured_value: '', unit: '', reference_range: '', is_anomaly: false });

export default function LaboratorioGestionScreen() {
    const { theme } = useTheme();
    const [tab, setTab] = useState<Tab>('ordenes');
    const {
        pendingOrders: orders, appointments, anomalies, myTests,
        isLoadingOrders, isLoadingAppointments, isLoadingAnomalies, isLoadingTests,
        updateOrderStatus, isUpdatingStatus, updateAppointmentStatus, toggleTest,
        uploadResults, isUploadingResults, createTest, isCreatingTest,
    } = useLabProvider();

    // --- Modal de resultados ---
    const [resultOrder, setResultOrder] = useState<any>(null);
    const [rows, setRows] = useState<ResultRow[]>([emptyRow()]);
    const [pdfUrl, setPdfUrl] = useState('');
    const openResults = (order: any) => { setResultOrder(order); setRows([emptyRow()]); setPdfUrl(''); };
    const patchRow = (i: number, patch: Partial<ResultRow>) => setRows((r) => r.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

    const submitResults = async () => {
        const filled = rows.filter((r) => r.parameter_name.trim() || r.measured_value.trim());
        if (filled.length === 0) {
            showAlert({ type: 'error', title: 'Sin resultados', message: 'Agrega al menos un parámetro con su valor.' });
            return;
        }
        const parsed = [];
        for (const r of filled) {
            const v = parseFloat(r.measured_value.replace(',', '.'));
            if (!r.parameter_name.trim() || isNaN(v)) {
                showAlert({ type: 'error', title: 'Datos incompletos', message: 'Cada fila necesita nombre del parámetro y un valor numérico.' });
                return;
            }
            parsed.push({
                parameter_name: r.parameter_name.trim(), measured_value: v,
                unit: r.unit.trim() || undefined, reference_range: r.reference_range.trim() || undefined, is_anomaly: r.is_anomaly,
            });
        }
        try {
            await uploadResults({ orderId: resultOrder.id, data: { pdf_report_url: pdfUrl.trim() || undefined, results: parsed } });
            setResultOrder(null);
        } catch { /* el hook ya muestra el error */ }
    };

    // --- Formulario de nuevo estudio ---
    const [showTestForm, setShowTestForm] = useState(false);
    const [tf, setTf] = useState({ name: '', description: '', price: '', unit: '', reference_range: '' });
    const submitTest = async () => {
        const price = parseFloat(tf.price.replace(',', '.'));
        if (!tf.name.trim() || isNaN(price) || price <= 0) {
            showAlert({ type: 'error', title: 'Datos incompletos', message: 'Nombre y un precio mayor a cero son obligatorios.' });
            return;
        }
        try {
            await createTest({
                name: tf.name.trim(), description: tf.description.trim() || undefined, price,
                unit: tf.unit.trim() || undefined, reference_range: tf.reference_range.trim() || undefined,
            });
            setTf({ name: '', description: '', price: '', unit: '', reference_range: '' });
            setShowTestForm(false);
        } catch { /* ya mostrado */ }
    };

    const confirmCancelAppt = (id: string) =>
        showAlert({
            type: 'warning', title: '¿Cancelar la cita?', message: 'El cliente será notificado.',
            buttonText: 'Sí, cancelar', showCancel: true, cancelText: 'Volver',
            onButtonPress: () => updateAppointmentStatus(id, 'cancelled'),
        });

    const Btn = ({ label, onPress, color, filled, disabled }: { label: string; onPress: () => void; color: string; filled?: boolean; disabled?: boolean }) => (
        <TouchableOpacity
            accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress}
            style={[styles.btn, { borderColor: color, backgroundColor: filled ? color : 'transparent' }, disabled && { opacity: 0.6 }]}
        >
            <Text style={{ color: filled ? '#fff' : color, fontWeight: '700', fontSize: 13 }}>{label}</Text>
        </TouchableOpacity>
    );

    const Card = ({ icon, title, subtitle, meta, tone, children }: any) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: theme.primary + '15' }]}>{icon}</View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{title}</Text>
                    {!!subtitle && <Text style={[styles.meta, { color: theme.textMuted }]}>{subtitle}</Text>}
                </View>
                {tone && (
                    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                        <Text style={{ color: tone.color, fontWeight: '700', fontSize: 12 }}>{tone.label}</Text>
                    </View>
                )}
            </View>
            {!!meta && <Text style={[styles.meta, { color: theme.textMuted, marginTop: 8 }]}>{meta}</Text>}
            {children}
        </View>
    );

    const ORDER_LABEL: Record<string, string> = { pending: 'Pendiente', sample_collected: 'Muestra recolectada', processing: 'En proceso', completed: 'Completada', cancelled: 'Cancelada' };

    const renderItem = ({ item }: { item: any }) => {
        if (tab === 'ordenes') {
            const open = item.status !== 'completed' && item.status !== 'cancelled';
            const tone = statusTone(theme, item.status);
            return (
                <Card
                    icon={<FlaskConical size={20} color={theme.primary} />}
                    title={(item.test_names || []).join(', ') || `Orden #${item.id.slice(0, 8)}`}
                    subtitle={item.pet_name ? `Paciente: ${item.pet_name}` : undefined}
                    meta={item.created_at ? `Solicitada ${formatDateMx(item.created_at.slice(0, 10))}` : undefined}
                    tone={{ ...tone, label: ORDER_LABEL[item.status] || tone.label }}
                >
                    {open && (
                        <View style={styles.actions}>
                            {item.status === 'pending' && <Btn label="Muestra recolectada" color={theme.info} disabled={isUpdatingStatus} onPress={() => updateOrderStatus({ orderId: item.id, status: 'sample_collected' })} />}
                            {item.status === 'sample_collected' && <Btn label="En proceso" color={theme.info} disabled={isUpdatingStatus} onPress={() => updateOrderStatus({ orderId: item.id, status: 'processing' })} />}
                            <Btn label="Cargar resultados" color={theme.success} filled onPress={() => openResults(item)} />
                            <Btn label="Cancelar" color={theme.error} disabled={isUpdatingStatus} onPress={() => updateOrderStatus({ orderId: item.id, status: 'cancelled' })} />
                        </View>
                    )}
                </Card>
            );
        }
        if (tab === 'citas') {
            const tone = statusTone(theme, item.status);
            return (
                <Card
                    icon={<Calendar size={20} color={theme.primary} />}
                    title={item.test_name || 'Estudio de laboratorio'}
                    subtitle={`${item.pet_name ? `${item.pet_name} · ` : ''}${formatDateMx(item.scheduled_date)} ${item.scheduled_time?.slice(0, 5) || ''}`}
                    meta={item.notes || undefined}
                    tone={tone}
                >
                    {item.status === 'pending' && (
                        <View style={styles.actions}>
                            <Btn label="Confirmar" color={theme.success} filled onPress={() => updateAppointmentStatus(item.id, 'confirmed')} />
                            <Btn label="Rechazar" color={theme.error} onPress={() => confirmCancelAppt(item.id)} />
                        </View>
                    )}
                    {item.status === 'confirmed' && (
                        <View style={styles.actions}>
                            <Btn label="Marcar atendida" color={theme.info} filled onPress={() => updateAppointmentStatus(item.id, 'completed')} />
                            <Btn label="Cancelar" color={theme.error} onPress={() => confirmCancelAppt(item.id)} />
                        </View>
                    )}
                </Card>
            );
        }
        if (tab === 'anomalias') {
            return (
                <Card
                    icon={<AlertTriangle size={20} color={theme.error} />}
                    title={item.parameter_name}
                    subtitle={`Valor: ${item.measured_value}${item.unit ? ` ${item.unit}` : ''}${item.reference_range ? ` (ref. ${item.reference_range})` : ''}`}
                    tone={{ label: 'Fuera de rango', color: theme.error, bg: theme.errorLight }}
                />
            );
        }
        return (
            <View style={[styles.card, styles.testRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.meta, { color: theme.textMuted }]}>${Number(item.price).toFixed(2)} · {item.is_active ? 'Visible' : 'Oculto'}</Text>
                </View>
                <Switch accessibilityLabel={`Publicar ${item.name}`} value={!!item.is_active} onValueChange={(v) => toggleTest(item.id, v)} trackColor={{ true: theme.primary, false: theme.border }} />
            </View>
        );
    };

    const data = tab === 'ordenes' ? orders : tab === 'citas' ? appointments : tab === 'anomalias' ? anomalies : myTests;
    const loading = tab === 'ordenes' ? isLoadingOrders : tab === 'citas' ? isLoadingAppointments : tab === 'anomalias' ? isLoadingAnomalies : isLoadingTests;
    const EMPTY: Record<Tab, string> = {
        ordenes: 'Aún no recibes órdenes de veterinarios.',
        citas: 'No hay citas solicitadas.',
        anomalias: 'No hay resultados fuera de rango.',
        catalogo: 'Publica tu primer estudio con el botón +.',
    };

    const input = [styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }];

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Gestión Lab"
                subtitle="Órdenes, citas y catálogo"
                actionIcon={tab === 'catalogo' ? Plus : undefined}
                onAction={tab === 'catalogo' ? () => setShowTestForm(true) : undefined}
                actionLabel="Nuevo estudio"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.tabsRow}>
                {TABS.map((t) => <FilterChip key={t.key} label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />)}
            </ScrollView>

            {loading ? (
                <View style={{ padding: 20 }}><SkeletonList count={4} /></View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(it, i) => it.id || String(i)}
                    contentContainerStyle={styles.list}
                    refreshControl={<AppRefreshControl />}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 48, gap: 10 }}>
                            <FlaskConical size={44} color={theme.textMuted} />
                            <Text style={{ color: theme.textMuted, textAlign: 'center' }}>{EMPTY[tab]}</Text>
                        </View>
                    }
                />
            )}

            {/* Resultados */}
            <Modal visible={!!resultOrder} animationType="slide" transparent onRequestClose={() => setResultOrder(null)}>
                <View style={styles.overlay}>
                    <View style={[styles.sheet, { backgroundColor: theme.background }]}>
                        <View style={styles.sheetHeader}>
                            <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18 }]}>Cargar resultados</Text>
                            <TouchableOpacity accessibilityLabel="Cerrar" onPress={() => setResultOrder(null)}><X size={22} color={theme.text} /></TouchableOpacity>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            {rows.map((r, i) => (
                                <View key={i} style={[styles.rowBox, { borderColor: theme.border }]}>
                                    <TextInput style={input} placeholder="Parámetro (ej. Hemoglobina)" placeholderTextColor={theme.textMuted} value={r.parameter_name} onChangeText={(v) => patchRow(i, { parameter_name: v })} />
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TextInput style={[input, { flex: 1 }]} placeholder="Valor" keyboardType="numeric" placeholderTextColor={theme.textMuted} value={r.measured_value} onChangeText={(v) => patchRow(i, { measured_value: v })} />
                                        <TextInput style={[input, { flex: 1 }]} placeholder="Unidad" placeholderTextColor={theme.textMuted} value={r.unit} onChangeText={(v) => patchRow(i, { unit: v })} />
                                        <TextInput style={[input, { flex: 1 }]} placeholder="Ref." placeholderTextColor={theme.textMuted} value={r.reference_range} onChangeText={(v) => patchRow(i, { reference_range: v })} />
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ color: theme.text }}>Fuera de rango</Text>
                                        <Switch value={r.is_anomaly} onValueChange={(v) => patchRow(i, { is_anomaly: v })} trackColor={{ true: theme.error, false: theme.border }} />
                                    </View>
                                </View>
                            ))}
                            <TouchableOpacity accessibilityRole="button" onPress={() => setRows((r) => [...r, emptyRow()])} style={{ paddingVertical: 8 }}>
                                <Text style={{ color: theme.primary, fontWeight: '700' }}>+ Agregar parámetro</Text>
                            </TouchableOpacity>
                            <TextInput style={input} placeholder="URL del informe PDF (opcional)" autoCapitalize="none" keyboardType="url" placeholderTextColor={theme.textMuted} value={pdfUrl} onChangeText={setPdfUrl} />
                            <TouchableOpacity accessibilityRole="button" disabled={isUploadingResults} onPress={submitResults} style={[styles.submit, { backgroundColor: theme.primary }, isUploadingResults && { opacity: 0.7 }]}>
                                <Text style={styles.submitText}>{isUploadingResults ? 'Enviando...' : 'Enviar resultados'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Nuevo estudio */}
            <Modal visible={showTestForm} animationType="slide" transparent onRequestClose={() => setShowTestForm(false)}>
                <View style={styles.overlay}>
                    <View style={[styles.sheet, { backgroundColor: theme.background }]}>
                        <View style={styles.sheetHeader}>
                            <Text style={[styles.cardTitle, { color: theme.text, fontSize: 18 }]}>Nuevo estudio</Text>
                            <TouchableOpacity accessibilityLabel="Cerrar" onPress={() => setShowTestForm(false)}><X size={22} color={theme.text} /></TouchableOpacity>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 10 }}>
                            <TextInput style={input} placeholder="Nombre *" placeholderTextColor={theme.textMuted} value={tf.name} onChangeText={(v) => setTf({ ...tf, name: v })} />
                            <TextInput style={[input, { minHeight: 80 }]} multiline placeholder="Descripción / preparación" placeholderTextColor={theme.textMuted} value={tf.description} onChangeText={(v) => setTf({ ...tf, description: v })} />
                            <TextInput style={input} placeholder="Precio (MXN) *" keyboardType="numeric" placeholderTextColor={theme.textMuted} value={tf.price} onChangeText={(v) => setTf({ ...tf, price: v })} />
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TextInput style={[input, { flex: 1 }]} placeholder="Unidad" placeholderTextColor={theme.textMuted} value={tf.unit} onChangeText={(v) => setTf({ ...tf, unit: v })} />
                                <TextInput style={[input, { flex: 1 }]} placeholder="Rango ref." placeholderTextColor={theme.textMuted} value={tf.reference_range} onChangeText={(v) => setTf({ ...tf, reference_range: v })} />
                            </View>
                            <TouchableOpacity accessibilityRole="button" disabled={isCreatingTest} onPress={submitTest} style={[styles.submit, { backgroundColor: theme.primary }, isCreatingTest && { opacity: 0.7 }]}>
                                <Text style={styles.submitText}>{isCreatingTest ? 'Publicando...' : 'Publicar estudio'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    tabsRow: { paddingHorizontal: 24, gap: 8, marginBottom: 12 },
    list: { paddingHorizontal: 24, paddingBottom: 100 },
    card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    testRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '800' },
    meta: { fontSize: 13 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    btn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    rowBox: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 8, marginBottom: 10 },
    input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    submit: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 12, marginBottom: 20 },
    submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
