/**
 * ReviewsSection — promedio, listado y formulario de reseña (1–5 estrellas + comentario).
 * Genérico: lo usan programas de entrenamiento y estilistas. El formulario solo aparece si `canReview`.
 */
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

export interface ReviewItem {
    id: string;
    rating: number;
    comment?: string | null;
    created_at?: string | null;
    author_name?: string | null;
    is_mine?: boolean;
}

export function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
    const { theme } = useTheme();
    return (
        <View style={styles.starsRow} accessibilityLabel={`${value} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= Math.round(value);
                const icon = <Star size={size} color={filled ? theme.accent : theme.textMuted} fill={filled ? theme.accent : 'transparent'} />;
                return onChange ? (
                    <TouchableOpacity key={n} onPress={() => onChange(n)} accessibilityRole="button" accessibilityLabel={`${n} estrella${n > 1 ? 's' : ''}`} hitSlop={6}>
                        {icon}
                    </TouchableOpacity>
                ) : (
                    <View key={n}>{icon}</View>
                );
            })}
        </View>
    );
}

/** Formulario suelto (estrellas + comentario + enviar), reutilizable dentro de un modal. */
export function ReviewForm({ prompt, submitting, onSubmit }: { prompt: string; submitting?: boolean; onSubmit: (rating: number, comment: string) => void }) {
    const { theme } = useTheme();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    return (
        <View style={styles.form}>
            <Text style={[styles.formPrompt, { color: theme.text }]}>{prompt}</Text>
            <Stars value={rating} size={30} onChange={setRating} />
            <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={comment}
                onChangeText={setComment}
                placeholder="Cuéntanos más (opcional)"
                placeholderTextColor={theme.textMuted}
                multiline
                maxLength={1000}
            />
            <TouchableOpacity
                style={[styles.submit, { backgroundColor: theme.primary, opacity: rating === 0 || submitting ? 0.5 : 1 }]}
                disabled={rating === 0 || submitting}
                onPress={() => onSubmit(rating, comment.trim())}
                accessibilityRole="button"
                accessibilityLabel="Enviar reseña"
            >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Enviar reseña</Text>}
            </TouchableOpacity>
        </View>
    );
}

interface Props {
    title?: string;
    average: number;
    count: number;
    reviews: ReviewItem[];
    canReview?: boolean;
    submitting?: boolean;
    onSubmit?: (rating: number, comment: string) => void;
    /** Texto del formulario, p. ej. "¿Cómo fue tu experiencia?" */
    formPrompt?: string;
}

export default function ReviewsSection({ title = 'Reseñas', average, count, reviews, canReview, submitting, onSubmit, formPrompt = '¿Cómo fue tu experiencia?' }: Props) {
    const { theme } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                {count > 0 ? (
                    <View style={styles.avgBox}>
                        <Stars value={average} />
                        <Text style={[styles.avgText, { color: theme.textMuted }]}>{average.toFixed(1)} ({count})</Text>
                    </View>
                ) : null}
            </View>

            {canReview && onSubmit ? (
                <View style={[styles.formWrap, { borderColor: theme.borderLight }]}>
                    <ReviewForm prompt={formPrompt} submitting={submitting} onSubmit={onSubmit} />
                </View>
            ) : null}

            {reviews.length === 0 ? (
                <Text style={[styles.empty, { color: theme.textMuted }]}>Aún no hay reseñas.</Text>
            ) : (
                reviews.map((r) => (
                    <View key={r.id} style={[styles.review, { borderTopColor: theme.borderLight }]}>
                        <View style={styles.reviewHead}>
                            <Text style={[styles.author, { color: theme.text }]}>{r.is_mine ? 'Tú' : (r.author_name || 'Usuario')}</Text>
                            <Stars value={r.rating} size={13} />
                        </View>
                        {r.comment ? <Text style={[styles.comment, { color: theme.textMuted }]}>{r.comment}</Text> : null}
                        {r.created_at ? (
                            <Text style={[styles.date, { color: theme.textMuted }]}>{new Date(r.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        ) : null}
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { marginHorizontal: 24, marginBottom: 16, padding: 20, borderRadius: 16, borderWidth: 1, gap: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '700' },
    avgBox: { alignItems: 'flex-end', gap: 2 },
    avgText: { fontSize: 12, fontWeight: '600' },
    starsRow: { flexDirection: 'row', gap: 4 },
    formWrap: { paddingBottom: 12, borderBottomWidth: 1 },
    form: { gap: 10 },
    formPrompt: { fontSize: 15, fontWeight: '700' },
    input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, minHeight: 70, textAlignVertical: 'top' },
    submit: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
    empty: { fontSize: 14 },
    review: { borderTopWidth: 1, paddingTop: 10, gap: 4 },
    reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    author: { fontSize: 14, fontWeight: '700' },
    comment: { fontSize: 14, lineHeight: 20 },
    date: { fontSize: 11 },
});
