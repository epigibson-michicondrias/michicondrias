import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Themed';
import { useAuth } from '../../src/contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';
import { LogOut, User, Shield, Bell, HelpCircle, Sun, Moon, Monitor, PawPrint, ChevronRight, Edit3, Calendar, CreditCard, ClipboardList } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, colorScheme } = useTheme();
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.background]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={[styles.profileHeader, { paddingTop: insets.top + 20 }]}>
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={StyleSheet.absoluteFillObject}
            />
            
            <View style={styles.headerTopRow}>
                <View style={[styles.avatarBorder, { borderColor: theme.primary + '40' }]}>
                    <View style={[styles.avatarInner, { backgroundColor: theme.primary + '15' }]}>
                        <Text style={[styles.avatarEmoji, { color: theme.text }]}>
                            {user?.full_name?.[0]?.toUpperCase() || '👤'}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.userMainInfo}>
                    <Text style={styles.userName}>{user?.full_name || 'Nombre no disponible'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'Email no disponible'}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: theme.primary + '20' }]}>
                        <Shield size={10} color={theme.primary} />
                        <Text style={[styles.roleText, { color: theme.primary }]}>
                            {user?.role_name?.toUpperCase() || 'CONSUMIDOR'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.editIconBtn}
                    onPress={() => router.push('/perfil' as any)}
                >
                    <Edit3 size={20} color="#fff" />
                </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>GESTIÓN DE CUENTA</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
            <MenuItem 
                icon={<User size={20} color={theme.primary} />} 
                title="Editar Perfil" 
                theme={theme} 
                isFirst 
                onPress={() => router.push('/perfil' as any)}
            />
            <MenuItem
              icon={<PawPrint size={20} color="#ec4899" />}
              title="Gestión de Adopciones"
              theme={theme}
              onPress={() => router.push('/adopciones/mis-publicaciones' as any)}
            />
            <MenuItem 
                icon={<Shield size={20} color="#22c55e" />} 
                title="Seguridad y KYC" 
                theme={theme} 
                onPress={() => router.push('/perfil/verificacion' as any)}
            />
            <MenuItem 
                icon={<Bell size={20} color="#f59e0b" />} 
                title="Notificaciones" 
                theme={theme} 
                isLast 
                onPress={() => router.push('/notificaciones' as any)}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>APARIENCIA</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, padding: 12 }]}>
            <View style={styles.themeToggleContainer}>
              <ThemeOption
                active={themeMode === 'light'}
                icon={<Sun size={18} color={themeMode === 'light' ? '#fff' : theme.textMuted} />}
                label="Claro"
                onPress={() => setThemeMode('light')}
                theme={theme}
              />
              <ThemeOption
                active={themeMode === 'dark'}
                icon={<Moon size={18} color={themeMode === 'dark' ? '#fff' : theme.textMuted} />}
                label="Oscuro"
                onPress={() => setThemeMode('dark')}
                theme={theme}
              />
              <ThemeOption
                active={themeMode === 'system'}
                icon={<Monitor size={18} color={themeMode === 'system' ? '#fff' : theme.textMuted} />}
                label="Sistema"
                onPress={() => setThemeMode('system')}
                theme={theme}
              />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>MI ACTIVIDAD</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
            <MenuItem 
                icon={<PawPrint size={20} color="#7c3aed" />} 
                title="Mis Mascotas" 
                theme={theme} 
                isFirst 
                onPress={() => router.push('/mascotas' as any)}
            />
            <MenuItem 
                icon={<Calendar size={20} color="#10b981" />} 
                title="Mis Citas" 
                theme={theme} 
                onPress={() => router.push('/directorio/citas' as any)}
            />
            <MenuItem 
                icon={<CreditCard size={20} color="#f59e0b" />} 
                title="Mis Compras" 
                theme={theme} 
                onPress={() => router.push('/tienda/compras' as any)}
            />
            <MenuItem 
                icon={<ClipboardList size={20} color="#3b82f6" />} 
                title="Carnet de Salud" 
                theme={theme} 
                isLast 
                onPress={() => router.push('/carnet' as any)}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textMuted, marginTop: 24 }]}>SOPORTE Y LEGAL</Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
            <MenuItem 
                icon={<HelpCircle size={20} color={theme.textMuted} />} 
                title="Ayuda y Soporte" 
                theme={theme} 
                isFirst 
            />
            <MenuItem 
                icon={<Shield size={20} color={theme.textMuted} />} 
                title="Privacidad y Términos" 
                theme={theme} 
                isLast 
            />
          </View>
          
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.surface }]} onPress={signOut}>
            <View style={styles.logoutIconBox}>
                <LogOut size={20} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
          </TouchableOpacity>

          <Text style={[styles.version, { color: theme.textMuted }]}>
            Michicondrias Mobile v2.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
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
      activeOpacity={0.7}
    >
      <View style={styles.menuIconBox}>{icon}</View>
      <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
      <ChevronRight size={18} color={theme.textMuted} opacity={0.5} />
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  profileHeader: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  glassCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
    fontWeight: '900',
  },
  userMainInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  editIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 1.5,
  },
  sectionCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    padding: 12,
    paddingRight: 24,
    borderRadius: 24,
    gap: 16,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '900',
  },
  version: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.4,
  }
});
