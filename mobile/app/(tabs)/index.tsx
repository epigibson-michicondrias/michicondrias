import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Bell, Handshake, XCircle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useHome, STATUS_COLORS, STATUS_LABELS, formatDate } from '@/src/hooks/home/useHome';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SectionHeader from '@/src/components/SectionHeader';
import ListRow from '@/src/components/ListRow';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import GettingStartedCard from '@/src/components/GettingStartedCard';
import { ShortcutGrid, PetCarousel, AppointmentList, type Shortcut } from '@/src/features/home/HomeSections';
import { layout, spacing } from '@/constants/design';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const {
    user, pets, petsLoading, upcomingAppointments, appointmentsLoading, unreadNotifications,
    actions, roleTools, panelTitle, proOnboarding, handleAction, router,
  } = useHome();

  const firstName = user?.full_name?.split(' ')[0] || 'Michilover';
  const petsLabel = petsLoading ? '' : pets.length === 0 ? 'Registra a tu primera mascota' : `${pets.length} ${pets.length === 1 ? 'mascota' : 'mascotas'}`;
  const apptsLabel = appointmentsLoading || upcomingAppointments.length === 0 ? '' : ` · ${upcomingAppointments.length} ${upcomingAppointments.length === 1 ? 'cita próxima' : 'citas próximas'}`;

  const toolShortcuts: Shortcut[] = roleTools.map((tool) => ({
    key: tool.id,
    label: tool.label,
    hint: tool.desc,
    icon: tool.icon,
    color: tool.color,
    onPress: () => router.push(tool.route as any),
  }));
  const ownerShortcuts: Shortcut[] = actions.map((a) => ({
    key: a.title,
    label: a.title,
    icon: a.icon,
    color: a.color,
    onPress: () => handleAction(a),
  }));

  return (
    <ScreenContainer>
      <ScreenHeader
        title={`Hola, ${firstName}`}
        subtitle={`${petsLabel}${apptsLabel}` || 'Todo para tu mejor amigo'}
        showBack={false}
        actions={[{
          icon: Bell,
          label: unreadNotifications > 0 ? `Notificaciones, ${unreadNotifications} sin leer` : 'Notificaciones',
          onPress: () => router.push('/notificaciones'),
          badge: unreadNotifications,
        }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<AppRefreshControl />}
        contentContainerStyle={styles.scroll}
      >
        {!petsLoading && pets.length === 0 && roleTools.length === 0 ? (
          <View style={styles.inset}><GettingStartedCard /></View>
        ) : null}

        {/* Alta profesional: solo cuando hay algo que hacer */}
        {proOnboarding !== 'none' ? (
          <View style={styles.inset}>
            <ListRow
              icon={proOnboarding === 'approved' ? Handshake : XCircle}
              color={proOnboarding === 'approved' ? theme.accent : theme.error}
              label={proOnboarding === 'approved' ? 'Identidad aprobada' : 'Verificación rechazada'}
              desc={proOnboarding === 'approved' ? 'Activa tu cuenta profesional ahora' : 'Vuelve a subir tus documentos'}
              onPress={() => router.push(proOnboarding === 'approved' ? '/perfil/partner' : '/perfil/verificacion')}
            />
          </View>
        ) : null}

        {toolShortcuts.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.inset}>
              <SectionHeader title={panelTitle || 'Tu panel'} actionLabel="Ver todas" onAction={() => router.push('/(tabs)/menu')} />
            </View>
            <ShortcutGrid items={toolShortcuts} />
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.inset}>
            <SectionHeader title="Mis mascotas" actionLabel={pets.length > 0 ? 'Ver todas' : undefined} onAction={() => router.push('/mascotas')} />
          </View>
          <PetCarousel
            pets={pets}
            loading={petsLoading}
            onAdd={() => router.push('/mascotas/nuevo')}
            onOpen={(id) => router.push(`/mascotas/${id}`)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.inset}>
            <SectionHeader title={toolShortcuts.length > 0 ? 'Para tu mascota' : 'Atajos'} />
          </View>
          <ShortcutGrid items={ownerShortcuts} />
        </View>

        <View style={styles.section}>
          <View style={styles.inset}>
            <SectionHeader
              title="Próximas citas"
              actionLabel={upcomingAppointments.length > 0 ? 'Ver todas' : undefined}
              onAction={() => router.push('/directorio/citas')}
            />
          </View>
          <AppointmentList
            loading={appointmentsLoading}
            items={upcomingAppointments.map((appt) => ({
              id: appt.id,
              when: formatDate(appt.appointment_date),
              where: [appt.clinic_name || 'Clínica', appt.pet_name].filter(Boolean).join(' · '),
              statusLabel: STATUS_LABELS[appt.status] || appt.status,
              statusColor: STATUS_COLORS[appt.status] || theme.textMuted,
            }))}
            onOpen={() => router.push('/directorio/citas')}
            onBook={() => router.push('/directorio')}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.lg, paddingBottom: spacing.huge, gap: spacing.xl },
  inset: { paddingHorizontal: layout.screenPadding },
  section: { gap: spacing.xs },
});
