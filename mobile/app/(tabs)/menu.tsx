import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wrench } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useMenu } from '@/src/hooks/home/useMenu';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import { spacing, type, layout } from '@/constants/design';
import type { RoleTool } from '@/src/constants/roleTools';

/** Herramientas: el trabajo del rol profesional o de administración. Solo visible para pro/admin. */
export default function MenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { title, subtitle, mainTools, moreTools } = useMenu();

    const renderTool = (tool: RoleTool) => (
        <ListRow
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            desc={tool.desc}
            color={tool.color}
            onPress={() => router.push(tool.route as any)}
        />
    );

    return (
        <ScreenContainer>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
            >
                <View>
                    <Text accessibilityRole="header" style={[type.h1, { color: theme.text }]}>{title}</Text>
                    <Text style={[type.body, { color: theme.textMuted }]}>{subtitle}</Text>
                </View>

                {mainTools.length === 0 && moreTools.length === 0 ? (
                    <EmptyState
                        icon={<Wrench size={layout.icon.xl} color={theme.textMuted} />}
                        title="Sin herramientas"
                        subtitle="Tu rol todavía no tiene herramientas en la app."
                    />
                ) : (
                    <>
                        <View style={styles.rows}>{mainTools.map(renderTool)}</View>
                        {moreTools.length > 0 && (
                            <View style={styles.section}>
                                <SectionHeader overline title="Más herramientas" />
                                <View style={styles.rows}>{moreTools.map(renderTool)}</View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.huge * 2,
        gap: spacing.xl,
    },
    section: {
        gap: spacing.md,
    },
    rows: {
        gap: spacing.sm,
    },
});
