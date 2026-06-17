import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useKYC, KYCDocument } from '@/src/hooks/perfil/useKYC';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormSection from '@/src/components/forms/FormSection';
import * as ImagePicker from 'expo-image-picker';
import { Shield, Upload, CheckCircle, Camera, FileCheck, AlertCircle } from 'lucide-react-native';

export default function KYCScreen() {
    const { theme } = useTheme();
    const {
        documents,
        setDocumentUri,
        allDocumentsSelected,
        isAnyUploading,
        uploadProgress,
        handleSubmit,
        isSubmitting,
    } = useKYC();

    const pickImage = async (docKey: string) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setDocumentUri(docKey, result.assets[0].uri);
        }
    };

    const takePhoto = async (docKey: string) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setDocumentUri(docKey, result.assets[0].uri);
        }
    };

    const renderDocumentCard = (doc: KYCDocument) => {
        const hasImage = !!doc.uri;
        const isUploading = doc.uploading;
        const isDone = doc.uploaded;

        return (
            <View
                key={doc.key}
                style={[
                    styles.docCard,
                    {
                        backgroundColor: isDone
                            ? '#10b98110'
                            : hasImage
                                ? theme.primary + '10'
                                : theme.surface,
                        borderColor: isDone
                            ? '#10b981'
                            : hasImage
                                ? theme.primary
                                : theme.border,
                    },
                ]}
            >
                <View style={styles.docHeader}>
                    <View style={[
                        styles.docIcon,
                        {
                            backgroundColor: isDone
                                ? '#10b98120'
                                : hasImage
                                    ? theme.primary + '20'
                                    : theme.background,
                        },
                    ]}>
                        {isDone ? (
                            <CheckCircle size={24} color="#10b981" />
                        ) : isUploading ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <FileCheck size={24} color={hasImage ? theme.primary : theme.textMuted} />
                        )}
                    </View>
                    <View style={styles.docInfo}>
                        <Text style={[styles.docLabel, { color: theme.text }]}>{doc.label}</Text>
                        <Text style={[styles.docStatus, { color: isDone ? '#10b981' : hasImage ? theme.primary : theme.textMuted }]}>
                            {isDone ? 'Subido ✓' : isUploading ? 'Subiendo...' : hasImage ? 'Seleccionado' : 'Pendiente'}
                        </Text>
                    </View>
                </View>

                {!isDone && (
                    <View style={styles.docActions}>
                        <TouchableOpacity
                            style={[styles.docActionBtn, { backgroundColor: theme.primary + '15' }]}
                            onPress={() => pickImage(doc.key)}
                            disabled={isUploading}
                        >
                            <Upload size={16} color={theme.primary} />
                            <Text style={[styles.docActionText, { color: theme.primary }]}>Galería</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.docActionBtn, { backgroundColor: theme.secondary + '15' }]}
                            onPress={() => takePhoto(doc.key)}
                            disabled={isUploading}
                        >
                            <Camera size={16} color={theme.secondary} />
                            <Text style={[styles.docActionText, { color: theme.secondary }]}>Cámara</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="🛡️ Verificación KYC"
                subtitle="Verifica tu identidad para operar"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Info banner */}
                    <View style={[styles.infoBanner, { backgroundColor: theme.primary + '10' }]}>
                        <Shield size={20} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Para operar como patrocinador o establecimiento, necesitamos verificar tu identidad. Sube los siguientes documentos.
                        </Text>
                    </View>

                    {/* Progress */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressLabel, { color: theme.text }]}>Progreso</Text>
                            <Text style={[styles.progressValue, { color: theme.primary }]}>
                                {Math.round(uploadProgress * 100)}%
                            </Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                            <View
                                style={[
                                    styles.progressBar,
                                    {
                                        backgroundColor: theme.primary,
                                        width: `${uploadProgress * 100}%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <FormSection title="Documentos requeridos">
                        {documents.map(renderDocumentCard)}
                    </FormSection>

                    {/* Warning */}
                    <View style={[styles.warningBanner, { backgroundColor: '#f59e0b10' }]}>
                        <AlertCircle size={16} color="#f59e0b" />
                        <Text style={[styles.warningText, { color: theme.textMuted }]}>
                            Asegúrate de que las imágenes sean legibles y no estén borrosas.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: allDocumentsSelected ? theme.primary : theme.border },
                            (isSubmitting || isAnyUploading) && styles.submitDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!allDocumentsSelected || isSubmitting || isAnyUploading}
                    >
                        {isSubmitting || isAnyUploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Shield size={20} color="#fff" />
                                <Text style={styles.submitText}>Enviar Documentos</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 24,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 14,
        gap: 12,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
    progressSection: {
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    docCard: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        marginBottom: 12,
    },
    docHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    docIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    docInfo: {
        flex: 1,
    },
    docLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    docStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    docActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    docActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    docActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 10,
        marginBottom: 20,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
