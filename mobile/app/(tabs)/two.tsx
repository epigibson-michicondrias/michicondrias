import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { LogOut, User, Shield, Bell, HelpCircle, Sun, Moon, Monitor, RefreshCw, Cpu, Globe, Database, PawPrint } from 'lucide-react-native';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { themeMode, setThemeMode, colorScheme } = useTheme();
  const theme = Colors[colorScheme];

  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdateCheck, setLastUpdateCheck] = useState<string | null>(null);

  const onCheckUpdates = async () => {
    if (__DEV__) {
      Alert.alert("Modo Desarrollo", "Las actualizaciones OTA están desactivadas en desarrollo.");
      return;
    }

    setIsChecking(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          "¡Actualización disponible!",
          "Se ha encontrado una nueva versión. ¿Quieres descargarla ahora?",
          [
            { text: "Más tarde", style: "cancel" },
            {
              text: "Actualizar 🚀",
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (e) {
                  Alert.alert("Error", `No se pudo descargar: ${e instanceof Error ? e.message : String(e)}`);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert("Todo al día", "Ya tienes la última versión instalada. ✨");
      }
      setLastUpdateCheck(new Date().toLocaleTimeString());
    } catch (error: any) {
      Alert.alert(
        "Error de Actualización",
        `Mensaje: ${error.message}\n\n` +
        `Canal Nativo: ${(Updates as any).channel || 'N/A'}\n` +
        `Canal Config: ${(Constants.expoConfig?.updates as any)?.channel || 'Not Set'}\n` +
        `Runtime: ${Updates.runtimeVersion}`
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={[styles.avatarPlaceholder, { borderColor: theme.primary }]}>
          <Text style={[styles.avatarEmoji, { color: theme.text }]}>{user?.full_name?.[0] || '👤'}</Text>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{user?.full_name || 'Nombre no disponible'}</Text>
        <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user?.email || 'Email no disponible'}</Text>
        <View style={{ backgroundColor: theme.primary + '15', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 }}>
          <Text style={{ color: theme.primary, fontSize: 10, fontWeight: '800' }}>{user?.role_name?.toUpperCase() || 'CONSUMIDOR'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>CUENTA</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <MenuItem icon={<User size={20} color={theme.primary} />} title="Editar Perfil" theme={theme} isFirst />
          <MenuItem
            icon={<PawPrint size={20} color="#ec4899" />}
            title="Gestión de Adopciones"
            theme={theme}
            onPress={() => router.push('/adopciones/mis-publicaciones')}
          />
          <MenuItem icon={<Shield size={20} color="#22c55e" />} title="Seguridad y KYC" theme={theme} />
          <MenuItem icon={<Bell size={20} color="#f59e0b" />} title="Notificaciones" theme={theme} isLast />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>APARIENCIA</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, padding: 16 }]}>
          <View style={styles.themeToggleContainer}>
            <ThemeOption
              active={themeMode === 'light'}
              icon={<Sun size={20} color={themeMode === 'light' ? '#fff' : theme.textMuted} />}
              label="Claro"
              onPress={() => setThemeMode('light')}
              theme={theme}
            />
            <ThemeOption
              active={themeMode === 'dark'}
              icon={<Moon size={20} color={themeMode === 'dark' ? '#fff' : theme.textMuted} />}
              label="Oscuro"
              onPress={() => setThemeMode('dark')}
              theme={theme}
            />
            <ThemeOption
              active={themeMode === 'system'}
              icon={<Monitor size={20} color={themeMode === 'system' ? '#fff' : theme.textMuted} />}
              label="Sistema"
              onPress={() => setThemeMode('system')}
              theme={theme}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>SISTEMA Y ACTUALIZACIONES</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, padding: 20 }]}>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Globe size={18} color={theme.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Native Channel / Config Channel</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{(Updates as any).channel || 'N/A'} / {(Constants.expoConfig?.updates as any)?.channel || 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Cpu size={18} color={theme.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Project ID (EAS)</Text>
              <Text style={[styles.infoValue, { color: theme.text, fontSize: 10 }]}>{Constants.expoConfig?.extra?.eas?.projectId || 'Not Found'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginTop: 16 }]}>
            <View style={styles.infoIconBox}>
              <Database size={18} color={theme.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Update ID / Runtime</Text>
              <Text style={[styles.infoValue, { color: theme.text, fontSize: 10 }]}>{Updates.updateId || 'Embedded'} / {Updates.runtimeVersion}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, { backgroundColor: theme.primary }]}
            onPress={onCheckUpdates}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={18} color="#fff" />
            )}
            <Text style={styles.updateBtnText}>
              {isChecking ? "Verificando..." : "Buscar actualizaciones"}
            </Text>
          </TouchableOpacity>
          {lastUpdateCheck && (
            <Text style={[styles.lastCheck, { color: theme.textMuted }]}>
              Última verificación: {lastUpdateCheck}
            </Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>SOPORTE</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <MenuItem icon={<HelpCircle size={20} color={theme.textMuted} />} title="Ayuda y Soporte" theme={theme} isFirst isLast />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <LogOut size={22} color="#ef4444" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: theme.textMuted }]}>Michicondrias Mobile v1.1.5 (Adoptions Parity)</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, title, theme, isFirst, isLast, onPress }: { icon: any, title: string, theme: any, isFirst?: boolean, isLast?: boolean, onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.menuIconBox}>{icon}</View>
      <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
      <Text style={{ fontSize: 24, fontWeight: '300', color: '#555' }}>›</Text>
    </TouchableOpacity>
  );
}

function ThemeOption({ active, icon, label, onPress, theme }: { active: boolean, icon: any, label: string, onPress: () => void, theme: any }) {
  return (
    <TouchableOpacity
      style={[
        styles.themeOption,
        active ? { backgroundColor: theme.primary } : { backgroundColor: theme.background + '40' }
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.themeLabel, { color: active ? '#fff' : theme.textMuted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginLeft: 8,
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  menuIconBox: {
    width: 32,
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 6,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  lastCheck: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 8,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
    marginTop: 40,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 40,
    fontSize: 11,
    fontWeight: '600',
  }
});
