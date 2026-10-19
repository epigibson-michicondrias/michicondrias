/**
 * Piezas de la ficha de proveedor (paseadores, cuidadores, especialistas).
 * Hero + stats + bio + servicios + reseñas + CTA. Patrón común UX-001.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Star, MapPin, Phone, MessageCircle, Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, radius, type, layout, font } from '@/constants/design';

// ── Hero (avatar + nombre + especialidad + rating) ──
export function ProviderHero({ photoUrl, name, subtitle, rating, reviewCount, accent, children }: {
    photoUrl?: string | null;
    name: string;
    subtitle?: string | null;
    rating?: number;
    reviewCount?: number;
    accent?: string;
    children?: React.ReactNode;
}) {
    const { theme } = useTheme();
    const color = accent || theme.primary;
    return (
        <View style={styles.hero}>
            <View style={[styles.avatarContainer, { backgroundColor: color + '20' }]}>
                {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.avatar} />
                ) : (
                    <Text style={[styles.avatarText, { color }]}>{name.charAt(0).toUpperCase()}</Text>
                )}
            </View>
            <Text style={[styles.heroName, { color: theme.text }]}>{name}</Text>
            {!!subtitle && <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
            {typeof rating === 'number' && (
                <View style={styles.ratingRow}>
                    <Star size={16} color={theme.warning} fill={theme.warning} />
                    <Text style={[styles.ratingText, { color: theme.text }]}>{rating.toFixed(1)}</Text>
                    {!!reviewCount && <Text style={[styles.ratingCount, { color: theme.textMuted }]}>({reviewCount})</Text>}
                </View>
            )}
            {children}
        </View>
    );
}

// ── Stats (fila de métricas) ──
export function ProviderStats({ items }: { items: { value: string; label: string }[] }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.statsRow, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            {items.map((item, i) => (
                <React.Fragment key={item.label}>
                    {i > 0 && <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />}
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>{item.value}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>{item.label}</Text>
                    </View>
                </React.Fragment>
            ))}
        </View>
    );
}

// ── Sección con título ──
export function ProviderSection({ title, children }: { title: string; children: React.ReactNode }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
            {children}
        </View>
    );
}

// ── Bio ──
export function ProviderBio({ text }: { text: string }) {
    const { theme } = useTheme();
    return <Text style={[styles.bioText, { color: theme.textMuted }]}>{text}</Text>;
}

// ── Servicios (lista de chips) ──
export function ProviderServices({ services }: { services: { name: string; active?: boolean; icon?: React.ReactNode }[] }) {
    const { theme } = useTheme();
    return (
        <View style={styles.servicesGrid}>
            {services.map((s) => (
                <View key={s.name} style={[styles.serviceCard, {
                    borderColor: theme.borderLight,
                    backgroundColor: s.active ? theme.primary + '10' : theme.surface,
                }]}>
                    {s.icon}
                    <Text style={[styles.serviceName, { color: s.active ? theme.primary : theme.textMuted }]}>{s.name}</Text>
                </View>
            ))}
        </View>
    );
}

// ── Ubicación ──
export function ProviderLocation({ text, extra }: { text: string; extra?: string }) {
    const { theme } = useTheme();
    return (
        <View style={styles.locationRow}>
            <MapPin size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.locationText, { color: theme.text }]}>{text}</Text>
                {!!extra && <Text style={[styles.locationText, { color: theme.textMuted, fontSize: font.md }]}>{extra}</Text>}
            </View>
        </View>
    );
}

// ── Precio ──
export function ProviderPrice({ label, amount }: { label: string; amount: string }) {
    const { theme } = useTheme();
    return (
        <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>{label}</Text>
            <Text style={[styles.priceAmount, { color: theme.primary }]}>{amount}</Text>
        </View>
    );
}

// ── Resumen de rating ──
export function ProviderRatingSummary({ rating, count }: { rating: number; count: number }) {
    const { theme } = useTheme();
    return (
        <View style={[styles.ratingSummaryCard, { backgroundColor: theme.primary + '08', borderColor: theme.borderLight }]}>
            <Text style={[styles.ratingBig, { color: theme.primary }]}>{rating.toFixed(1)}</Text>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={18} color={i <= Math.round(rating) ? theme.warning : theme.border} fill={i <= Math.round(rating) ? theme.warning : 'transparent'} />
                ))}
            </View>
            <Text style={[styles.ratingCount, { color: theme.textMuted }]}>{count} reseña{count !== 1 ? 's' : ''}</Text>
        </View>
    );
}

// ── Lista de reseñas ──
export function ProviderReviews({ reviews }: { reviews: { id: string; user_name?: string; rating: number; comment?: string; created_at?: string }[] }) {
    const { theme } = useTheme();
    return (
        <View style={styles.reviewsList}>
            {reviews.map((r) => (
                <View key={r.id} style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                    <View style={styles.reviewHeader}>
                        <View style={[styles.reviewAvatar, { backgroundColor: theme.primary + '15' }]}>
                            <Text style={[styles.reviewAvatarText, { color: theme.primary }]}>{(r.user_name || '?').charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.reviewName, { color: theme.text }]}>{r.user_name || 'Usuario'}</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} size={12} color={i <= r.rating ? theme.warning : theme.border} fill={i <= r.rating ? theme.warning : 'transparent'} />
                                ))}
                            </View>
                        </View>
                    </View>
                    {!!r.comment && <Text style={[styles.reviewComment, { color: theme.textMuted }]}>{r.comment}</Text>}
                </View>
            ))}
        </View>
    );
}

// ── Formulario de reseña ──
export function ProviderReviewForm({ onSubmit, isSubmitting }: {
    onSubmit: (rating: number, comment: string) => void;
    isSubmitting?: boolean;
}) {
    const { theme } = useTheme();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    return (
        <View style={[styles.reviewForm, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Escribir reseña</Text>
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity key={i} onPress={() => setRating(i)} accessibilityRole="button" accessibilityLabel={`${i} estrella${i > 1 ? 's' : ''}`}>
                        <Star size={28} color={i <= rating ? theme.warning : theme.border} fill={i <= rating ? theme.warning : 'transparent'} />
                    </TouchableOpacity>
                ))}
            </View>
            <TextInput
                style={[styles.reviewInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                placeholder="Cuéntanos tu experiencia..."
                placeholderTextColor={theme.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
            />
            <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }, isSubmitting && { opacity: 0.7 }]}
                onPress={() => onSubmit(rating, comment)}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Publicar reseña"
            >
                {isSubmitting ? <ActivityIndicator color={theme.onPrimary} size="small" /> : <Text style={[styles.submitBtnText, { color: theme.onPrimary }]}>Publicar reseña</Text>}
            </TouchableOpacity>
        </View>
    );
}

// ── CTA fijo abajo ──
export function ProviderFooter({ label, onPress, disabled, icon }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}) {
    const { theme } = useTheme();
    return (
        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.borderLight }]}>
            <TouchableOpacity
                style={[styles.bookBtn, { backgroundColor: theme.primary }, disabled && { opacity: 0.6 }]}
                onPress={onPress}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                {icon}
                <Text style={[styles.bookBtnText, { color: theme.onPrimary }]}>{label}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: { alignItems: 'center', paddingVertical: spacing.xl },
    avatarContainer: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    avatar: { width: 96, height: 96, borderRadius: 48 },
    avatarText: { fontSize: 36, fontWeight: '800' },
    heroName: { fontSize: type.h1.fontSize, fontWeight: '900', textAlign: 'center' },
    heroSubtitle: { fontSize: type.body.fontSize, marginTop: spacing.xs, textAlign: 'center' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
    ratingText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    ratingCount: { fontSize: type.caption.fontSize },
    statsRow: { flexDirection: 'row', borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.lg, overflow: 'hidden' },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
    statDivider: { width: 1 },
    statNumber: { fontSize: type.h2.fontSize, fontWeight: '900' },
    statLabel: { fontSize: type.caption.fontSize, marginTop: spacing.xxs },
    section: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
    sectionTitle: { fontSize: type.subtitle.fontSize, fontWeight: '800', marginBottom: spacing.md },
    bioText: { fontSize: type.body.fontSize, lineHeight: 22 },
    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    serviceCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
    serviceName: { fontSize: type.caption.fontSize, fontWeight: '700' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    locationText: { fontSize: type.body.fontSize, fontWeight: '500' },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { fontSize: type.body.fontSize },
    priceAmount: { fontSize: type.h2.fontSize, fontWeight: '900' },
    ratingSummaryCard: { alignItems: 'center', padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.lg },
    ratingBig: { fontSize: 48, fontWeight: '900' },
    starsRow: { flexDirection: 'row', gap: spacing.xxs, marginVertical: spacing.xs },
    reviewsList: { gap: spacing.sm },
    reviewCard: { borderRadius: radius.md, borderWidth: 1, padding: spacing.lg },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
    reviewAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    reviewAvatarText: { fontSize: font.base, fontWeight: '800' },
    reviewName: { fontSize: type.body.fontSize, fontWeight: '700' },
    reviewComment: { fontSize: type.body.fontSize, lineHeight: 20 },
    reviewForm: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.md },
    reviewInput: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: type.body.fontSize, minHeight: 80, textAlignVertical: 'top' },
    submitBtn: { borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    footer: { padding: spacing.lg, paddingBottom: spacing.xl, borderTopWidth: 1 },
    bookBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: layout.minTouch + 8, borderRadius: radius.lg },
    bookBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
});
