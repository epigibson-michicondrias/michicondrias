"use client";

/**
 * Agendar o reagendar cita: mascota → servicio → fecha → horario → motivo → confirmar.
 * Espejo de `mobile/app/directorio/citas/agendar/[clinic_id].tsx`.
 */
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  MapPin,
  PawPrint,
  Phone,
  Stethoscope,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { useBookAppointment } from "@/hooks/directorio/useBookAppointment";
import { formatCurrency } from "@/utils/formatters";
import s from "./agendar.module.css";

function AgendarCitaContent() {
  const router = useRouter();
  const {
    clinic,
    pets,
    services,
    slots,
    clinicLoading,
    clinicError,
    refetchClinic,
    petsLoading,
    servicesLoading,
    slotsLoading,
    slotsError,
    refetchSlots,
    isRescheduling,
    selectedPet,
    selectedService,
    selectedDate,
    selectedSlot,
    reason,
    isEmergency,
    isPending,
    setSelectedPet,
    setSelectedService,
    setSelectedDate,
    setSelectedSlot,
    setReason,
    toggleEmergency,
    handleAgendar,
  } = useBookAppointment();

  const title = isRescheduling ? "Reagendar cita" : "Agendar cita";

  if (clinicLoading || petsLoading || servicesLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title={title} />
        <div className={s.content}>
          <Skeleton height={72} />
          <Skeleton height={90} />
          <Skeleton height={140} />
          <Skeleton height={90} />
        </div>
      </ScreenContainer>
    );
  }

  if (!clinic) {
    return (
      <ScreenContainer>
        <ScreenHeader title={title} />
        <EmptyState
          icon={<Building2 size={28} />}
          title={clinicError ? "No pudimos cargar la clínica" : "No encontramos esta clínica"}
          subtitle={clinicError ? "Revisa tu conexión e inténtalo de nuevo." : "Puede que ya no esté en el directorio."}
          actionLabel={clinicError ? "Reintentar" : "Ver directorio"}
          onAction={clinicError ? () => refetchClinic() : () => router.replace("/directorio")}
        />
      </ScreenContainer>
    );
  }

  const service = services.find((x) => x.id === selectedService);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScreenContainer>
      <ScreenHeader title={title} subtitle={clinic.name} />

      <div className={s.content}>
        {/* Clínica */}
        <Card>
          <div className={s.clinic}>
            <div className={s.iconBox}>
              <Stethoscope size={20} color="var(--color-primary)" />
            </div>
            <div className={s.clinicInfo}>
              <p className={s.clinicName}>{clinic.name}</p>
              {clinic.city ? (
                <span className={s.meta}>
                  <MapPin size={12} color="var(--color-text-muted)" aria-hidden />
                  {clinic.city}
                </span>
              ) : null}
            </div>
          </div>
          {clinic.is_24_hours || clinic.has_emergency ? (
            <div className={s.badges}>
              {clinic.is_24_hours ? (
                <Badge label="24 horas" color="var(--color-info)" size="sm" icon={<Clock size={12} />} />
              ) : null}
              {clinic.has_emergency ? (
                <Badge label="Urgencias" color="var(--color-error)" size="sm" icon={<AlertTriangle size={12} />} />
              ) : null}
            </div>
          ) : null}
        </Card>

        {!isRescheduling ? (
          <FormSection title="¿Para quién?">
            {pets.length === 0 ? (
              <div className={s.inline}>
                <p className={s.bodyText}>Agrega a tu mascota para poder agendar.</p>
                <Button label="Agregar" size="sm" fullWidth={false} onPress={() => router.push("/mascotas/nuevo")} />
              </div>
            ) : (
              <div className={s.chips}>
                {pets.map((pet) => {
                  const active = selectedPet === pet.id;
                  return (
                    <FilterChip
                      key={pet.id}
                      label={pet.name}
                      active={active}
                      onPress={() => setSelectedPet(pet.id)}
                      icon={<PawPrint size={12} />}
                    />
                  );
                })}
              </div>
            )}
          </FormSection>
        ) : null}

        <FormSection title="Servicio">
          {services.length === 0 ? (
            <p className={s.bodyText}>
              Esta clínica aún no tiene servicios para agendar en línea. Llámales para hacer tu cita.
            </p>
          ) : (
            <div className={s.services}>
              {services.map((svc) => {
                const active = selectedService === svc.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    className={`${s.service} ${active ? s.serviceActive : ""}`}
                    onClick={isRescheduling ? undefined : () => setSelectedService(svc.id)}
                    disabled={isRescheduling}
                    aria-pressed={active}
                    aria-label={`${svc.name}, ${svc.duration_minutes} minutos${svc.price ? `, ${formatCurrency(svc.price)}` : ""}`}
                  >
                    <span className={s.serviceInfo}>
                      <span className={active ? s.serviceNameActive : s.serviceName}>{svc.name}</span>
                      <span className={s.serviceMeta}>{svc.duration_minutes} min</span>
                    </span>
                    {svc.price ? <span className={s.servicePrice}>{formatCurrency(svc.price)}</span> : null}
                  </button>
                );
              })}
            </div>
          )}
        </FormSection>

        <FormSection title="Fecha y hora">
          <label className={s.dateField}>
            <span className={s.dateLabel}>Día</span>
            <input
              type="date"
              className={s.dateInput}
              value={toInputDate(selectedDate)}
              min={today}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split("-").map(Number);
                if (y && m && d) setSelectedDate(new Date(y, m - 1, d, 12));
              }}
            />
          </label>

          {!selectedService ? (
            <p className={s.bodyText}>Elige un servicio para ver los horarios.</p>
          ) : slotsLoading ? (
            <div className={s.chips}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} width={72} height={36} borderRadius={999} />
              ))}
            </div>
          ) : slotsError ? (
            <div className={s.inline}>
              <p className={s.bodyText}>No pudimos cargar los horarios.</p>
              <Button label="Reintentar" size="sm" variant="secondary" fullWidth={false} onPress={() => refetchSlots()} />
            </div>
          ) : slots.length === 0 ? (
            <p className={s.bodyText}>
              No quedan horarios ese día{service ? ` para ${service.name.toLowerCase()}` : ""}. Prueba con otra fecha.
            </p>
          ) : (
            <div className={s.chips}>
              {slots.map((slot) => (
                <FilterChip
                  key={slot.start_time}
                  label={slot.start_time}
                  active={selectedSlot === slot.start_time}
                  onPress={() => setSelectedSlot(slot.start_time)}
                />
              ))}
            </div>
          )}
        </FormSection>

        {!isRescheduling ? (
          <FormSection title="Motivo">
            <FormField
              label="¿Qué le pasa o qué necesita?"
              value={reason}
              onChangeText={setReason}
              placeholder="Síntomas, desde cuándo, o el motivo de la visita"
              multiline
              numberOfLines={3}
            />
            <FormSwitch
              variant="switch"
              label="Es urgente"
              description="La clínica verá la cita marcada como urgente."
              value={isEmergency}
              onChange={toggleEmergency}
            />
            {isEmergency ? (
              <div className={s.note}>
                <Phone size={15} color="var(--color-error)" />
                <p className={s.bodyText}>
                  Si su vida corre peligro, no esperes la confirmación: llama a la clínica o ve directo
                  {clinic.has_emergency ? " (atienden urgencias)" : ""}.
                </p>
              </div>
            ) : null}
          </FormSection>
        ) : null}
      </div>

      <div className={s.footer}>
        <Button
          label={isRescheduling ? "Confirmar nuevo horario" : selectedSlot ? `Agendar a las ${selectedSlot}` : "Agendar cita"}
          icon={<Calendar size={18} />}
          onPress={handleAgendar}
          loading={isPending}
          size="lg"
        />
      </div>
    </ScreenContainer>
  );
}

/** `YYYY-MM-DD` para `<input type="date">` en hora local. */
function toInputDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function AgendarCitaPage() {
  return (
    <Suspense fallback={null}>
      <AgendarCitaContent />
    </Suspense>
  );
}
