import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useInsuranceClaim } from '@/src/hooks/insurance/useInsuranceClaim';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import type { Pet } from '@/src/types/mascotas';
import {
    Shield,
    FileText,
    DollarSign,
    PawPrint,
    Send,
    CheckCircle,
    AlertTriangle,
    Receipt,
    Sparkles,
} from 'lucide-react-native';

export default function NuevoReclamoScreen() {
    const { theme } = useTheme();
    const {
        form,
        updateField,
        pets,
        selectedPetId,
        selectedPet,
        activePolicy,
        isLoading,
        isLoadingPolicy,
        isSubmitting,
        isVerifying,
        setSelectedPetId,
        handleSubmit,
    } = useInsuranceClaim();

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="📋 Nuevo Reclamo" />
                <LoadingOverlay message="Cargando datos..." />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="📋 Nuevo Reclamo"
                subtitle="Presenta un reclamo de seguro"
                gradient={['#f59e0b', '#d97706']}
            />

            <KeyboardScreen style={styles.keyboardContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Pet Selector */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <PawPrint size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Mascota asegurada
                            </Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.petList}
                        >
                            {pets.map((pet: Pet) => (
                                <TouchableOpacity
                                    key={pet.id}
                                    style={[
                                        styles.petChip,
                                        {
                                            backgroundColor:
                                                selectedPetId === pet.id
                                                    ? theme.primary + '20'
                                                    : theme.surface,
                                            borderColor:
                                                selectedPetId === pet.id
                                                    ? theme.primary
                                                    : theme.border,
                                        },
                                    ]}
                                    onPress={() => setSelectedPetId(pet.id)}
                                >
                                    <Text style={styles.petChipEmoji}>
                                        {pet.species === 'perro' || pet.species === 'dog'
                                            ? '🐕'
                                            : '🐈'}
                                    </Text>
                                    <Text
                                        style={[styles.petChipName, { color: theme.text }]}
                                        numberOfLines={1}
                                    >
                                        {pet.name}
                                    </Text>
                                    {selectedPetId === pet.id && (
                                        <CheckCircle size={14} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Policy Status */}
                    {selectedPetId && (
                        <View
                            style={[
                                styles.policyStatus,
                                {
                                    backgroundColor: activePolicy
                                        ? '#10b981' + '10'
                                        : '#ef4444' + '10',
                                    borderColor: activePolicy
                                        ? '#10b981' + '30'
                                        : '#ef4444' + '30',
                                },
                            ]}
                        >
                            {isLoadingPolicy ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : activePolicy ? (
                                <>
                                    <Shield size={18} color="#10b981" />
                                    <View style={styles.policyStatusInfo}>
                                        <Text style={[styles.policyStatusTitle, { color: '#10b981' }]}>
                                            Póliza activa: {activePolicy.policy_number}
                                        </Text>
                                        <Text style={[styles.policyStatusDesc, { color: theme.textMuted }]}>
                                            Cobertura vigente hasta{' '}
                                            {new Date(activePolicy.end_date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={18} color="#ef4444" />
                                    <Text style={[styles.policyStatusTitle, { color: '#ef4444' }]}>
                                        {selectedPet?.name} no tiene póliza activa
                                    </Text>
                                </>
                            )}
                        </View>
                    )}

                    {/* Claim Form */}
                    {activePolicy && (
                        <>
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <FileText size={18} color={theme.primary} />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                        Detalles del reclamo
                                    </Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>
                                        Motivo del reclamo *
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.textArea,
                                            {
                                                backgroundColor: theme.surface,
                                                color: theme.text,
                                                borderColor: theme.border,
                                            },
                                        ]}
                                        placeholder="Describe qué sucedió con tu mascota..."
                                        placeholderTextColor={theme.textMuted}
                                        multiline
                                        numberOfLines={4}
                                        value={form.reason}
                                        onChangeText={(val) => updateField('reason', val)}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>
                                        Monto reclamado *
                                    </Text>
                                    <View
                                        style={[
                                            styles.amountInput,
                                            {
                                                backgroundColor: theme.surface,
                                                borderColor: theme.border,
                                            },
                                        ]}
                                    >
                                        <DollarSign size={18} color={theme.textMuted} />
                                        <TextInput
                                            style={[styles.amountField, { color: theme.text }]}
                                            placeholder="0.00"
                                            placeholderTextColor={theme.textMuted}
                                            keyboardType="numeric"
                                            value={form.amount_claimed}
                                            onChangeText={(val) =>
                                                updateField('amount_claimed', val)
                                            }
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Receipt URL */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Receipt size={18} color={theme.primary} />
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                        Recibo médico
                                    </Text>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: theme.text }]}>
                                        URL del recibo (opcional)
                                    </Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: theme.surface,
                                                color: theme.text,
                                                borderColor: theme.border,
                                            },
                                        ]}
                                        placeholder="https://..."
                                        placeholderTextColor={theme.textMuted}
                                        value={form.medical_receipt_url}
                                        onChangeText={(val) =>
                                            updateField('medical_receipt_url', val)
                                        }
                                        autoCapitalize="none"
                                        keyboardType="url"
                                    />
                                </View>
                            </View>

                            {/* AI Verification info box */}
                            <View
                                style={[
                                    styles.aiInfoBox,
                                    { backgroundColor: theme.primary + '10' },
                                ]}
                            >
                                <Sparkles size={18} color={theme.primary} />
                                <Text style={[styles.aiInfoText, { color: theme.textMuted }]}>
                                    Una vez enviado, nuestro sistema de IA verificará automáticamente
                                    la información del recibo médico.
                                </Text>
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                style={[
                                    styles.submitBtn,
                                    {
                                        backgroundColor: isSubmitting
                                            ? theme.primary + '80'
                                            : theme.primary,
                                    },
                                ]}
                                disabled={isSubmitting}
                                onPress={handleSubmit}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Send size={20} color="#fff" />
                                        <Text style={styles.submitBtnText}>Enviar Reclamo</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    petList: {
        gap: 10,
    },
    petChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    petChipEmoji: {
        fontSize: 20,
    },
    petChipName: {
        fontSize: 14,
        fontWeight: '600',
    },
    policyStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 12,
        marginBottom: 24,
    },
    policyStatusInfo: {
        flex: 1,
    },
    policyStatusTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    policyStatusDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    inputGroup: {
        gap: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        minHeight: 100,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    amountInput: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        gap: 8,
    },
    amountField: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
    },
    aiInfoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    aiInfoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        flexDirection: 'row',
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    bottomSpacer: {
        height: 40,
    },
});
