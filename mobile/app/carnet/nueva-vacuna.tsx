import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVaccine, Vaccine } from '../../src/services/carnet';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Save, Syringe, Calendar, Hash, Info, Clock } from 'lucide-react-native';

export default function NuevaVacunaScreen() {
    const { pet_id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [name, setName] = useState('');
    const [batch, setBatch] = useState('');
    const [nextDue, setNextDue] = useState('');
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: (data: any) => createVaccine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-vaccines', pet_id] });
            router.back();
        },
        onError: (error: any) => {
            Alert.alert("Error", error.message || "No se pudo registrar la vacuna.");
        }
    });

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Campo Requerido", "Por favor ingresa el nombre de la vacuna.");
            return;
        }

        mutation.mutate({
            pet_id: pet_id as string,
            name: name,
            batch_number: batch || undefined,
            next_due_date: nextDue || undefined,
            notes: notes || undefined
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Registrar Vacuna</Text>
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: '#0891b2' }]}
                    onPress={handleSave}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? <ActivityIndicator color="#fff" size="small" /> : <Save size={20} color="#fff" />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Syringe size={18} color="#0891b2" />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información de la Vacuna</Text>
                    </View>

                    <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>NOMBRE DE LA VACUNA *</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Ej. Quíntuple Canina, Rabia..."
                            placeholderTextColor={theme.textMuted}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                        <View style={styles.labelRow}>
                            <Hash size={14} color={theme.textMuted} />
                            <Text style={[styles.label, { color: theme.textMuted }]}>NÚMERO DE LOTE</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Ej. BTX-90210"
                            placeholderTextColor={theme.textMuted}
                            value={batch}
                            onChangeText={setBatch}
                        />
                    </View>

                    <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                        <View style={styles.labelRow}>
                            <Clock size={14} color={theme.textMuted} />
                            <Text style={[styles.label, { color: theme.textMuted }]}>PRÓXIMO REFUERZO (YYYY-MM-DD)</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="2025-05-20"
                            placeholderTextColor={theme.textMuted}
                            value={nextDue}
                            onChangeText={setNextDue}
                        />
                    </View>

                    <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>NOTAS ADICIONALES</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Observaciones de la aplicación..."
                            placeholderTextColor={theme.textMuted}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>
                </View>

                <View style={[styles.infoBox, { backgroundColor: '#0891b215' }]}>
                    <Info size={16} color="#0891b2" />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                        Como veterinario, asegúrate de verificar la vigencia de la vacuna antes de registrarla. El sistema notificará al dueño sobre su próximo refuerzo.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    inputGroup: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
        opacity: 0.8,
    }
});
