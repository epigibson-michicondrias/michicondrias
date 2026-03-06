import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getListing, requestAdoption, AdoptionRequestCreate } from '../../../src/services/adopciones';
import Colors from '../../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Home, Users, Heart, Check, Info } from 'lucide-react-native';

export default function SolicitarAdopcionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<AdoptionRequestCreate>({
        applicant_name: '',
        house_type: 'Casa',
        has_yard: false,
        own_or_rent: 'Propia',
        landlord_permission: true,
        other_pets: '',
        has_children: false,
        children_ages: '',
        hours_alone: 4,
        financial_commitment: true,
        reason: '',
        previous_experience: '',
    });

    const { data: listing, isLoading: loadingListing } = useQuery({
        queryKey: ['adopcion', id],
        queryFn: () => getListing(id as string),
    });

    if (loadingListing || !listing) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const handleNext = () => {
        if (step === 1) {
            if (!form.applicant_name) return Alert.alert("Error", "Tu nombre es obligatorio");
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const handleSubmit = async () => {
        if (!form.reason) return Alert.alert("Error", "Cuéntanos por qué deseas adoptar");

        setLoading(true);
        try {
            await requestAdoption(id as string, form);
            Alert.alert(
                "¡Solicitud Enviada!",
                "Tu solicitud para adoptar a " + listing.name + " ha sido recibida. El rescatista revisará tu perfil y se pondrá en contacto contigo.",
                [{ text: "Entendido", onPress: () => router.dismissAll() }]
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo enviar la solicitud. Intenta más tarde.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.formSection}>
            <View style={styles.stepHeader}>
                <Home size={24} color={theme.primary} />
                <Text style={[styles.stepTitle, { color: theme.text }]}>Tu Hogar</Text>
            </View>
            <Text style={[styles.label, { color: theme.text }]}>Nombre Completo</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Como aparece en tu identificación"
                placeholderTextColor={theme.textMuted}
                value={form.applicant_name || ''}
                onChangeText={(t) => setForm({ ...form, applicant_name: t })}
            />

            <Text style={[styles.label, { color: theme.text }]}>Tipo de Vivienda</Text>
            <View style={styles.choiceRow}>
                {['Casa', 'Departamento', 'Otro'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.choiceBtn, { backgroundColor: theme.surface }, form.house_type === type && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                        onPress={() => setForm({ ...form, house_type: type })}
                    >
                        <Text style={[styles.choiceText, { color: form.house_type === type ? '#fff' : theme.textMuted }]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: theme.text }]}>¿Tienes patio o jardín?</Text>
                </View>
                <TouchableOpacity
                    style={[styles.switch, { backgroundColor: form.has_yard ? '#10b981' : theme.surface }]}
                    onPress={() => setForm({ ...form, has_yard: !form.has_yard })}
                >
                    <View style={[styles.switchThumb, form.has_yard && styles.switchThumbActive]} />
                </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Situación de la vivienda</Text>
            <View style={styles.choiceRow}>
                {['Propia', 'Renta'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.choiceBtn, { backgroundColor: theme.surface }, form.own_or_rent === type && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                        onPress={() => setForm({ ...form, own_or_rent: type })}
                    >
                        <Text style={[styles.choiceText, { color: form.own_or_rent === type ? '#fff' : theme.textMuted }]}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {form.own_or_rent === 'Renta' && (
                <View style={styles.switchRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>¿Tienes permiso del casero?</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.switch, { backgroundColor: form.landlord_permission ? '#10b981' : theme.surface }]}
                        onPress={() => setForm({ ...form, landlord_permission: !form.landlord_permission })}
                    >
                        <View style={[styles.switchThumb, form.landlord_permission && styles.switchThumbActive]} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formSection}>
            <View style={styles.stepHeader}>
                <Users size={24} color={theme.primary} />
                <Text style={[styles.stepTitle, { color: theme.text }]}>Familia y Otros Pets</Text>
            </View>

            <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: theme.text }]}>¿Viven niños en casa?</Text>
                </View>
                <TouchableOpacity
                    style={[styles.switch, { backgroundColor: form.has_children ? '#10b981' : theme.surface }]}
                    onPress={() => setForm({ ...form, has_children: !form.has_children })}
                >
                    <View style={[styles.switchThumb, form.has_children && styles.switchThumbActive]} />
                </TouchableOpacity>
            </View>

            {form.has_children && (
                <TextInput
                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, marginTop: -10 }]}
                    placeholder="Edades de los niños"
                    placeholderTextColor={theme.textMuted}
                    value={form.children_ages || ''}
                    onChangeText={(t) => setForm({ ...form, children_ages: t })}
                />
            )}

            <Text style={[styles.label, { color: theme.text, marginTop: 10 }]}>¿Tienes otras mascotas?</Text>
            <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Ej. Un perro pug de 3 años, un gato..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={form.other_pets || ''}
                onChangeText={(t) => setForm({ ...form, other_pets: t })}
            />

            <Text style={[styles.label, { color: theme.text }]}>¿Cuántas horas se quedará solo?</Text>
            <View style={styles.hoursRow}>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, width: 80, textAlign: 'center' }]}
                    keyboardType="numeric"
                    value={String(form.hours_alone)}
                    onChangeText={(t) => setForm({ ...form, hours_alone: parseInt(t) || 0 })}
                />
                <Text style={[styles.hoursSuffix, { color: theme.textMuted }]}>Horas al día</Text>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.formSection}>
            <View style={styles.stepHeader}>
                <Heart size={24} color={theme.primary} />
                <Text style={[styles.stepTitle, { color: theme.text }]}>Compromiso</Text>
            </View>

            <Text style={[styles.label, { color: theme.text }]}>¿Por qué quieres adoptar a {listing.name}?</Text>
            <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Cuéntanos tus razones..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                value={form.reason}
                onChangeText={(t) => setForm({ ...form, reason: t })}
            />

            <Text style={[styles.label, { color: theme.text }]}>Experiencia previa con animales</Text>
            <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text }]}
                placeholder="Cuéntanos si has tenido mascotas antes..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={form.previous_experience || ''}
                onChangeText={(t) => setForm({ ...form, previous_experience: t })}
            />

            <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: theme.text }]}>Acepto el compromiso financiero</Text>
                    <Text style={[styles.smallLabel, { color: theme.textMuted }]}>Alimento premium, veterinario, vacunas...</Text>
                </View>
                <TouchableOpacity
                    style={[styles.switch, { backgroundColor: form.financial_commitment ? '#10b981' : theme.surface }]}
                    onPress={() => setForm({ ...form, financial_commitment: !form.financial_commitment })}
                >
                    <View style={[styles.switchThumb, form.financial_commitment && styles.switchThumbActive]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.title, { color: theme.text }]}>Solicitud de Adopción</Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Para: {listing.name}</Text>
                    </View>
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>{step}/3</Text>
                    </View>
                </View>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${(step / 3) * 100}%` }]} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    {step < 3 ? (
                        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.primary }]} onPress={handleNext}>
                            <Text style={styles.nextBtnText}>Siguiente</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: theme.secondary }, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Check size={20} color="#fff" />
                                    <Text style={styles.submitBtnText}>Enviar Solicitud</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 15,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 12,
    },
    stepBadge: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    stepBadgeText: {
        color: '#7c3aed',
        fontWeight: '800',
        fontSize: 12,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: '100%',
    },
    progressFill: {
        height: '100%',
    },
    scroll: {
        padding: 24,
    },
    formSection: {
        gap: 20,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '900',
    },
    label: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 8,
    },
    smallLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    textArea: {
        height: 100,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    choiceRow: {
        flexDirection: 'row',
        gap: 10,
    },
    choiceBtn: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.1)',
    },
    choiceText: {
        fontSize: 14,
        fontWeight: '700',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    switch: {
        width: 52,
        height: 28,
        borderRadius: 14,
        padding: 4,
    },
    switchThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },
    hoursRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    hoursSuffix: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    nextBtn: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    submitBtn: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#ec4899',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
