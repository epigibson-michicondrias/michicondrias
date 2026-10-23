import type { ComponentType } from "react";
import {
  Dog,
  FileText,
  Footprints,
  Home,
  MapPin,
  Pill,
  Scissors,
  ShoppingBag,
  Star,
  Weight,
} from "lucide-react";
import styles from "./Journey.module.css";

/* Ejemplos visuales de cada etapa. Son maquetas de la app con datos de muestra, no datos reales. */

function AdoptVisual() {
  return (
    <div className={styles.vCard}>
      <div className={styles.vPhoto}>
        <Dog size={64} strokeWidth={1} />
      </div>
      <div className={styles.vBody}>
        <p className={styles.vTitle}>Nube</p>
        <p className={styles.vMuted}>Golden retriever de 3 años en Guadalajara</p>
        <div className={styles.vTags}>
          <span>Vacunada</span>
          <span>Esterilizada</span>
          <span>Se lleva bien con niños</span>
        </div>
        <span className={styles.vAction}>Quiero adoptarla</span>
      </div>
    </div>
  );
}

const WEIGHTS = [3.1, 3.4, 3.6, 3.9, 4.0, 4.2];

function HealthVisual() {
  return (
    <div className={styles.vCard}>
      <div className={styles.vBody}>
        <p className={styles.vTitle}>Expediente de Luna</p>
        <ul className={styles.vList}>
          <li>
            <FileText size={18} strokeWidth={1.75} />
            <span>Consulta general</span>
            <span className={styles.vMuted}>8 oct</span>
          </li>
          <li>
            <Pill size={18} strokeWidth={1.75} />
            <span>Receta: meloxicam por 5 días</span>
            <span className={styles.vMuted}>8 oct</span>
          </li>
          <li>
            <Weight size={18} strokeWidth={1.75} />
            <span>Peso</span>
            <span className={styles.vMuted}>4.2 kg</span>
          </li>
        </ul>
        <div className={styles.vBars} aria-hidden>
          {WEIGHTS.map((w, i) => (
            <span key={i} style={{ height: `${(w / 4.2) * 100}%` }} />
          ))}
        </div>
        <p className={styles.vMuted}>Peso de los últimos 6 meses</p>
      </div>
    </div>
  );
}

const SLOTS = ["Hoy 17:00", "Mañana 9:30", "Mañana 12:00"];

function VetVisual() {
  return (
    <div className={styles.vCard}>
      <div className={styles.vBody}>
        <div className={styles.vRow}>
          <div>
            <p className={styles.vTitle}>Clínica Veterinaria Roma</p>
            <p className={styles.vMuted}>A 1.2 km de ti</p>
          </div>
          <span className={styles.vRating}>
            <Star size={14} strokeWidth={0} fill="currentColor" /> 4.9
          </span>
        </div>
        <p className={styles.vLabel}>Elige un horario</p>
        <div className={styles.vSlots}>
          {SLOTS.map((s, i) => (
            <span key={s} data-selected={i === 1}>
              {s}
            </span>
          ))}
        </div>
        <span className={styles.vAction}>Agendar cita</span>
      </div>
    </div>
  );
}

const SERVICES = [
  { icon: Footprints, label: "Paseos" },
  { icon: Scissors, label: "Estética" },
  { icon: Home, label: "Cuidado en casa" },
  { icon: ShoppingBag, label: "Tienda" },
];

function CareVisual() {
  return (
    <div className={styles.vGrid}>
      {SERVICES.map(({ icon: Icon, label }) => (
        <div key={label} className={styles.vTile}>
          <Icon size={28} strokeWidth={1.5} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function LostVisual() {
  return (
    <div className={`${styles.vCard} ${styles.vMap}`}>
      <span className={styles.vPin}>
        <MapPin size={22} strokeWidth={2} />
      </span>
      <div className={styles.vAlert}>
        <p className={styles.vTitle}>Vieron a Max</p>
        <p className={styles.vMuted}>Hace 20 minutos cerca del Parque México. Tres vecinos avisaron.</p>
      </div>
    </div>
  );
}

export interface JourneyStep {
  title: string;
  text: string;
  Visual: ComponentType;
}

export const STEPS: JourneyStep[] = [
  {
    title: "Adopta",
    text: "Conoce perros y gatos de refugios y hogares temporales verificados, y envía tu solicitud desde el celular.",
    Visual: AdoptVisual,
  },
  {
    title: "Lleva su expediente",
    text: "Vacunas, consultas, recetas y peso en un carnet digital. Te avisamos cuando toca la siguiente dosis.",
    Visual: HealthVisual,
  },
  {
    title: "Encuentra veterinario",
    text: "Clínicas y especialistas cerca de ti, con horarios disponibles y citas en línea.",
    Visual: VetVisual,
  },
  {
    title: "Consiéntelo",
    text: "Paseadores, estilistas, cuidadores y una tienda con lo que necesita, todo con reseñas de otros dueños.",
    Visual: CareVisual,
  },
  {
    title: "Si se pierde",
    text: "Publica su foto y la última ubicación. La comunidad de tu zona recibe la alerta y puede avisarte si lo ve.",
    Visual: LostVisual,
  },
];
