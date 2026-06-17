import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, TextInput, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminClinicDetail } from '@/src/hooks/admin/useAdminClinicDetail';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Clock, 
    ShieldCheck, 
    Info,
    Star,
    Save,
    X
} from 'lucide-react-native';

export default function ClinicDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const {
        clinic,
        isLoading,
        error,
        isEditing,
        form,
        setForm,
        isSaving,
        handleSave,
        handleCancelEdit,
        startEditing,
        handleSuspend,
    } = useAdminClinicDetail(id);

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (error || !clinic) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textMuted }}>No se pudo cargar la información de la clínica.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Regresar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Detalles de Clínica"
                gradient={[theme.primary, theme.primary + 'CC']}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {isEditing ? (
                    <>
                        {/* Edit Form */}
                        <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.formSectionTitle, { color: theme.text }]}>Información Básica</Text>
                            <FormField label="Nombre" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} theme={theme} />
                            <FormField label="Dirección" value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} theme={theme} />
                            <View style={styles.formRow}>
                                <View style={styles.formRowField}>
                                    <FormField label="Ciudad" value={form.city} onChangeText={(v) => setForm({ ...form, city: v })} theme={theme} />
                                </View>
                                <View style={styles.formRowField}>
                                    <FormField label="Estado" value={form.state} onChangeText={(v) => setForm({ ...form, state: v })} theme={theme} />
                                </View>
                            </View>
                        </View>

                        <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.formSectionTitle, { color: theme.text }]}>Contacto</Text>
                            <FormField label="Teléfono" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} theme={theme} keyboardType="phone-pad" />
                            <FormField label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} theme={theme} keyboardType="email-address" />
                            <FormField label="Sitio Web" value={form.website} onChangeText={(v) => setForm({ ...form, website: v })} theme={theme} keyboardType="url" />
                        </View>

                        <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.formSectionTitle, { color: theme.text }]}>Descripción</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                                value={form.description}
                                onChangeText={(v) => setForm({ ...form, description: v })}
                                multiline
                                numberOfLines={4}
                                placeholder="Descripción de la clínica..."
                                placeholderTextColor={theme.textMuted}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.formSectionTitle, { color: theme.text }]}>Opciones</Text>
                            <View style={styles.switchRow}>
                                <Text style={[styles.switchLabel, { color: theme.text }]}>Abierto 24 horas</Text>
                                <Switch
                                    value={form.is_24_hours}
                                    onValueChange={(v) => setForm({ ...form, is_24_hours: v })}
                                    trackColor={{ false: theme.backgroundSecondary, true: theme.primary + '60' }}
                                    thumbColor={form.is_24_hours ? theme.primary : theme.textMuted}
                                />
                            </View>
                            <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16, marginTop: 12 }]}>
                                <Text style={[styles.switchLabel, { color: theme.text }]}>Servicio de emergencias</Text>
                                <Switch
                                    value={form.has_emergency}
                                    onValueChange={(v) => setForm({ ...form, has_emergency: v })}
                                    trackColor={{ false: theme.backgroundSecondary, true: theme.primary + '60' }}
                                    thumbColor={form.has_emergency ? theme.primary : theme.textMuted}
                                />
                            </View>
                        </View>

                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={[styles.btnAction, { backgroundColor: theme.backgroundSecondary, borderWidth: 1, borderColor: theme.border }]}
                                onPress={handleCancelEdit}
                            >
                                <X size={18} color={theme.textMuted} />
                                <Text style={[styles.btnActionText, { color: theme.textMuted }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnAction, { backgroundColor: theme.primary, opacity: isSaving ? 0.6 : 1 }]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Save size={18} color="#fff" />
                                )}
                                <Text style={styles.btnActionText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        {/* View Mode */}
                        {/* Clinic Main Info */}
                        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.logoRow}>
                                {clinic.logo_url ? (
                                    <Image source={{ uri: clinic.logo_url }} style={styles.logo} />
                                ) : (
                                    <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary + '15' }]}>
                                        <ShieldCheck size={40} color={theme.primary} />
                                    </View>
                                )}
                                <View style={styles.mainMeta}>
                                    <Text style={[styles.name, { color: theme.text }]}>{clinic.name}</Text>
                                    <View style={styles.statusBadgeRow}>
                                        <View style={[styles.statusBadge, { backgroundColor: '#10b98120' }]}>
                                            <Text style={[styles.statusText, { color: '#10b981' }]}>ACTIVA</Text>
                                        </View>
                                        {clinic.is_24_hours && (
                                            <View style={[styles.statusBadge, { backgroundColor: '#3b82f620' }]}>
                                                <Text style={[styles.statusText, { color: '#3b82f6' }]}>24 HORAS</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <View style={styles.contactSection}>
                                <DetailItem icon={MapPin} label="Dirección" value={clinic.address || 'No proporcionada'} theme={theme} />
                                <DetailItem icon={Phone} label="Teléfono" value={clinic.phone || 'No proporcionado'} theme={theme} />
                                <DetailItem icon={Mail} label="Email" value={clinic.email || 'No proporcionado'} theme={theme} />
                                <DetailItem icon={Globe} label="Sitio Web" value={clinic.website || 'No proporcionado'} theme={theme} />
                                <DetailItem icon={Clock} label="Emergencias" value={clinic.has_emergency ? 'Disponible' : 'No disponible'} theme={theme} />
                            </View>
                        </View>

                        {/* Description Section */}
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.sectionHeader}>
                                <Info size={18} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Acerca de la clínica</Text>
                            </View>
                            <Text style={[styles.description, { color: theme.textMuted }]}>
                                {clinic.description || "Esta clínica no ha proporcionado una descripción detallada de sus servicios."}
                            </Text>
                        </View>

                        {/* ID and Internal Info */}
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.sectionHeader}>
                                <Star size={18} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Información Administrativa</Text>
                            </View>
                            <View style={styles.adminData}>
                                <Text style={[styles.adminLabel, { color: theme.textMuted }]}>ID de Sistema:</Text>
                                <Text style={[styles.adminValue, { color: theme.text }]}>{clinic.id}</Text>
                            </View>
                            <View style={styles.adminData}>
                                <Text style={[styles.adminLabel, { color: theme.textMuted }]}>ID del Propietario:</Text>
                                <Text style={[styles.adminValue, { color: theme.text }]}>{clinic.owner_user_id || 'N/A'}</Text>
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                style={[styles.btnAction, { backgroundColor: theme.primary }]}
                                onPress={startEditing}
                            >
                                <Text style={styles.btnActionText}>Editar Información</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.btnAction, { backgroundColor: '#ef4444' }]}
                                onPress={handleSuspend}
                            >
                                <Text style={styles.btnActionText}>Suspender Clínica</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

function DetailItem({ icon: Icon, label, value, theme }: any) {
    return (
        <View style={styles.detailItem}>
            <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSecondary }]}>
                <Icon size={16} color={theme.primary} />
            </View>
            <View style={styles.detailInfo}>
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );
}

function FormField({ label, value, onChangeText, theme, keyboardType }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    theme: any;
    keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'url';
}) {
    return (
        <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={label}
                placeholderTextColor={theme.textMuted}
                keyboardType={keyboardType || 'default'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    infoCard: {
        margin: 20,
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 24,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainMeta: { flex: 1 },
    name: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 8,
    },
    statusBadgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
    },
    divider: {
        height: 1,
        marginVertical: 24,
    },
    contactSection: {
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailInfo: { flex: 1 },
    detailLabel: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 24,
        borderRadius: 28,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    adminData: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    adminLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    adminValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    actionRow: {
        paddingHorizontal: 20,
        marginTop: 8,
        gap: 12,
    },
    btnAction: {
        height: 56,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        elevation: 4,
    },
    btnActionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    // Edit form styles
    formCard: {
        marginHorizontal: 20,
        marginTop: 16,
        padding: 24,
        borderRadius: 28,
        borderWidth: 1,
    },
    formSectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        marginBottom: 16,
    },
    fieldContainer: {
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    textArea: {
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        fontWeight: '500',
        minHeight: 100,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    formRowField: {
        flex: 1,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    editActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
});
