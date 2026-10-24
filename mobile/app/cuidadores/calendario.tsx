import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitterCalendar, MONTHS_ES, DAYS_ES, STATUS_COLORS } from '@/src/hooks/cuidadores/useSitterCalendar';
import StatusBadge from '@/src/features/servicios-pro/StatusBadge';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { font, spacing, layout } from '@/constants/design';

export default function CuidadoresCalendarioScreen() {
  const { theme } = useTheme();
  const {
    today,
    currentMonth,
    currentYear,
    selectedDay,
    setSelectedDay,
    calendarDays,
    requestsByDate,
    selectedRequests,
    isLoading,
    prevMonth,
    nextMonth,
  } = useSitterCalendar();

  if (isLoading) {
    return (
      <ScreenContainer>
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Calendario" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.huge }}>
        {/* Month Navigator */}
        <View style={[styles.monthNav, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity accessibilityRole="button" onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {MONTHS_ES[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity accessibilityRole="button" onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {DAYS_ES.map((day) => (
            <Text key={day} style={[styles.dayHeaderText, { color: theme.textMuted }]}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <View key={`empty-${idx}`} style={styles.dayCell} />;
            }
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayRequests = requestsByDate[dateKey] || [];
            const isSelected = selectedDay === day;
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            return (
              <TouchableOpacity accessibilityRole="button"
                key={`day-${day}`}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: theme.primary, borderRadius: 12 },
                  isToday && !isSelected && { borderWidth: 1.5, borderColor: theme.primary, borderRadius: 12 },
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  { color: isSelected ? theme.onPrimary : theme.text },
                ]}>
                  {day}
                </Text>
                {dayRequests.length > 0 && (
                  <View style={[
                    styles.dot,
                    { backgroundColor: isSelected ? theme.onPrimary : theme.primary },
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Day Requests */}
        <View style={styles.requestsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedDay
              ? `${selectedDay} de ${MONTHS_ES[currentMonth]} — ${selectedRequests.length} servicio(s)`
              : 'Selecciona un día'}
          </Text>

          {selectedRequests.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {selectedDay ? 'Sin servicios este día' : 'Toca un día del calendario'}
              </Text>
            </View>
          ) : (
            selectedRequests.map((req) => {
              const st = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
              const isMultiDay = req.start_date.substring(0, 10) !== req.end_date.substring(0, 10);
              return (
                <TouchableOpacity accessibilityRole="button"
                  key={req.id}
                  style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => showAlert({
                    type: 'info',
                    title: 'Detalle del Servicio',
                    message: `Mascota: ${req.pet_name || "—"}\nTipo: ${req.service_type}\nDesde: ${req.start_date.substring(0, 10)}\nHasta: ${req.end_date.substring(0, 10)}\nEstado: ${st.label}`,
                  })}
                >
                  <View style={styles.reqTop}>
                    <Text style={[styles.reqId, { color: theme.text }]}>{req.pet_name || 'Cuidado'}</Text>
                    <StatusBadge status={req.status} />
                  </View>
                  <View style={styles.reqDetails}>
                    <View style={styles.reqDetailRow}>
                      <Clock size={14} color={theme.textMuted} />
                      <Text style={[styles.reqDetailText, { color: theme.textMuted }]}>
                        {isMultiDay
                          ? `${req.start_date.substring(0, 10)} → ${req.end_date.substring(0, 10)}`
                          : req.start_date.substring(0, 10)
                        }
                      </Text>
                    </View>
                    {req.address && (
                      <View style={styles.reqDetailRow}>
                        <MapPin size={14} color={theme.textMuted} />
                        <Text style={[styles.reqDetailText, { color: theme.textMuted }]} numberOfLines={1}>
                          {req.address}
                        </Text>
                      </View>
                    )}
                  </View>
                  {req.total_price != null && (
                    <Text style={[styles.reqPrice, { color: theme.primary }]}>${req.total_price}</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: font.xl, fontWeight: '800' },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.md,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: font.base, fontWeight: '600' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: spacing.xs,
  },
  requestsSection: {
    paddingHorizontal: layout.screenPadding,
    marginTop: spacing.xxl,
  },
  sectionTitle: { fontSize: font.xl, fontWeight: '800', marginBottom: spacing.md },
  emptyCard: {
    padding: spacing.xxl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: font.base, fontWeight: '600' },
  requestCard: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reqId: { fontSize: font.base, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 10,
  },
  statusText: { fontSize: font.sm, fontWeight: '700' },
  reqDetails: { gap: spacing.sm },
  reqDetailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reqDetailText: { fontSize: font.base },
  reqPrice: { fontSize: font.xl, fontWeight: '800', marginTop: spacing.md },
});
