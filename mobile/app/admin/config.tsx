import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Settings, ShieldCheck, Zap, Globe, Bell, Database, HardDrive, Cpu, Cloud, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemService, SystemSettings } from '@/src/services/system';
import { Alert, ActivityIndicator } from 'react-native';

export default function AdminConfigScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['admin-system-settings'],
        queryFn: systemService.getSettings,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<SystemSettings>) => systemService.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
        },
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const syncMutation = useMutation({
        mutationFn: systemService.syncDatabase,
        onSuccess: (data) => Alert.alert("Éxito", data.message || "Sincronización completada."),
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    const cacheMutation = useMutation({
        mutationFn: systemService.clearCache,
        onSuccess: (data) => Alert.alert("Éxito", data.message || "Caché global limpiada."),
        onError: (error: any) => Alert.alert("Error", error.message)
    });

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const currentSettings = settings || {
        maintenance_mode: false,
        debug_mode: false,
        ota_updates_enabled: true,
        push_notifications_enabled: true,
    } as SystemSettings;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={['#64748b', '#64748bE6', '#64748bCC']}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Configuración</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Parámetros de Sistema</Text>
                        </View>
                    </View>
                    <View style={styles.headerAction}>
                        <Settings size={22} color="#fff" style={{ opacity: 0.8 }} />
                    </View>
                </View>
            </LinearGradient>

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
                            onToggle={() => updateMutation.mutate({ maintenance_mode: !currentSettings.maintenance_mode })}
                            theme={theme}
                        />
                        <ConfigRow
                            icon={Zap}
                            label="Modo Debug"
                            desc="Habilitar logs detallados"
                            value={currentSettings.debug_mode}
                            onToggle={() => updateMutation.mutate({ debug_mode: !currentSettings.debug_mode })}
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
                            onToggle={() => updateMutation.mutate({ ota_updates_enabled: !currentSettings.ota_updates_enabled })}
                            theme={theme}
                        />
                        <ConfigRow
                            icon={Bell}
                            label="Push Notifications"
                            desc="Servicio de mensajería Firebase"
                            value={currentSettings.push_notifications_enabled}
                            onToggle={() => updateMutation.mutate({ push_notifications_enabled: !currentSettings.push_notifications_enabled })}
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
                            onPress={() => syncMutation.mutate()}
                            loading={syncMutation.isPending}
                        />
                        <ActionRow 
                            icon={HardDrive} 
                            label="Limpiar Caché Global" 
                            theme={theme} 
                            color="#ef4444" 
                            isLast 
                            onPress={() => cacheMutation.mutate()}
                            loading={cacheMutation.isPending}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
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
    container: { flex: 1 },
    header: { 
        paddingHorizontal: 24, 
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    headerAction: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#fff', 
        letterSpacing: -0.5 
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    liveDot: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        backgroundColor: '#10b981' 
    },
    subtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.8)',
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
