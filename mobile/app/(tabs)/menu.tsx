import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Wrench } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useMenu } from '@/src/hooks/home/useMenu';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import { spacing, layout } from '@/constants/design';
import type { RoleTool } from '@/src/constants/roleTools';

/** Herramientas: el trabajo del rol profesional o de administración. Solo visible para pro/admin. */
export default function MenuScreen() {
    const router = useRouter();
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
            <ScreenHeader title={title} subtitle={subtitle} showBack={false} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<AppRefreshControl />}
                contentContainerStyle={styles.content}
            >

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
        paddingTop: spacing.lg,
        paddingBottom: spacing.huge,
        gap: spacing.xl,
    },
    section: {
        gap: spacing.md,
    },
    rows: {
        gap: spacing.sm,
    },
});
