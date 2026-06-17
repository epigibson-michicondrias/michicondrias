import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMemorial } from '@/src/hooks/funerary/useMemorial';
import { PetMemorialPost } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Heart, Feather, Plus, Calendar } from 'lucide-react-native';

export default function MemorialScreen() {
    const { theme } = useTheme();
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const { posts, isLoadingPosts, refetchPosts, router } = useMemorial(petId);

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
                        {item.user_id.slice(0, 8)}...
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
                title="🕊️ Memorial"
                subtitle="Recuerdos y mensajes de amor"
                gradient={['#4a1a6b', '#7c3aed', '#a855f7']}
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
                    onRefresh={refetchPosts}
                    refreshing={isLoadingPosts}
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
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 100,
    },
    postCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
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
        fontSize: 15,
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    postDate: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginBottom: 14,
    },
    postMessage: {
        fontSize: 15,
        lineHeight: 24,
        fontStyle: 'italic',
        marginBottom: 14,
    },
    postFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
