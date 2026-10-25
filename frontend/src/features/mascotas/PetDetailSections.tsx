"use client";

/**
 * Secciones de la ficha de mascota en web: hero con acciones y las tres pestañas, cada una a dos columnas
 * (contenido principal + panel lateral). La lógica es la de la app (`usePetDetail`, `usePetHealth`).
 */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Cat,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Dog,
  FlaskConical,
  Flower2,
  Pencil,
  Pill,
  Satellite,
  Scissors,
  Share2,
  Sparkles,
  Syringe,
} from "lucide-react";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import DataTable, { type Column } from "@/components/DataTable";
import { ItemActions } from "@/features/carnet/CarnetItems";
import type { usePetDetail, PetTab } from "@/hooks/mascotas/usePetDetail";
import type { usePetHealth } from "@/hooks/carnet/usePetHealth";
import type { Pet } from "@/types/mascotas";
import type { Vaccine } from "@/types/carnet";
import { capitalize, formatAge, formatDate, formatWeight } from "@/utils/formatters";
import d from "./PetDetail.module.css";

type Health = ReturnType<typeof usePetHealth>;
type Detail = ReturnType<typeof usePetDetail>;

/** Resultado de laboratorio tal como lo devuelve `getPetLabHistory` (sin tipo en el servicio). */
interface LabResult {
  id?: string;
  parameter_name: string;
  measured_value: string | number;
  unit?: string | null;
  reference_range?: string | null;
  is_anomaly?: boolean;
  created_at?: string;
}

const VACCINES_LABEL = { "al-dia": "Vacunas al día", vencido: "Refuerzo vencido", "sin-registro": "Sin vacunas registradas" } as const;

const today = () => new Date().toISOString().slice(0, 10);
const isOverdue = (v: Vaccine) => !!v.next_due_date && v.next_due_date.slice(0, 10) < today();
const genderLabel = (g: string | null) => (g === "hembra" ? "Hembra" : g === "macho" ? "Macho" : null);

/** Tarjeta del panel lateral o de la columna principal. */
function Panel({ title, icon, action, children }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={d.panel} aria-label={title}>
      <header className={d.panelHead}>
        {icon && <span className={d.panelIcon} aria-hidden>{icon}</span>}
        <h2 className={d.panelTitle}>{title}</h2>
        {action && <div className={d.panelAction}>{action}</div>}
      </header>
      {children}
    </section>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────── */

export function PetHero({ pet, isOwner, health, onShare }: { pet: Pet; isOwner: boolean; health: Health; onShare: () => void }) {
  const SpeciesIcon = pet.species === "perro" ? Dog : Cat;
  const meta = [
    pet.breed || capitalize(pet.species),
    genderLabel(pet.gender),
    pet.age_months ? formatAge(pet.age_months) : null,
    pet.weight_kg ? formatWeight(pet.weight_kg) : null,
  ].filter(Boolean);

  return (
    <section className={d.hero}>
      <nav aria-label="Ruta" className={d.crumbs}>
        <Link href="/mascotas">Mis mascotas</Link>
        <ChevronRight size={14} aria-hidden />
        <span aria-current="page">{pet.name}</span>
      </nav>

      <div className={d.heroBody}>
        {pet.photo_url ? (
          <Image src={pet.photo_url} alt={pet.name} width={120} height={120} className={d.heroPhoto} />
        ) : (
          <div className={d.heroPhoto} aria-hidden><SpeciesIcon size={52} strokeWidth={1.5} /></div>
        )}

        <div className={d.heroText}>
          <h1 className={d.heroName}>{pet.name}</h1>
          <p className={d.heroMeta}>{meta.join(" · ")}</p>
          <div className={d.heroChips}>
            <span className={d.chip}><SpeciesIcon size={14} aria-hidden /> {capitalize(pet.species)}</span>
            {!health.loadingVaccines && (
              <span className={`${d.chip} ${health.vaccinesStatus === "vencido" ? d.chipWarn : health.vaccinesStatus === "al-dia" ? d.chipOk : ""}`}>
                <Syringe size={14} aria-hidden /> {VACCINES_LABEL[health.vaccinesStatus]}
              </span>
            )}
            {pet.has_active_subscription && <span className={`${d.chip} ${d.chipOk}`}><Satellite size={14} aria-hidden /> Michi-Tracker activo</span>}
          </div>
        </div>

        {/* Dueño: compartir y editar los datos de la mascota. Equipo clínico: registrar en el carnet (solo ellos lo escriben). */}
        {(isOwner || health.canEdit) && (
          <div className={d.heroActions}>
            {health.canEdit && (
              <>
                <Button label="Agregar vacuna" variant="gold" fullWidth={false} icon={<Syringe size={18} />} onPress={health.addVaccine} />
                <button type="button" className={d.heroBtn} onClick={health.addRecord}><ClipboardList size={16} aria-hidden /> Agregar consulta</button>
              </>
            )}
            {isOwner && (
              <>
                {health.canEdit ? (
                  <button type="button" className={d.heroBtn} onClick={onShare}><Share2 size={16} aria-hidden /> Compartir carnet</button>
                ) : (
                  <Button label="Compartir carnet" variant="gold" fullWidth={false} icon={<Share2 size={18} />} onPress={onShare} />
                )}
                <Link href={`/mascotas/editar/${pet.id}`} className={d.heroBtn}><Pencil size={16} aria-hidden /> Editar datos</Link>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Resumen ──────────────────────────────────────────────────────── */

export function PetSummary({ pet, isOwner, health, detail, onOpenTab }: {
  pet: Pet; isOwner: boolean; health: Health; detail: Detail; onOpenTab: (tab: PetTab) => void;
}) {
  const facts: { label: string; value: string }[] = [
    { label: "Especie", value: capitalize(pet.species) },
    { label: "Raza", value: pet.breed || "Sin especificar" },
    { label: "Sexo", value: genderLabel(pet.gender) || "Sin especificar" },
    { label: "Edad", value: pet.age_months ? formatAge(pet.age_months) : "Sin registrar" },
    { label: "Peso", value: pet.weight_kg ? formatWeight(pet.weight_kg) : "Sin registrar" },
    { label: "Esterilizado", value: pet.is_sterilized ? "Sí" : "No" },
    { label: "Desparasitado", value: pet.is_dewormed ? "Sí" : "No" },
    { label: "Microchip", value: pet.microchip_number ? "Registrado" : "Sin registrar" },
  ];
  const busy = detail.isSubscribing || detail.isOpeningBilling;

  return (
    <div className={d.columns}>
      <div className={d.main}>
        <Panel title="Datos">
          <dl className={d.facts}>
            {facts.map((f) => (
              <div key={f.label} className={d.fact}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <button type="button" className={d.statusRow} onClick={() => onOpenTab("salud")}>
          <span className={`${d.panelIcon} ${health.vaccinesStatus === "vencido" ? d.iconWarn : ""}`} aria-hidden><Syringe size={18} /></span>
          <span className={d.statusText}>
            <strong>{health.loadingVaccines ? "Revisando vacunas…" : VACCINES_LABEL[health.vaccinesStatus]}</strong>
            <span>{health.vaccines.length ? `${health.vaccines.length} en su carnet` : "Las registra su veterinario"}</span>
          </span>
          <ChevronRight size={18} aria-hidden />
        </button>

        {pet.description && (
          <Panel title={`Sobre ${pet.name}`}>
            <p className={d.about}>{pet.description}</p>
          </Panel>
        )}
      </div>

      {isOwner && (
        <aside className={d.aside}>
          <Panel title="Michi-Tracker Pro" icon={<Satellite size={18} />}>
            <p className={d.muted}>
              {pet.has_active_subscription
                ? `El GPS de ${pet.name} está activo. Desde Facturación puedes cambiar o cancelar la suscripción.`
                : `Sigue a ${pet.name} en tiempo real con el collar GPS.`}
            </p>
            <Button
              label={pet.has_active_subscription ? "Gestionar suscripción" : "Activar Michi-Tracker"}
              variant={pet.has_active_subscription ? "secondary" : "primary"}
              icon={pet.has_active_subscription ? <CreditCard size={16} /> : <Satellite size={16} />}
              loading={busy}
              onPress={pet.has_active_subscription ? detail.openTrackerBilling : detail.handleSubscribeMichiTracker}
            />
          </Panel>

          <Panel title={`Más para ${pet.name}`}>
            <ul className={d.links}>
              <li><Link href={`/mascotas/diagnostico-ia?petId=${pet.id}`}><Sparkles size={16} aria-hidden /> Consultar síntomas con IA <ChevronRight size={16} aria-hidden /></Link></li>
              <li><Link href={`/grooming/historial/${pet.id}`}><Scissors size={16} aria-hidden /> Historial de estética <ChevronRight size={16} aria-hidden /></Link></li>
              <li><Link href={`/funeraria/memorial/${pet.id}`}><Flower2 size={16} aria-hidden /> Memorial y recuerdo <ChevronRight size={16} aria-hidden /></Link></li>
            </ul>
          </Panel>
        </aside>
      )}
    </div>
  );
}

/* ── Salud ────────────────────────────────────────────────────────── */

export function PetHealth({ pet, health }: { pet: Pet; health: Health }) {
  const columns: Column<Vaccine>[] = [
    {
      key: "name",
      header: "Vacuna",
      primary: true,
      render: (v) => (
        <span className={d.cellMain}>
          <strong>{v.name}</strong>
          {v.notes && <span>{v.notes}</span>}
        </span>
      ),
    },
    { key: "applied", header: "Aplicada", render: (v) => (v.date_administered ? formatDate(v.date_administered) : "—") },
    { key: "due", header: "Próximo refuerzo", render: (v) => (v.next_due_date ? formatDate(v.next_due_date) : "Sin refuerzo") },
    {
      key: "status",
      header: "Estado",
      render: (v) => (
        <span className={`${d.pill} ${isOverdue(v) ? d.pillWarn : d.pillOk}`}>{isOverdue(v) ? "Vencida" : "Al día"}</span>
      ),
    },
  ];

  return (
    <div className={d.columns}>
      <div className={d.main}>
        <h2 className={d.sectionTitle}>Vacunas</h2>
        {health.loadingVaccines ? (
          <Skeleton height={160} borderRadius={16} />
        ) : health.vaccines.length === 0 ? (
          <EmptyState
            icon={<Syringe size={28} />}
            title="Sin vacunas registradas"
            subtitle={
              health.canEdit
                ? `Registra las vacunas de ${pet.name} para saber cuándo toca el siguiente refuerzo.`
                : `Las vacunas las registra el veterinario de ${pet.name} en la consulta y aparecen aquí con su próximo refuerzo.`
            }
            actionLabel={health.canEdit ? "Agregar vacuna" : health.isOwner ? "Buscar veterinario" : undefined}
            onAction={health.canEdit ? health.addVaccine : health.isOwner ? health.findVet : undefined}
          />
        ) : (
          <DataTable
            caption={`Vacunas de ${pet.name}`}
            columns={columns}
            rows={health.vaccines}
            rowKey={(v) => v.id}
            rowActions={
              health.canEdit
                ? (v) => <ItemActions label={v.name} onEdit={() => health.editVaccine(v.id)} onDelete={() => health.confirmDeleteVaccine(v.id, v.name)} />
                : undefined
            }
          />
        )}
      </div>

      <aside className={d.aside}>
        <Panel title="Medicamentos" icon={<Pill size={18} />}>
          {health.loadingReminders ? (
            <Skeleton height={56} borderRadius={12} />
          ) : health.reminders.length === 0 ? (
            <p className={d.muted}>Sin tratamientos activos. Aparecen aquí cuando una consulta incluye receta.</p>
          ) : (
            <ul className={d.rows}>
              {health.reminders.map((r) => (
                <li key={r.id} className={d.row}>
                  <span className={d.cellMain}>
                    <strong>{r.medication_name}</strong>
                    <span>{r.dosage} · cada {r.frequency_hours} h · {r.duration_days} días</span>
                    <span>{r.sent ? "Tomado" : `Toca el ${formatDate(r.remind_at)}`}</span>
                  </span>
                  {!r.sent && health.canCheckReminders && (
                    <Button label="Tomado" size="sm" variant="secondary" fullWidth={false} onPress={() => health.checkReminder(r.id)} accessibilityLabel={`Marcar ${r.medication_name} como tomado`} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Laboratorio" icon={<FlaskConical size={18} />}>
          {health.loadingLabs ? (
            <Skeleton height={56} borderRadius={12} />
          ) : health.labResults.length === 0 ? (
            <p className={d.muted}>Sin resultados de laboratorio.</p>
          ) : (
            <ul className={d.rows}>
              {(health.labResults as LabResult[]).map((r, i) => (
                <li key={r.id ?? i} className={d.row}>
                  <span className={d.cellMain}>
                    <strong>{r.parameter_name}: {r.measured_value} {r.unit || ""}</strong>
                    <span>
                      {[r.reference_range ? `Normal: ${r.reference_range} ${r.unit || ""}` : null, r.created_at ? formatDate(r.created_at) : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {r.is_anomaly && <span className={`${d.pill} ${d.pillWarn}`}>Fuera de rango</span>}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {health.isOwner && (
          <Panel title="¿Notas algo raro?" icon={<Sparkles size={18} />}>
            <p className={d.muted}>Describe los síntomas y Michi-IA te dice qué tan urgente es y qué hacer.</p>
            <Button label="Consultar síntomas con IA" variant="secondary" onPress={health.openSymptomCheck} />
          </Panel>
        )}
      </aside>
    </div>
  );
}
