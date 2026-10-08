import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useKYC } from '@/src/hooks/perfil/useKYC';
import { useTheme } from '@/src/hooks/useTheme';
import { ShieldCheck, FileText, Camera, Images, CheckCircle2, AlertCircle, Info, ArrowRight } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';

const DOC_HINTS: Record<string, string> = {
    id_front: 'INE, Pasaporte o Cédula',
    id_back: 'Parte trasera del documento',
    proof_of_address: 'Luz, Agua o Teléfono (< 3 meses)',
};

export default function VerificationScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { theme } = useTheme();
    const { documents, pickDocument, handleSubmit, isSubmitting } = useKYC();

    const status = user?.verification_status || 'UNVERIFIED';
    const canUpload = status === 'UNVERIFIED' || status === 'REJECTED';

    const renderStatus = () => {
        const configs = {
            UNVERIFIED: { color: theme.textMuted, title: 'Cuenta no verificada', desc: 'Verifica tu identidad para iniciar procesos de adopción formal.' },
            PENDING: { color: theme.warning, title: 'Verificación en curso', desc: 'Estamos revisando tus documentos. Esto toma de 24 a 48 horas.' },
            VERIFIED: { color: theme.success, title: 'Cuenta verificada', desc: '¡Felicidades! Tienes acceso total a todas las funciones de Michicondrias.' },
            REJECTED: { color: theme.error, title: 'Verificación rechazada', desc: 'Hubo un problema con tus documentos. Por favor intenta de nuevo.' },
        };
        const config = configs[status as keyof typeof configs];

        return (
            <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                <View style={[styles.statusIconBox, { backgroundColor: config.color + '20' }]}>
                    {status === 'PENDING'
                        ? <ActivityIndicator color={config.color} />
                        : status === 'VERIFIED'
                            ? <CheckCircle2 size={32} color={config.color} />
                            : status === 'REJECTED'
                                ? <AlertCircle size={32} color={config.color} />
                                : <ShieldCheck size={32} color={config.color} />}
                </View>
                <View style={styles.statusInfo}>
                    <Text style={[styles.statusTitle, { color: theme.text }]}>{config.title}</Text>
                    <Text style={[styles.statusDesc, { color: theme.textMuted }]}>{config.desc}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <BackButton onPress={() => router.back()} />
                        <Text style={[styles.title, { color: theme.text }]}>Seguridad y KYC</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Centro de verificación de identidad</Text>
                </View>

                <View style={styles.content}>
                    {renderStatus()}

                    {/* Con la identidad aprobada, el siguiente paso es la cuenta profesional */}
                    {status === 'VERIFIED' && (
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.push('/perfil/partner')}
                            activeOpacity={0.85}
                        >
                            <View style={styles.ctaRow}>
                                <Text style={styles.submitBtnText}>Activar cuenta profesional</Text>
                                <ArrowRight size={20} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    )}

                    {canUpload && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Documentos requeridos</Text>

                            {documents.map((doc) => (
                                <View key={doc.key} style={[styles.docCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                                    <View style={styles.docRow}>
                                        <View style={[styles.docIcon, { backgroundColor: theme.primaryLight }]}>
                                            <FileText size={20} color={theme.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.docLabel, { color: theme.text }]}>{doc.label}</Text>
                                            <Text style={[styles.docStatus, { color: doc.uri ? theme.success : theme.textMuted }]}>
                                                {doc.uri ? '✓ Archivo seleccionado' : DOC_HINTS[doc.key]}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.docActions}>
                                        <TouchableOpacity
                                            style={[styles.docButton, { borderColor: theme.border }]}
                                            onPress={() => pickDocument(doc.key, 'camera')}
                                            activeOpacity={0.8}
                                        >
                                            <Camera size={16} color={theme.primary} />
                                            <Text style={[styles.docButtonText, { color: theme.primary }]}>Tomar foto</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.docButton, { borderColor: theme.border }]}
                                            onPress={() => pickDocument(doc.key, 'library')}
                                            activeOpacity={0.8}
                                        >
                                            <Images size={16} color={theme.primary} />
                                            <Text style={[styles.docButtonText, { color: theme.primary }]}>Galería</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            <View style={[styles.infoBox, { backgroundColor: theme.primaryLight }]}>
                                <Info size={18} color={theme.primary} />
                                <Text style={[styles.infoText, { color: theme.textMuted }]}>
                                    Tus datos están protegidos y solo se utilizarán para validar tu identidad en el proceso de adopción.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
                                disabled={isSubmitting}
                                onPress={handleSubmit}
                                activeOpacity={0.85}
                            >
                                {isSubmitting
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.submitBtnText}>Enviar para revisión</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    content: {
        padding: 24,
        gap: 24,
    },
    statusCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
    },
    statusIconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusInfo: {
        flex: 1,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    statusDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: -4,
    },
    docCard: {
        padding: 16,
        borderRadius: 20,
        gap: 12,
        borderWidth: 1,
    },
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    docIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    docStatus: {
        fontSize: 11,
        fontWeight: '600',
    },
    docActions: {
        flexDirection: 'row',
        gap: 10,
    },
    docButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 44,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    docButtonText: {
        fontSize: 13,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    ctaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
});
