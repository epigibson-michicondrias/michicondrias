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
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import { formatDateMx } from '@/src/features/salud/format';
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
        receiptUri,
        setReceiptUri,
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
                                        ? theme.successLight
                                        : theme.errorLight,
                                    borderColor: activePolicy
                                        ? theme.success
                                        : theme.error,
                                },
                            ]}
                        >
                            {isLoadingPolicy ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : activePolicy ? (
                                <>
                                    <Shield size={18} color={theme.success} />
                                    <View style={styles.policyStatusInfo}>
                                        <Text style={[styles.policyStatusTitle, { color: theme.success }]}>
                                            Póliza activa: {activePolicy.policy_number}
                                        </Text>
                                        <Text style={[styles.policyStatusDesc, { color: theme.textMuted }]}>
                                            Cobertura vigente hasta{' '}
                                            {formatDateMx(activePolicy.end_date)}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle size={18} color={theme.error} />
                                    <Text style={[styles.policyStatusTitle, { color: theme.error }]}>
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
                                <FormImagePicker
                                    imageUri={receiptUri}
                                    onImageSelected={setReceiptUri}
                                    onImageRemoved={() => setReceiptUri(null)}
                                    aspect={[3, 4]}
                                    previewHeight={180}
                                    placeholder="Adjuntar foto del recibo"
                                />
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
                                    La aseguradora revisará tu reclamo y el comprobante, y te avisaremos cuando lo resuelva.
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
