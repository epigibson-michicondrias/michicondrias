import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMenu } from '@/src/hooks/home';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogOut, ChevronRight, Crown } from 'lucide-react-native';

export default function MenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const {
        user,
        isUserAdmin,
        allSections,
        bannerProps,
        handleSignOut,
    } = useMenu();

    // ── Header ───────────────────────────────────────────────────────
    const renderHeader = () => (
        <LinearGradient
            colors={[theme.primary, theme.primary + 'EE', theme.primary + 'CC']}
            style={[styles.premiumHeader, { paddingTop: insets.top + 20 }]}
        >
            <View style={styles.profileRow}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarGlass}>
                        <Text style={styles.avatarText}>
                            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                    </View>
                    {isUserAdmin && (
                        <View style={styles.adminBadge}>
                            <Crown size={10} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.profileMasterInfo}>
                    <Text style={styles.welcomeText}>¡Hola!</Text>
                    <Text style={styles.profileName}>{user?.full_name || 'Explorador'}</Text>
                    <View style={[styles.roleLabel, { backgroundColor: isUserAdmin ? '#f59e0b40' : 'rgba(255,255,255,0.15)' }]}>
                        <Text style={[styles.roleText, { color: isUserAdmin ? '#fcd34d' : '#fff' }]}>
                            {isUserAdmin ? 'Administrador' : user?.role_name || 'Usuario'}
                        </Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );

    // ── Role-based quick-access banner ───────────────────────────────
    const renderBanner = () => {
        if (!bannerProps) return null;
        const BannerIcon = bannerProps.icon;

        return (
            <View style={styles.adminQuickAccess}>
                <TouchableOpacity
                    style={[styles.adminBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => router.push(bannerProps.route as any)}
                >
                    <LinearGradient
                        colors={bannerProps.colors}
                        style={styles.absGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.bannerIcon}>
                        <BannerIcon size={24} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bannerTitle}>{bannerProps.title}</Text>
                        <Text style={styles.bannerSub}>{bannerProps.sub}</Text>
                    </View>
                    <ChevronRight size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    };

    // ── Menu item ────────────────────────────────────────────────────
    const renderMenuItem = (item: any) => {
        const ItemIcon = item.icon;
        return (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(item.route as any)}
            >
                <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
                    <ItemIcon size={20} color={item.color} />
                </View>
                <View style={styles.menuInfo}>
                    <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                    <Text style={[styles.menuDesc, { color: theme.textMuted }]} numberOfLines={1}>{item.desc}</Text>
                </View>
                <ChevronRight size={16} color={theme.textMuted} />
            </TouchableOpacity>
        );
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <ScreenContainer>
            <StatusBar barStyle="light-content" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {renderHeader()}

                <View style={styles.content}>
                    {renderBanner()}

                    {allSections.map((section, idx) => {
                        const SectionIcon = section.icon;
                        return (
                            <View key={idx} style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    {SectionIcon && <SectionIcon size={16} color={theme.textMuted} />}
                                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{section.title.toUpperCase()}</Text>
                                </View>
                                <View style={styles.grid}>
                                    {section.data.map(renderMenuItem)}
                                </View>
                            </View>
                        );
                    })}

                    <TouchableOpacity
                        style={[styles.logoutBtn, { borderColor: theme.border }]}
                        onPress={handleSignOut}
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textMuted }]}>Michicondrias Mobile v2.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    premiumHeader: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatarContainer: { position: 'relative' },
    avatarGlass: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
    adminBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#f59e0b',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileMasterInfo: { flex: 1 },
    welcomeText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
    profileName: { fontSize: 24, fontWeight: '900', color: '#fff' },
    roleLabel: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    content: { padding: 24, marginTop: -20 },
    adminQuickAccess: { marginBottom: 32 },
    adminBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        overflow: 'hidden',
        gap: 16,
        elevation: 8,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    absGradient: { ...StyleSheet.absoluteFillObject },
    bannerIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
    bannerSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingHorizontal: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
    grid: { gap: 12 },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    menuIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    menuInfo: { flex: 1 },
    menuLabel: { fontSize: 16, fontWeight: '800' },
    menuDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        gap: 12,
        marginTop: 12,
    },
    logoutText: { fontSize: 16, fontWeight: '900', color: '#ef4444' },
    footer: { paddingVertical: 40, alignItems: 'center' },
    footerText: { fontSize: 11, fontWeight: '600', opacity: 0.5, marginBottom: 4 },
});
