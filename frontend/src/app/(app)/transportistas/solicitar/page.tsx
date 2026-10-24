"use client";

/**
 * Solicitar transporte (`/transportistas/solicitar`).
 * Espejo de `mobile/app/transportistas/solicitar.tsx`.
 */
import { Suspense, useState } from "react";
import {
  Calculator,
  Car,
  Clock,
  Info,
  LocateFixed,
  PawPrint,
  Route,
  Users,
  DollarSign,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import FormSection from "@/components/forms/FormSection";
import FormSwitch from "@/components/forms/FormSwitch";
import FormField from "@/components/FormField";
import { SkeletonList } from "@/components/Skeleton";
import { useRequestRide } from "@/hooks/rides/useRequestRide";
import type { Pet } from "@/types/mascotas";
import type { DriverProfile } from "@/services/rides";
import { formatMoney } from "../RideCard";
import l from "../transportistas.module.css";

function SolicitarContent() {
  const {
    form,
    updateForm,
    estimate,
    estimateNote,
    pets,
    drivers,
    isLoading,
    handleEstimate,
    handleSubmit,
    useMyLocation,
    canEstimate,
    isLocating,
    isEstimating,
    isSubmitting,
    router,
  } = useRequestRide();
  const [scheduled, setScheduled] = useState(!!form.scheduled_at);

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />
        <SkeletonList count={3} />
      </ScreenContainer>
    );
  }

  if (pets.length === 0) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />
        <EmptyState
          icon={<PawPrint size={28} />}
          title="Primero registra a tu mascota"
          subtitle="Necesitamos saber quién viajará para asignarte el conductor adecuado."
          actionLabel="Registrar mascota"
          onAction={() => router.push("/mascotas/nuevo")}
        />
      </ScreenContainer>
    );
  }

  const selectedPet = pets.find((p) => p.id === form.pet_id);
  const selectedDriver = drivers.find((d) => d.driver_id === form.driver_id);

  return (
    <ScreenContainer>
      <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />

      <FormSection title="Selecciona tu mascota">
        <div className={l.selectionRow}>
          {pets.map((pet: Pet) => {
            const selected = form.pet_id === pet.id;
            return (
              <button
                key={pet.id}
                type="button"
                className={`${l.selectCard} ${selected ? l.selectCardActive : ""}`}
                aria-pressed={selected}
                onClick={() => updateForm({ pet_id: pet.id })}
              >
                <div className={l.selectIcon}>
                  <PawPrint size={18} />
                </div>
                <p className={l.selectName}>{pet.name}</p>
                <p className={l.selectSub}>{pet.species}</p>
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection title="Direcciones">
        <FormField
          label="Origen *"
          value={form.origin_address}
          onChangeText={(v) => updateForm({ origin_address: v })}
          placeholder="Calle, número y ciudad"
          maxLength={255}
          rightElement={
            <button
              type="button"
              onClick={useMyLocation}
              disabled={isLocating}
              aria-label="Usar mi ubicación como origen"
              style={{
                background: "none",
                border: 0,
                color: "var(--color-primary)",
                fontWeight: 700,
                fontSize: "var(--font-sm)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <LocateFixed size={14} />
              {isLocating ? "Ubicando..." : "Mi ubicación"}
            </button>
          }
        />
        <FormField
          label="Destino *"
          value={form.destination_address}
          onChangeText={(v) => updateForm({ destination_address: v })}
          placeholder="Veterinaria, estética, casa..."
          maxLength={255}
        />
      </FormSection>

      <FormSection title="Conductor (opcional)">
        {drivers.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-md)" }}>
            Por ahora no hay conductores disponibles; tu solicitud quedará abierta hasta que alguien la acepte.
          </p>
        ) : (
          <div className={l.selectionRow}>
            <button
              type="button"
              className={`${l.selectCard} ${!form.driver_id ? l.selectCardActive : ""}`}
              aria-pressed={!form.driver_id}
              onClick={() => updateForm({ driver_id: "" })}
            >
              <div className={l.selectIcon}>
                <Users size={18} />
              </div>
              <p className={l.selectName}>Cualquiera</p>
              <p className={l.selectSub}>El más rápido</p>
            </button>
            {drivers.map((driver: DriverProfile) => {
              const selected = form.driver_id === driver.driver_id;
              return (
                <button
                  key={driver.id}
                  type="button"
                  className={`${l.selectCard} ${selected ? l.selectCardActive : ""}`}
                  aria-pressed={selected}
                  onClick={() => updateForm({ driver_id: driver.driver_id })}
                >
                  <div className={l.selectIcon}>
                    <Car size={18} />
                  </div>
                  <p className={l.selectName}>{driver.vehicle_model}</p>
                  <p className={l.selectSub}>{driver.vehicle_plate}</p>
                  <p className={l.selectSub}>
                    {driver.rating_avg != null ? `★ ${driver.rating_avg.toFixed(1)} · ` : ""}
                    {driver.max_capacity} 🐾
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </FormSection>

      <FormSection title="Opciones">
        <FormSwitch
          label="Requiere transportín"
          description="Necesito que el conductor traiga transportín (costo extra)"
          value={form.requires_carrier}
          onChange={(val) => updateForm({ requires_carrier: val })}
        />
        <FormSwitch
          label="Programar para después"
          description="Elige día y hora del viaje"
          value={scheduled}
          onChange={(val) => {
            setScheduled(val);
            updateForm({ scheduled_at: val ? new Date(Date.now() + 60 * 60_000) : null });
          }}
        />
        {scheduled && form.scheduled_at ? (
          <div className={l.formGroup}>
            <label
              htmlFor="scheduled-at"
              style={{ fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)" }}
            >
              Fecha y hora
            </label>
            <input
              id="scheduled-at"
              type="datetime-local"
              value={localInputDateTime(form.scheduled_at)}
              onChange={(e) => {
                const d = new Date(e.target.value);
                if (!Number.isNaN(d.getTime())) updateForm({ scheduled_at: d });
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
          </div>
        ) : null}
        <FormField
          label="Notas para el conductor"
          value={form.notes}
          onChangeText={(val) => updateForm({ notes: val })}
          placeholder="Ej. Mi perro se pone nervioso, toca el timbre dos veces"
          maxLength={500}
          multiline
        />
      </FormSection>

      <FormSection title="Tarifa estimada">
        <Button
          label={isEstimating ? "Calculando..." : "Calcular tarifa"}
          variant="secondary"
          icon={<Calculator size={18} />}
          disabled={!canEstimate || isEstimating}
          loading={isEstimating}
          onPress={handleEstimate}
        />
        {estimate ? (
          <Card>
            <div className={l.estimateCard}>
              <div className={l.estimateItem}>
                <Route size={16} color="var(--color-primary)" />
                <span>Distancia</span>
                <span className={l.estimateValue}>{estimate.distance_km.toFixed(1)} km</span>
              </div>
              <div className={l.estimateItem}>
                <Clock size={16} color="var(--color-primary)" />
                <span>Duración</span>
                <span className={l.estimateValue}>{Math.round(estimate.estimated_duration_minutes)} min</span>
              </div>
              <div className={l.estimateItem}>
                <DollarSign size={16} color="var(--color-primary)" />
                <span>Tarifa</span>
                <span className={l.estimateValue} style={{ color: "var(--color-primary)" }}>
                  {formatMoney(estimate.estimated_fare)}
                </span>
              </div>
            </div>
          </Card>
        ) : null}
        {estimateNote ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-sm)" }}>{estimateNote}</p>
        ) : null}
      </FormSection>

      <div className={l.noteBox}>
        <Info size={16} />
        <span>
          La tarifa final la calcula el servicio según la distancia. Un conductor aceptará tu solicitud y podrás
          seguir el viaje en tiempo real.
        </span>
      </div>

      {selectedPet || selectedDriver ? (
        <Card>
          <p style={{ margin: "0 0 var(--space-xs)", fontSize: "var(--font-md)", fontWeight: 700, color: "var(--color-text)" }}>
            Resumen
          </p>
          {selectedPet ? (
            <p style={{ margin: 0, fontSize: "var(--font-md)", color: "var(--color-text-muted)" }}>
              🐾 Mascota: {selectedPet.name}
            </p>
          ) : null}
          {selectedDriver ? (
            <p style={{ margin: 0, fontSize: "var(--font-md)", color: "var(--color-text-muted)" }}>
              Conductor sugerido: {selectedDriver.vehicle_model} ({selectedDriver.vehicle_plate})
            </p>
          ) : null}
        </Card>
      ) : null}

      <Button
        label="Solicitar viaje"
        size="lg"
        icon={<Car size={18} />}
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={{ marginTop: "var(--space-lg)" }}
      />
    </ScreenContainer>
  );
}

function localInputDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SolicitarTransportePage() {
  return (
    <Suspense
      fallback={
        <ScreenContainer>
          <ScreenHeader title="Solicitar transporte" subtitle="Pide un viaje para tu mascota" />
        </ScreenContainer>
      }
    >
      <SolicitarContent />
    </Suspense>
  );
}
