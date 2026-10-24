"use client";

/**
 * Gestión Lab — órdenes, resultados, citas, anomalías y catálogo.
 * Espejo de `mobile/app/laboratorio/gestion.tsx`.
 */
import { useState } from "react";
import {
  FlaskConical,
  Calendar,
  AlertTriangle,
  Plus,
  Inbox,
  Upload,
  Check,
  X,
  Beaker,
} from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import FilterChip from "@/components/FilterChip";
import RoleGuard from "@/components/RoleGuard";
import EmptyState from "@/components/EmptyState";
import { SkeletonList } from "@/components/Skeleton";
import { showAlert } from "@/components/AppAlert";
import { useLabProvider } from "@/hooks/laboratorio/useLabProvider";
import { formatDate, formatCurrency } from "@/utils/formatters";
import local from "../laboratorio.module.css";

type Tab = "ordenes" | "citas" | "anomalias" | "catalogo";

const TABS: { key: Tab; label: string }[] = [
  { key: "ordenes", label: "Órdenes" },
  { key: "citas", label: "Citas" },
  { key: "anomalias", label: "Anomalías" },
  { key: "catalogo", label: "Catálogo" },
];

const ORDER_LABEL: Record<string, string> = {
  pending: "Pendiente",
  sample_collected: "Muestra recolectada",
  processing: "En proceso",
  completed: "Completada",
  cancelled: "Cancelada",
};

function orderBadge(status?: string) {
  const s = status || "pending";
  if (s === "completed") return <Badge label={ORDER_LABEL[s]} color="var(--color-success)" />;
  if (s === "cancelled") return <Badge label={ORDER_LABEL[s]} color="var(--color-error)" />;
  if (s === "processing") return <Badge label={ORDER_LABEL[s]} color="var(--color-info)" />;
  if (s === "sample_collected") return <Badge label={ORDER_LABEL[s]} color="var(--color-secondary)" />;
  return <Badge label={ORDER_LABEL[s]} color="var(--color-warning)" />;
}

function apptBadge(status?: string) {
  if (status === "completed") return <Badge label="Completada" color="var(--color-success)" />;
  if (status === "confirmed") return <Badge label="Confirmada" color="var(--color-info)" />;
  if (status === "cancelled") return <Badge label="Cancelada" color="var(--color-error)" />;
  return <Badge label="Pendiente" color="var(--color-warning)" />;
}

interface ResultRow {
  parameter_name: string;
  measured_value: string;
  unit: string;
  reference_range: string;
}

interface TestForm {
  name: string;
  description: string;
  price: string;
  unit: string;
  reference_range: string;
}

function GestionContent() {
  const {
    orders,
    appointments,
    anomalies,
    myTests,
    isLoadingOrders,
    isLoadingAppointments,
    isLoadingAnomalies,
    isLoadingTests,
    updateAppointmentStatus,
    toggleTest,
    uploadResults,
    isUploadingResults,
    updateOrderStatus,
    isUpdatingStatus,
    createTest,
    isCreatingTest,
  } = useLabProvider();

  const [tab, setTab] = useState<Tab>("ordenes");
  const [resultsOrderId, setResultsOrderId] = useState<string | null>(null);
  const [rows, setRows] = useState<ResultRow[]>([
    { parameter_name: "", measured_value: "", unit: "", reference_range: "" },
  ]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [showTestForm, setShowTestForm] = useState(false);
  const [tf, setTf] = useState<TestForm>({
    name: "",
    description: "",
    price: "",
    unit: "",
    reference_range: "",
  });

  const patchRow = (i: number, patch: Partial<ResultRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const openResults = (orderId: string) => {
    setResultsOrderId(orderId);
    setRows([{ parameter_name: "", measured_value: "", unit: "", reference_range: "" }]);
    setPdfUrl("");
  };

  const sendResults = async () => {
    const clean = rows.filter((r) => r.parameter_name.trim() && r.measured_value.trim());
    if (clean.length === 0) {
      showAlert({ type: "error", title: "Sin resultados", message: "Agrega al menos un parámetro con su valor." });
      return;
    }
    if (rows.some((r) => r.parameter_name.trim() && !r.measured_value.trim())) {
      showAlert({
        type: "error",
        title: "Datos incompletos",
        message: "Cada fila necesita nombre del parámetro y un valor numérico.",
      });
      return;
    }
    if (!resultsOrderId) return;
    await uploadResults({
      orderId: resultsOrderId,
      data: {
        results: clean.map((r) => ({
          parameter_name: r.parameter_name.trim(),
          measured_value: Number(r.measured_value.replace(",", ".")),
          unit: r.unit.trim() || undefined,
          reference_range: r.reference_range.trim() || undefined,
        })),
        pdf_url: pdfUrl.trim() || undefined,
      },
    });
    setResultsOrderId(null);
  };

  const publishTest = async () => {
    const price = parseFloat(tf.price.replace(",", "."));
    if (!tf.name.trim() || !tf.price || Number.isNaN(price) || price <= 0) {
      showAlert({
        type: "error",
        title: "Datos incompletos",
        message: "Nombre y un precio mayor a cero son obligatorios.",
      });
      return;
    }
    await createTest({
      name: tf.name.trim(),
      description: tf.description.trim() || undefined,
      price,
      unit: tf.unit.trim() || undefined,
      reference_range: tf.reference_range.trim() || undefined,
    });
    setTf({ name: "", description: "", price: "", unit: "", reference_range: "" });
    setShowTestForm(false);
  };

  const confirmCancelAppt = (id: string) => {
    showAlert({
      type: "warning",
      title: "¿Cancelar la cita?",
      message: "El cliente será notificado.",
      buttonText: "Sí, cancelar",
      showCancel: true,
      cancelText: "Volver",
      onButtonPress: () => updateAppointmentStatus(id, "cancelled"),
    });
  };

  const data =
    tab === "ordenes" ? orders : tab === "citas" ? appointments : tab === "anomalias" ? anomalies : myTests;
  const loading =
    tab === "ordenes"
      ? isLoadingOrders
      : tab === "citas"
        ? isLoadingAppointments
        : tab === "anomalias"
          ? isLoadingAnomalies
          : isLoadingTests;

  const emptyCopy: Record<Tab, string> = {
    ordenes: "Aún no recibes órdenes de veterinarios.",
    citas: "No hay citas solicitadas.",
    anomalias: "No hay resultados fuera de rango.",
    catalogo: "Publica tu primer estudio con el botón +.",
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Gestión Lab"
        subtitle="Órdenes, citas y catálogo"
        actions={
          tab === "catalogo"
            ? [{ icon: Plus, label: "Nuevo estudio", onPress: () => setShowTestForm(true) }]
            : undefined
        }
      />

      <div className={local.toolbar}>
        {TABS.map((t) => (
          <FilterChip key={t.key} label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />
        ))}
      </div>

      {resultsOrderId ? (
        <Card>
          <div className={local.sheet}>
            <p className={local.title}>Cargar resultados</p>
            {rows.map((r, i) => (
              <div key={i} className={local.paramRow}>
                <div className={local.paramField}>
                  <FormField
                    label="Parámetro"
                    value={r.parameter_name}
                    onChangeText={(v) => patchRow(i, { parameter_name: v })}
                    placeholder="Parámetro (ej. Hemoglobina)"
                  />
                </div>
                <div className={local.paramField}>
                  <FormField
                    label="Valor"
                    value={r.measured_value}
                    onChangeText={(v) => patchRow(i, { measured_value: v })}
                    keyboardType="decimal-pad"
                    placeholder="Valor"
                  />
                </div>
                <div className={local.paramField}>
                  <FormField
                    label="Unidad"
                    value={r.unit}
                    onChangeText={(v) => patchRow(i, { unit: v })}
                    placeholder="Unidad"
                  />
                </div>
                <div className={local.paramField}>
                  <FormField
                    label="Ref."
                    value={r.reference_range}
                    onChangeText={(v) => patchRow(i, { reference_range: v })}
                    placeholder="Rango ref."
                  />
                </div>
              </div>
            ))}
            <Button
              label="Agregar fila"
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={() =>
                setRows((prev) => [
                  ...prev,
                  { parameter_name: "", measured_value: "", unit: "", reference_range: "" },
                ])
              }
              icon={<Plus size={16} />}
            />
            <FormField
              label="URL del informe PDF (opcional)"
              value={pdfUrl}
              onChangeText={setPdfUrl}
              placeholder="URL del informe PDF (opcional)"
              keyboardType="url"
            />
            <div className={local.actionsRow}>
              <Button
                label={isUploadingResults ? "Enviando…" : "Enviar resultados"}
                onPress={sendResults}
                loading={isUploadingResults}
                icon={<Upload size={18} />}
              />
              <Button
                label="Cancelar"
                variant="secondary"
                onPress={() => setResultsOrderId(null)}
                icon={<X size={18} />}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {showTestForm ? (
        <Card>
          <div className={local.sheet}>
            <p className={local.title}>Nuevo estudio</p>
            <FormField
              label="Nombre *"
              value={tf.name}
              onChangeText={(v) => setTf((p) => ({ ...p, name: v }))}
              placeholder="Nombre *"
            />
            <FormField
              label="Descripción / preparación"
              value={tf.description}
              onChangeText={(v) => setTf((p) => ({ ...p, description: v }))}
              placeholder="Descripción / preparación"
              multiline
              numberOfLines={3}
            />
            <FormField
              label="Precio (MXN) *"
              value={tf.price}
              onChangeText={(v) => setTf((p) => ({ ...p, price: v }))}
              keyboardType="decimal-pad"
              placeholder="Precio (MXN) *"
            />
            <FormField
              label="Unidad"
              value={tf.unit}
              onChangeText={(v) => setTf((p) => ({ ...p, unit: v }))}
              placeholder="Unidad"
            />
            <FormField
              label="Rango de referencia"
              value={tf.reference_range}
              onChangeText={(v) => setTf((p) => ({ ...p, reference_range: v }))}
              placeholder="Rango ref."
            />
            <div className={local.actionsRow}>
              <Button
                label={isCreatingTest ? "Publicando…" : "Publicar estudio"}
                onPress={publishTest}
                loading={isCreatingTest}
                icon={<Check size={18} />}
              />
              <Button
                label="Cancelar"
                variant="secondary"
                onPress={() => setShowTestForm(false)}
                icon={<X size={18} />}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <SkeletonList count={3} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="Sin elementos"
          subtitle={emptyCopy[tab]}
          actionLabel={tab === "catalogo" ? "Nuevo estudio" : undefined}
          onAction={tab === "catalogo" ? () => setShowTestForm(true) : undefined}
        />
      ) : (
        <div className={local.list}>
          {tab === "ordenes"
            ? orders.map((item: Record<string, unknown>) => {
                const id = String(item.id);
                const open = item.status !== "completed" && item.status !== "cancelled";
                const names = (item.test_names as string[] | undefined) || [];
                return (
                  <Card key={id}>
                    <div className={local.cardBody}>
                      <div className={local.rowTop}>
                        <span className={local.iconBox} aria-hidden>
                          <Beaker size={20} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={local.title}>
                            {names.join(", ") || `Orden #${id.slice(0, 8)}`}
                          </p>
                          {item.pet_name ? (
                            <p className={local.subtitle}>Paciente: {String(item.pet_name)}</p>
                          ) : null}
                        </div>
                        {orderBadge(item.status as string | undefined)}
                      </div>
                      {open ? (
                        <div className={local.actionsRow}>
                          {item.status === "pending" ? (
                            <Button
                              label="Muestra recolectada"
                              size="sm"
                              variant="secondary"
                              fullWidth={false}
                              disabled={isUpdatingStatus}
                              onPress={() => updateOrderStatus({ orderId: id, status: "sample_collected" })}
                            />
                          ) : null}
                          {item.status === "sample_collected" ? (
                            <Button
                              label="En proceso"
                              size="sm"
                              variant="secondary"
                              fullWidth={false}
                              disabled={isUpdatingStatus}
                              onPress={() => updateOrderStatus({ orderId: id, status: "processing" })}
                            />
                          ) : null}
                          <Button
                            label="Cargar resultados"
                            size="sm"
                            fullWidth={false}
                            onPress={() => openResults(id)}
                            icon={<Upload size={16} />}
                          />
                          <Button
                            label="Cancelar"
                            size="sm"
                            variant="danger"
                            fullWidth={false}
                            disabled={isUpdatingStatus}
                            onPress={() => updateOrderStatus({ orderId: id, status: "cancelled" })}
                          />
                        </div>
                      ) : null}
                    </div>
                  </Card>
                );
              })
            : null}

          {tab === "citas"
            ? appointments.map((item: Record<string, unknown>) => {
                const id = String(item.id);
                return (
                  <Card key={id}>
                    <div className={local.cardBody}>
                      <div className={local.rowTop}>
                        <span className={local.iconBox} aria-hidden>
                          <Calendar size={20} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={local.title}>{String(item.test_name || "Estudio de laboratorio")}</p>
                          <p className={local.subtitle}>
                            {item.pet_name ? `${String(item.pet_name)} · ` : ""}
                            {formatDate(String(item.scheduled_date || ""))}{" "}
                            {item.scheduled_time ? String(item.scheduled_time).slice(0, 5) : ""}
                          </p>
                        </div>
                        {apptBadge(item.status as string | undefined)}
                      </div>
                      <div className={local.actionsRow}>
                        {item.status === "pending" ? (
                          <>
                            <Button
                              label="Confirmar"
                              size="sm"
                              fullWidth={false}
                              onPress={() => updateAppointmentStatus(id, "confirmed")}
                              icon={<Check size={16} />}
                            />
                            <Button
                              label="Rechazar"
                              size="sm"
                              variant="danger"
                              fullWidth={false}
                              onPress={() => confirmCancelAppt(id)}
                              icon={<X size={16} />}
                            />
                          </>
                        ) : null}
                        {item.status === "confirmed" ? (
                          <>
                            <Button
                              label="Marcar atendida"
                              size="sm"
                              fullWidth={false}
                              onPress={() => updateAppointmentStatus(id, "completed")}
                              icon={<Check size={16} />}
                            />
                            <Button
                              label="Cancelar"
                              size="sm"
                              variant="danger"
                              fullWidth={false}
                              onPress={() => confirmCancelAppt(id)}
                              icon={<X size={16} />}
                            />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })
            : null}

          {tab === "anomalias"
            ? anomalies.map((item: Record<string, unknown>, idx: number) => (
                <Card key={String(item.id) || idx}>
                  <div className={local.cardBody}>
                    <div className={local.rowTop}>
                      <span className={local.iconBox} style={{ background: "var(--color-error-light)", color: "var(--color-error)" }} aria-hidden>
                        <AlertTriangle size={20} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className={local.title}>{String(item.parameter_name)}</p>
                        <p className={local.subtitle}>
                          Valor: {String(item.measured_value)}
                          {item.unit ? ` ${String(item.unit)}` : ""}
                          {item.reference_range ? ` (ref. ${String(item.reference_range)})` : ""}
                        </p>
                      </div>
                      <Badge label="Fuera de rango" color="var(--color-error)" />
                    </div>
                  </div>
                </Card>
              ))
            : null}

          {tab === "catalogo"
            ? myTests.map((item: Record<string, unknown>) => {
                const id = String(item.id);
                return (
                  <Card key={id}>
                    <div className={local.cardBody}>
                      <div className={local.rowTop}>
                        <span className={local.iconBox} aria-hidden>
                          <FlaskConical size={20} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={local.title}>{String(item.name)}</p>
                          <p className={local.subtitle}>
                            {formatCurrency(Number(item.price || 0))} ·{" "}
                            {item.is_active ? "Visible" : "Oculto"}
                          </p>
                        </div>
                      </div>
                      <div className={local.actionsRow}>
                        <Button
                          label={item.is_active ? "Ocultar" : "Publicar"}
                          size="sm"
                          variant="secondary"
                          fullWidth={false}
                          onPress={() => toggleTest(id, !item.is_active)}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            : null}
        </div>
      )}
    </ScreenContainer>
  );
}

export default function GestionLabPage() {
  return (
    <RoleGuard
      roles={["laboratorio", "veterinario", "clinica", "hospital"]}
      message="Esta sección es para laboratorios y personal veterinario."
    >
      <GestionContent />
    </RoleGuard>
  );
}
