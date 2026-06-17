import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { useApplyForm } from '@/src/hooks/adopciones/useApplyForm';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { Home, Users, Heart, Check, ShieldAlert, Lock, PartyPopper } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SolicitarAdopcionScreen() {
    const { theme } = useTheme();
    const {
        listing, loadingListing, form, step, loading, success, user,
        isAdminOrVet, isVerified, isPending,
        updateField, setForm, handleNext, handleBack, handleSubmit,
        goToMyApplications, goToVerification, goBack,
    } = useApplyForm();

    if (loadingListing) {
        return (
            <ScreenContainer>
                <View style={styles.center}>
                    <LoadingOverlay message="Validando perfil de seguridad..." />
                </View>
            </ScreenContainer>
        );
    }

    // Security Gate 1: Role check (Admins/Vets cannot adopt via public portal)
    if (isAdminOrVet) {
        return (
            <ScreenContainer>
                <View style={styles.gateContainer}>
                    <View style={[styles.lockIconBox, { backgroundColor: '#ef444415' }]}>
                        <ShieldAlert size={48} color="#ef4444" />
                    </View>
                    <Text style={[styles.gateTitle, { color: theme.text }]}>Acción Reservada</Text>
                    <Text style={[styles.gateDesc, { color: theme.textMuted }]}>
                        Como miembro del equipo (Admin/Vet), no puedes enviar solicitudes públicas. Usa el panel de gestión interna.
                    </Text>
                    <TouchableOpacity style={[styles.gateBtn, { backgroundColor: theme.surface }]} onPress={goBack}>
                        <Text style={[styles.gateBtnText, { color: theme.text }]}>Entendido</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    // Security Gate 2: KYC check (Only verified users)
    if (!isVerified) {
        return (
            <ScreenContainer>
                <View style={styles.gateContainer}>
                    <View style={[styles.lockIconBox, { backgroundColor: theme.primary + '15' }]}>
                        <Lock size={48} color={theme.primary} />
                    </View>
                    <Text style={[styles.gateTitle, { color: theme.text }]}>
                        {isPending ? 'Verificación en Trámite' : 'Seguridad Requerida'}
                    </Text>
                    <Text style={[styles.gateDesc, { color: theme.textMuted }]}>
                        {isPending
                            ? 'Estamos revisando tus documentos. Podrás adoptar en cuanto el equipo valide tu identidad.'
                            : 'Para el bienestar de los michis, es obligatorio verificar tu identidad oficial antes de postularte.'
                        }
                    </Text>
                    <TouchableOpacity
                        style={[styles.gateBtn, { backgroundColor: theme.primary }]}
                        onPress={goToVerification}
                    >
                        <Text style={[styles.gateBtnText, { color: '#fff' }]}>
                            {isPending ? 'Ver Estatus de Seguridad' : '🛡️ Ir a Centro de Seguridad'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: 20 }} onPress={goBack}>
                        <Text style={{ color: theme.textMuted, fontWeight: '700' }}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    if (success) {
        return (
            <ScreenContainer>
                <View style={styles.successContainer}>
                    <View style={styles.confettiContainer}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <View key={i} style={[styles.confetti, {
                                backgroundColor: ['#7c3aed', '#ec4899', '#3b82f6', '#10b981'][i % 4],
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 60}%`,
                                transform: [{ rotate: `${Math.random() * 360}deg` }]
                            }]} />
                        ))}
                    </View>
                    <View style={[styles.successIconBox, { backgroundColor: '#10b98115' }]}>
                        <PartyPopper size={64} color="#10b981" />
                    </View>
                    <Text style={[styles.successTitle, { color: theme.text }]}>¡Solicitud Enviada!</Text>
                    <Text style={[styles.successDesc, { color: theme.textMuted }]}>
                        Tu postulación para {listing?.name} ha sido recibida con éxito. El equipo la revisará con prioridad.
                    </Text>
                    <TouchableOpacity
                        style={[styles.successBtn, { backgroundColor: theme.primary }]}
                        onPress={goToMyApplications}
                    >
                        <Text style={styles.successBtnText}>📄 Ver Mis Solicitudes</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScreenContainer>
                <ScreenHeader
                    title="Solicitud Adopción"
                    subtitle={listing?.name}
                    onBack={handleBack}
                    rightElement={
                        <View style={[styles.stepBadge, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={[styles.stepBadgeText, { color: theme.primary }]}>{step}/3</Text>
                        </View>
                    }
                />

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${(step / 3) * 100}%` }]} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {step === 1 && (
                        <View style={styles.formSection}>
                            <View style={styles.stepHeader}>
                                <View style={[styles.stepIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <Home size={20} color={theme.primary} />
                                </View>
                                <Text style={[styles.stepTitle, { color: theme.text }]}>Hogar y Entorno</Text>
                            </View>

                            <Text style={[styles.label, { color: theme.text }]}>Nombre Completo</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Nombre completo"
                                placeholderTextColor={theme.textMuted}
                                value={form.applicant_name || ''}
                                onChangeText={(t) => updateField('applicant_name', t)}
                            />

                            <Text style={[styles.label, { color: theme.text }]}>Tipo de Vivienda</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                                {['Casa', 'Departamento', 'Rancho', 'Otro'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.optionBtn, { backgroundColor: theme.surface }, form.house_type === type && styles.selectedOption]}
                                        onPress={() => updateField('house_type', type)}
                                    >
                                        <Text style={[styles.optionText, { color: theme.text }, form.house_type === type && { color: '#fff' }]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.switchRow}>
                                <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>¿Tiene patio o jardín?</Text>
                                <Switch value={form.has_yard} onToggle={() => updateField('has_yard', !form.has_yard)} theme={theme} />
                            </View>

                            <Text style={[styles.label, { color: theme.text }]}>Estatus de Vivienda</Text>
                            <View style={styles.toggleGroup}>
                                {['Propia', 'Renta'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.toggleBtn, { backgroundColor: theme.surface }, form.own_or_rent === type && styles.selectedOption]}
                                        onPress={() => updateField('own_or_rent', type)}
                                    >
                                        <Text style={[styles.optionText, { color: theme.text }, form.own_or_rent === type && { color: '#fff' }]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {form.own_or_rent === 'Renta' && (
                                <View style={styles.switchRow}>
                                    <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>¿Permiten mascotas?</Text>
                                    <Switch value={form.landlord_permission} onToggle={() => updateField('landlord_permission', !form.landlord_permission)} theme={theme} />
                                </View>
                            )}
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.formSection}>
                            <View style={styles.stepHeader}>
                                <View style={[styles.stepIcon, { backgroundColor: '#ec489915' }]}>
                                    <Users size={20} color="#ec4899" />
                                </View>
                                <Text style={[styles.stepTitle, { color: theme.text }]}>Familia y Rutina</Text>
                            </View>

                            <View style={styles.switchRow}>
                                <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>¿Hay niños en casa?</Text>
                                <Switch value={form.has_children} onToggle={() => updateField('has_children', !form.has_children)} theme={theme} />
                            </View>

                            {form.has_children && (
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                                    placeholder="Edades (Ej: 3 y 7 años)"
                                    placeholderTextColor={theme.textMuted}
                                    value={form.children_ages || ''}
                                    onChangeText={(t) => updateField('children_ages', t)}
                                />
                            )}

                            <Text style={[styles.label, { color: theme.text }]}>¿Pasará mucho tiempo sola?</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, width: 80, textAlign: 'center' }]}
                                    keyboardType="numeric"
                                    value={String(form.hours_alone)}
                                    onChangeText={(t) => updateField('hours_alone', parseInt(t) || 0)}
                                />
                                <Text style={{ color: theme.textMuted, fontWeight: '700' }}>Horas al día</Text>
                            </View>

                            <Text style={[styles.label, { color: theme.text }]}>¿Tienes otras mascotas?</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Especie, raza, edad..."
                                multiline
                                numberOfLines={3}
                                value={form.other_pets || ''}
                                onChangeText={(t) => updateField('other_pets', t)}
                            />
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.formSection}>
                            <View style={styles.stepHeader}>
                                <View style={[styles.stepIcon, { backgroundColor: '#10b98115' }]}>
                                    <Heart size={20} color="#10b981" />
                                </View>
                                <Text style={[styles.stepTitle, { color: theme.text }]}>Compromiso</Text>
                            </View>

                            <Text style={[styles.label, { color: theme.text }]}>Experiencia previa</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="He tenido perros toda mi vida..."
                                multiline
                                numberOfLines={3}
                                value={form.previous_experience || ''}
                                onChangeText={(t) => updateField('previous_experience', t)}
                            />

                            <Text style={[styles.label, { color: theme.text }]}>¿Por qué quieres adoptar?</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                                placeholder="Danos tus motivos..."
                                multiline
                                numberOfLines={4}
                                value={form.reason}
                                onChangeText={(t) => updateField('reason', t)}
                            />

                            <TouchableOpacity
                                style={[styles.checkRow, { borderLeftColor: form.financial_commitment ? '#10b981' : theme.textMuted }]}
                                onPress={() => updateField('financial_commitment', !form.financial_commitment)}
                            >
                                <View style={[styles.checkbox, { borderColor: theme.textMuted }, form.financial_commitment && { backgroundColor: '#10b981', borderColor: '#10b981' }]}>
                                    {form.financial_commitment && <Check size={14} color="#fff" />}
                                </View>
                                <Text style={[styles.checkText, { color: theme.text }]}>
                                    Acepto el compromiso financiero (comida, veterinario, vacunas).
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    {step < 3 ? (
                        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.primary }]} onPress={handleNext}>
                            <Text style={styles.nextBtnText}>Continuar</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: '#10b981' }, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>🤝 Enviar Solicitud Formal</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

function Switch({ value, onToggle, theme }: any) {
    return (
        <TouchableOpacity
            style={[styles.switch, { backgroundColor: value ? '#10b981' : theme.surface }]}
            onPress={onToggle}
            activeOpacity={0.8}
        >
            <View style={[styles.switchThumb, value && styles.switchThumbActive]} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    stepBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    stepBadgeText: { fontWeight: '900', fontSize: 12 },
    progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' },
    progressFill: { height: '100%' },
    scroll: { padding: 24 },
    formSection: { gap: 20 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    stepIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    stepTitle: { fontSize: 22, fontWeight: '900' },
    label: { fontSize: 15, fontWeight: '800', marginBottom: 8 },
    input: { height: 56, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
    optionsScroll: { flexDirection: 'row', marginBottom: 5 },
    optionBtn: { paddingHorizontal: 20, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    selectedOption: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
    optionText: { fontSize: 14, fontWeight: '700' },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    switch: { width: 52, height: 30, borderRadius: 15, padding: 4 },
    switchThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
    switchThumbActive: { alignSelf: 'flex-end' },
    toggleGroup: { flexDirection: 'row', gap: 10 },
    toggleBtn: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    inputRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.02)', borderLeftWidth: 4 },
    checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    checkText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
    footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1 },
    nextBtn: { height: 60, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    nextBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
    submitBtn: { height: 60, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },

    // Gate screens
    gateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    lockIconBox: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    gateTitle: { fontSize: 24, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
    gateDesc: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    gateBtn: { width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    gateBtnText: { fontSize: 16, fontWeight: '800' },

    // Success screen
    successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    successIconBox: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    successTitle: { fontSize: 28, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
    successDesc: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    successBtn: { width: '100%', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    successBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    confettiContainer: { position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' },
    confetti: { position: 'absolute', width: 10, height: 10, borderRadius: 2 },
});
