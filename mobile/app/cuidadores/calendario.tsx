import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitterCalendar, MONTHS_ES, DAYS_ES, STATUS_COLORS } from '@/src/hooks/cuidadores/useSitterCalendar';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

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
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Calendario" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Month Navigator */}
        <View style={[styles.monthNav, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {MONTHS_ES[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
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
              <TouchableOpacity
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
                  { color: isSelected ? '#fff' : theme.text },
                ]}>
                  {day}
                </Text>
                {dayRequests.length > 0 && (
                  <View style={[
                    styles.dot,
                    { backgroundColor: isSelected ? '#fff' : theme.primary },
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
                <TouchableOpacity
                  key={req.id}
                  style={[styles.requestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => showAlert({
                    type: 'info',
                    title: 'Detalle del Servicio',
                    message: `Mascota: ${req.pet_id}\nTipo: ${req.service_type}\nDesde: ${req.start_date.substring(0, 10)}\nHasta: ${req.end_date.substring(0, 10)}\nEstado: ${st.label}`,
                  })}
                >
                  <View style={styles.reqTop}>
                    <Text style={[styles.reqId, { color: theme.text }]}>Cuidado #{req.id.substring(0, 6).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                    </View>
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
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 16, fontWeight: '800' },
  dayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 14, fontWeight: '600' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  requestsSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, fontWeight: '600' },
  requestCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  reqTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reqId: { fontSize: 14, fontWeight: '800' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  reqDetails: { gap: 6 },
  reqDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqDetailText: { fontSize: 13 },
  reqPrice: { fontSize: 16, fontWeight: '800', marginTop: 10 },
});
