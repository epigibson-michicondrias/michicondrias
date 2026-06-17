import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminConfig } from '@/src/hooks/admin/useAdminConfig';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { ChevronLeft, Settings, ShieldCheck, Zap, Globe, Bell, Database, HardDrive, Cpu, Cloud, Lock } from 'lucide-react-native';

export default function AdminConfigScreen() {
    const { theme } = useTheme();
    const {
        currentSettings,
        isLoading,
        toggleSetting,
        syncDatabase,
        clearCache,
        isSyncing,
        isClearing,
    } = useAdminConfig();

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Configuración"
                gradient={['#64748b', '#64748bE6', '#64748bCC']}
                rightElement={
                    <View style={styles.headerAction}>
                        <Settings size={22} color="#fff" style={{ opacity: 0.8 }} />
                    </View>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Cpu size={14} color={theme.textMuted} />
                        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ESTADO GLOBAL</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <ConfigRow
                            icon={ShieldCheck}
                            label="Modo Mantenimiento"
                            desc="Desactiva el acceso a la app"
                            value={currentSettings.maintenance_mode}
                            onToggle={() => toggleSetting('maintenance_mode')}
                            theme={theme}
                        />
                        <ConfigRow
                            icon={Zap}
                            label="Modo Debug"
                            desc="Habilitar logs detallados"
                            value={currentSettings.debug_mode}
                            onToggle={() => toggleSetting('debug_mode')}
                            theme={theme}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Cloud size={14} color={theme.textMuted} />
                        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>INFRAESTRUCTURA</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <ConfigRow
                            icon={Globe}
                            label="Updates OTA"
                            desc="Actualizaciones automáticas"
                            value={currentSettings.ota_updates_enabled}
                            onToggle={() => toggleSetting('ota_updates_enabled')}
                            theme={theme}
                        />
                        <ConfigRow
                            icon={Bell}
                            label="Push Notifications"
                            desc="Servicio de mensajería Firebase"
                            value={currentSettings.push_notifications_enabled}
                            onToggle={() => toggleSetting('push_notifications_enabled')}
                            theme={theme}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Lock size={14} color={theme.textMuted} />
                        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>BACKEND & DATA</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <ActionRow 
                            icon={Database} 
                            label="Sync Base de Datos" 
                            theme={theme} 
                            onPress={syncDatabase}
                            loading={isSyncing}
                        />
                        <ActionRow 
                            icon={HardDrive} 
                            label="Limpiar Caché Global" 
                            theme={theme} 
                            color="#ef4444" 
                            isLast 
                            onPress={clearCache}
                            loading={isClearing}
                        />
                    </View>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

function ConfigRow({ icon: Icon, label, desc, value, onToggle, theme, isLast }: any) {
    return (
        <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Icon size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
                <Text style={[styles.rowDesc, { color: theme.textMuted }]}>{desc}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#334155', true: theme.primary }}
                thumbColor="#f8fafc"
            />
        </View>
    );
}

function ActionRow({ icon: Icon, label, theme, color, isLast, onPress, loading }: any) {
    return (
        <TouchableOpacity 
            style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={loading}
        >
            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                {loading ? <ActivityIndicator size="small" color={color || theme.text} /> : <Icon size={20} color={color || theme.text} />}
            </View>
            <Text style={[styles.rowLabel, { color: color || theme.text, flex: 1 }]}>{label}</Text>
            <ChevronLeft size={18} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAction: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: { 
        padding: 20, 
        paddingBottom: 60, 
        paddingTop: 12,
        gap: 24 
    },
    section: { gap: 16 },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10, 
        marginLeft: 8 
    },
    sectionTitle: { 
        fontSize: 11, 
        fontWeight: '900', 
        letterSpacing: 1.2 
    },
    card: { 
        borderRadius: 28, 
        overflow: 'hidden', 
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20, 
        gap: 16 
    },
    iconBox: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    rowLabel: { 
        fontSize: 15, 
        fontWeight: '800' 
    },
    rowDesc: { 
        fontSize: 12, 
        marginTop: 2, 
        fontWeight: '600' 
    },
});
