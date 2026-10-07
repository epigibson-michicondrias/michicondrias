import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMemorial } from '@/src/hooks/funerary/useMemorial';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import PetPicker from '@/src/features/salud/PetPicker';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import { Send, Info } from 'lucide-react-native';

export default function NuevoMemorialScreen() {
    const { theme } = useTheme();
    const { petId } = useLocalSearchParams<{ petId?: string }>();
    const { form, updateForm, handleCreatePost, isCreating, photoUri, setPhotoUri } = useMemorial(petId);

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Nuevo Mensaje"
                subtitle="Comparte un recuerdo de tu mascota"
            />

            <KeyboardScreen contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {!petId && (
                        <PetPicker value={form.pet_id} onChange={(id) => updateForm('pet_id', id)} />
                    )}

                    {/* Message */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Mensaje *</Text>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Escribe tu mensaje de recuerdo..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={form.message}
                            onChangeText={(val) => updateForm('message', val)}
                        />
                    </View>

                    {/* Foto (opcional) */}
                    <FormImagePicker
                        label="Foto (opcional)"
                        imageUri={photoUri}
                        onImageSelected={setPhotoUri}
                        onImageRemoved={() => setPhotoUri(null)}
                        placeholder="Agregar una foto del recuerdo"
                        previewHeight={200}
                    />

                    {/* Info box */}
                    <View style={[styles.infoBox, { backgroundColor: theme.secondary + '10' }]}>
                        <Info size={18} color={theme.secondary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Los mensajes de memorial son un espacio de respeto y cariño para honrar a quienes ya no están con nosotros.
                        </Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Publicar mensaje de memorial"
                        style={[styles.submitBtn, { backgroundColor: theme.secondary }, isCreating && { opacity: 0.7 }]}
                        disabled={isCreating}
                        onPress={handleCreatePost}
                    >
                        <Send size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>
                            {isCreating ? 'Publicando...' : 'Publicar Mensaje'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
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
        height: 160,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
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
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        marginBottom: 40,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
});
