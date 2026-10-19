import React from 'react';
import { StyleSheet, View, Text, FlatList, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMemorial } from '@/src/hooks/funerary/useMemorial';
import { PetMemorialPost } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { Heart, Feather, Plus, Calendar } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

export default function MemorialScreen() {
    const { theme } = useTheme();
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { posts, isLoadingPosts, router } = useMemorial(petId);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderPost = ({ item }: { item: PetMemorialPost }) => (
        <View style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.postHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.secondary + '20' }]}>
                    <Feather size={18} color={theme.secondary} />
                </View>
                <View style={styles.postMeta}>
                    <Text style={[styles.postAuthor, { color: theme.text }]}>
                        Mensaje de cariño
                    </Text>
                    <View style={styles.dateRow}>
                        <Calendar size={12} color={theme.textMuted} />
                        <Text style={[styles.postDate, { color: theme.textMuted }]}>
                            {formatDate(item.created_at)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Text style={[styles.postMessage, { color: theme.text }]}>
                {item.message}
            </Text>

            {!!item.photo_url && /^https?:\/\//i.test(item.photo_url) && (
                <Image
                    source={{ uri: item.photo_url }}
                    accessibilityLabel="Foto del recuerdo"
                    style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: spacing.lg, backgroundColor: theme.border }}
                    resizeMode="cover"
                />
            )}

            <View style={styles.postFooter}>
                <Heart size={14} color={theme.secondary} />
                <Text style={[styles.footerText, { color: theme.textMuted }]}>
                    En memoria
                </Text>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Memorial"
                subtitle="Recuerdos y mensajes de amor"
                actionIcon={Plus}
                onAction={() => router.push({ pathname: '/funeraria/memorial/nuevo', params: { petId } } as any)}
            />

            {isLoadingPosts ? (
                <LoadingOverlay message="Cargando memorial..." />
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<AppRefreshControl />}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Heart size={32} color={theme.textMuted} />}
                            title="Aún no hay mensajes"
                            subtitle="Sé el primero en compartir un recuerdo."
                            actionLabel="Escribir mensaje"
                            onAction={() => router.push({ pathname: '/funeraria/memorial/nuevo', params: { petId } } as any)}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xl,
        paddingBottom: 100,
    },
    postCard: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postMeta: {
        flex: 1,
    },
    postAuthor: {
        fontSize: font.lg,
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xxs,
    },
    postDate: {
        fontSize: font.md,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginBottom: spacing.lg,
    },
    postMessage: {
        fontSize: font.lg,
        lineHeight: 24,
        fontStyle: 'italic',
        marginBottom: spacing.lg,
    },
    postFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    footerText: {
        fontSize: font.md,
        fontWeight: '600',
    },
});
