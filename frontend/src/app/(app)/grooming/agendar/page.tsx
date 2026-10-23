"use client";

/**
 * Agendar cita de estética (`/grooming/agendar`): servicio → mascota → fecha → horario → confirmar.
 * Espejo de `mobile/app/grooming/agendar.tsx`.
 */
import { Suspense } from "react";
import { Scissors, Clock, PawPrint, Sparkles, Check, Info } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import FormSection from "@/components/forms/FormSection";
import { Skeleton } from "@/components/Skeleton";
import { useGroomingBooking } from "@/hooks/grooming/useGroomingBooking";
import type { GroomingService } from "@/services/grooming";
import type { Pet } from "@/types/mascotas";
import l from "../../estilistas/estilistas.module.css";

function AgendarContent() {
  const {
    services,
    pets,
    availableSlots,
    selectedServiceId,
    selectedPetId,
    selectedDate,
    selectedSlot,
    servicesLoading,
    petsLoading,
    slotsLoading,
    isPending,
    setSelectedServiceId,
    setSelectedPetId,
    setSelectedDate,
    setSelectedSlot,
    handleBook,
    canSubmit,
    selectedService,
  } = useGroomingBooking();

  const toInputDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = toInputDate(new Date());

  return (
    <ScreenContainer>
      <ScreenHeader title="Agendar Cita" subtitle="Spa & Grooming para tu mascota" />

      <FormSection title="Elige un servicio">
        {servicesLoading ? (
          <Skeleton height={72} borderRadius={16} />
        ) : services.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-xl) 0" }}>
            No hay servicios disponibles por el momento.
          </p>
        ) : (
          services.map((service: GroomingService) => {
            const active = selectedServiceId === service.id;
            return (
              <button
                key={service.id}
                type="button"
                className={`${l.selectCard} ${active ? l.selectCardActive : ""}`}
                aria-pressed={active}
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setSelectedSlot("");
                }}
              >
                <div className={l.selectIcon}>
                  <Scissors size={18} />
                </div>
                <div className={l.selectInfo}>
                  <p className={l.selectName}>{service.name}</p>
                  {service.description ? <p className={l.selectSub}>{service.description}</p> : null}
                  <p className={l.selectSub}>
                    ${service.price} · {service.duration_minutes} min
                    {service.groomer_rating_count
                      ? ` · ★ ${(service.groomer_rating_avg ?? 0).toFixed(1)} (${service.groomer_rating_count})`
                      : ""}
                  </p>
                </div>
                {active ? (
                  <span className={l.checkDot}>
                    <Check size={14} />
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </FormSection>

      <FormSection title="¿Para quién es la cita?">
        {petsLoading ? (
          <Skeleton height={72} borderRadius={16} />
        ) : pets.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-xl) 0" }}>
            Registra una mascota primero.
          </p>
        ) : (
          <div className={l.petRow}>
            {pets.map((pet: Pet) => {
              const active = selectedPetId === pet.id;
              return (
                <button
                  key={pet.id}
                  type="button"
                  className={`${l.selectCard} ${l.petChip} ${active ? l.selectCardActive : ""}`}
                  aria-pressed={active}
                  onClick={() => setSelectedPetId(pet.id)}
                >
                  <div className={l.selectIcon}>
                    <PawPrint size={18} />
                  </div>
                  <p className={l.selectName}>{pet.name}</p>
                  {active ? (
                    <span className={l.checkDot}>
                      <Check size={12} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </FormSection>

      <FormSection title="Fecha">
        <input
          type="date"
          value={toInputDate(selectedDate)}
          min={today}
          aria-label="Fecha de la cita"
          onChange={(e) => {
            const [y, m, d] = e.target.value.split("-").map(Number);
            if (y && m && d) {
              setSelectedDate(new Date(y, m - 1, d));
              setSelectedSlot("");
            }
          }}
          style={{
            width: "100%",
            minHeight: 48,
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            padding: "0 var(--space-md)",
            fontSize: "var(--font-md)",
          }}
        />
      </FormSection>

      {selectedServiceId ? (
        <FormSection title="Horarios disponibles">
          {slotsLoading ? (
            <Skeleton height={40} borderRadius={12} />
          ) : availableSlots.length === 0 ? (
            <div className={l.noteBox}>
              <Clock size={16} />
              <span>No hay horarios disponibles para esta fecha.</span>
            </div>
          ) : (
            <div className={l.slotsGrid}>
              {availableSlots.map((slot) => {
                const active = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`${l.slotChip} ${active ? l.slotChipActive : ""}`}
                    aria-pressed={active}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <Clock size={13} />
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </FormSection>
      ) : null}

      {canSubmit && selectedService ? (
        <div className={l.summaryCard}>
          <Sparkles size={20} color="var(--color-success)" />
          <div>
            <p className={l.summaryTitle}>Resumen de tu cita</p>
            <p className={l.summaryDetail}>
              {selectedService.name} · {selectedSlot} · ${selectedService.price}
            </p>
          </div>
        </div>
      ) : null}

      <div className={l.noteBox}>
        <Info size={16} />
        <span>Podrás cancelar la cita mientras esté programada o confirmada.</span>
      </div>

      <Button
        label="Confirmar cita"
        icon={<Sparkles size={18} />}
        onPress={handleBook}
        loading={isPending}
        disabled={!canSubmit}
        style={{ marginTop: "var(--space-xl)" }}
      />
    </ScreenContainer>
  );
}

export default function AgendarGroomingPage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Agendar Cita" subtitle="Spa & Grooming para tu mascota" />
        </ScreenContainer>
      }
    >
      <AgendarContent />
    </Suspense>
  );
}
