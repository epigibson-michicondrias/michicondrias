/**
 * Piezas de las pantallas de detalle con foto (producto, mascota en adopción, reporte de perdida):
 *
 *   <ScreenContainer>
 *     <ScrollView>
 *       <DetailPhoto images={[url]} fallbackIcon={PawPrint} />
 *       …contenido (el texto va DEBAJO de la foto, nunca encima)…
 *     </ScrollView>
 *     <DetailFooter><Button … /></DetailFooter>   // una sola acción principal
 *     <DetailTopBar onBack={goBack} actions={…} />  // al final: flota fijo sobre todo
 *   </ScreenContainer>
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import BackButton from '@/src/components/BackButton';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, radius, shadow, spacing, type } from '@/constants/design';

/** Alto de la foto: cuadrada en teléfono, con tope en pantallas anchas. */
export function useDetailPhotoHeight(max = 360) {
    const { width } = useWindowDimensions();
    return Math.min(width, max);
}

interface DetailPhotoProps {
    /** Una o varias fotos (con varias se desliza y muestra puntos). */
    images: (string | null | undefined)[];
    fallbackIcon: IconComponent;
    fallbackLabel?: string;
    /** `contain` para productos (se ve completo), `cover` para mascotas. */
    resizeMode?: 'cover' | 'contain';
    accessibilityLabel?: string;
}

export function DetailPhoto({ images, fallbackIcon: Fallback, fallbackLabel, resizeMode = 'cover', accessibilityLabel }: DetailPhotoProps) {
    const { theme } = useTheme();
    const { width } = useWindowDimensions();
    const height = useDetailPhotoHeight();
    const [page, setPage] = useState(0);
    const uris = images.filter((u): u is string => !!u);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = Math.round(e.nativeEvent.contentOffset.x / width);
        if (next !== page) setPage(next);
    };

    return (
        <View style={[styles.photo, { height, backgroundColor: theme.backgroundSecondary }]}>
            {uris.length === 0 ? (
                <>
                    <Fallback size={layout.icon.xl * 2} color={theme.textMuted} strokeWidth={1.25} />
                    {fallbackLabel ? <Text style={[type.caption, { color: theme.textMuted }]}>{fallbackLabel}</Text> : null}
                </>
            ) : uris.length === 1 ? (
                <Image source={{ uri: uris[0] }} style={styles.image} resizeMode={resizeMode} accessibilityLabel={accessibilityLabel} />
            ) : (
                <>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={32}>
                        {uris.map((uri, i) => (
                            <Image
                                key={`${uri}-${i}`}
                                source={{ uri }}
                                style={{ width, height }}
                                resizeMode={resizeMode}
                                accessibilityLabel={accessibilityLabel ? `${accessibilityLabel}, foto ${i + 1} de ${uris.length}` : undefined}
                            />
                        ))}
                    </ScrollView>
                    <View style={styles.dots} pointerEvents="none">
                        {uris.map((uri, i) => (
                            <View
                                key={`${uri}-dot-${i}`}
                                style={[styles.dot, { backgroundColor: i === page ? theme.onPrimary : theme.onPrimary + '80' }, i === page && styles.dotActive]}
                            />
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}

interface DetailTopBarProps {
    onBack: () => void;
    /** Botones de la derecha (`IconButton variant="surface" size="sm"`). */
    actions?: React.ReactNode;
}

/** Volver y acciones, flotando fijos en la safe area: no se van con el scroll. Va al final de la pantalla. */
export function DetailTopBar({ onBack, actions }: DetailTopBarProps) {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
            <BackButton onPress={onBack} variant="surface" size="sm" />
            {actions ? <View style={styles.topActions}>{actions}</View> : null}
        </View>
    );
}

/** Barra inferior fija con la acción principal, respetando la safe area. */
export function DetailFooter({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.surface, paddingBottom: insets.bottom + spacing.md }]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    photo: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderBottomLeftRadius: radius.xxl,
        borderBottomRightRadius: radius.xxl,
        overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    dots: {
        position: 'absolute',
        bottom: spacing.md,
        flexDirection: 'row',
        alignSelf: 'center',
        gap: spacing.xs,
    },
    dot: { width: spacing.sm - 2, height: spacing.sm - 2, borderRadius: radius.pill },
    dotActive: { width: spacing.lg },
    topBar: {
        position: 'absolute',
        left: layout.screenPadding,
        right: layout.screenPadding,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    topActions: { flexDirection: 'row', gap: spacing.sm },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        ...shadow.raised,
    },
});
