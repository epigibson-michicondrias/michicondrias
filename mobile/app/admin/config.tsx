import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Settings, ShieldCheck, Zap, Globe, Bell, Database, HardDrive } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function AdminConfigScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [settings, setSettings] = React.useState({
        maintenance: false,
        debug: true,
        updates: true,
        notifications: true,
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Configuración del Sistema</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ESTADO GLOBAL</Text>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <ConfigRow
                            icon={ShieldCheck}
                            label="Modo Mantenimiento"
                            desc="Desactiva el acceso a la app"
                            value={settings.maintenance}
                            onToggle={() => toggle('maintenance')}
                            theme={theme}
                        />
                        <ConfigRow
                            icon={Zap}
                            label="Modo Debug"
                            desc="Habilitar logs detallados"
                            value={settings.debug}
                            onToggle={() => toggle('debug')}
                            theme={theme}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>INFRAESTRUCTURA</Text>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <ConfigRow
                            icon={Globe}
                            label="Updates OTA"
                            desc="Actualizaciones automáticas"
                            value={settings.updates}
                            onToggle={() => toggle('updates')}
                            theme={theme}
                        />
                        <ConfigRow
                            icon={Bell}
                            label="Push Notifications"
                            desc="Servicio de mensajería Firebase"
                            value={settings.notifications}
                            onToggle={() => toggle('notifications')}
                            theme={theme}
                            isLast
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>BACKEND & DATA</Text>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        <ActionRow icon={Database} label="Sync Base de Datos" theme={theme} />
                        <ActionRow icon={HardDrive} label="Limpiar Caché Global" theme={theme} color="#ef4444" isLast />
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

function ActionRow({ icon: Icon, label, theme, color, isLast }: any) {
    return (
        <TouchableOpacity style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                <Icon size={20} color={color || theme.text} />
            </View>
            <Text style={[styles.rowLabel, { color: color || theme.text, flex: 1 }]}>{label}</Text>
            <ChevronLeft size={18} color={theme.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
    },
    scroll: {
        padding: 20,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginLeft: 8,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 15,
        fontWeight: '700',
    },
    rowDesc: {
        fontSize: 12,
        marginTop: 2,
    }
});
