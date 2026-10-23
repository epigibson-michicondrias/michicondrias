import type { ComponentType } from "react";
import { FileText, Footprints, Home, MapPin, Pill, Scissors, ShoppingBag, Star, Weight } from "lucide-react";
import styles from "./Journey.module.css";

/* Maquetas de la app que flotan sobre la foto de cada etapa. Datos de muestra, no reales. */

function AdoptVisual() {
  return (
    <div className={styles.vCard}>
      <p className={styles.vTitle}>Mishka</p>
      <p className={styles.vMuted}>Gatita mestiza de 8 meses en Guadalajara</p>
      <div className={styles.vTags}>
        <span>Vacunada</span>
        <span>Esterilizada</span>
        <span>Convive con otros gatos</span>
      </div>
      <span className={styles.vAction}>Quiero adoptarla</span>
    </div>
  );
}

const WEIGHTS = [3.1, 3.4, 3.6, 3.9, 4.0, 4.2];

function HealthVisual() {
  return (
    <div className={styles.vCard}>
      <p className={styles.vTitle}>Expediente de Luna</p>
      <ul className={styles.vList}>
        <li>
          <FileText size={18} strokeWidth={1.75} />
          <span>Consulta general</span>
          <span className={styles.vMuted}>8 oct</span>
        </li>
        <li>
          <Pill size={18} strokeWidth={1.75} />
          <span>Meloxicam por 5 días</span>
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
    </div>
  );
}

const SLOTS = ["Hoy 17:00", "Mañana 9:30", "Mañana 12:00"];

function VetVisual() {
  return (
    <div className={styles.vCard}>
      <div className={styles.vRow}>
        <div>
          <p className={styles.vTitle}>Clínica Veterinaria Roma</p>
          <p className={styles.vMuted}>A 1.2 km de ti</p>
        </div>
        <span className={styles.vRating}>
          <Star size={14} strokeWidth={0} fill="currentColor" /> 4.9
        </span>
      </div>
      <div className={styles.vSlots}>
        {SLOTS.map((s, i) => (
          <span key={s} data-selected={i === 1}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

const SERVICES = [
  { icon: Home, label: "Cuidado en casa" },
  { icon: Scissors, label: "Estética" },
  { icon: ShoppingBag, label: "Tienda" },
  { icon: Footprints, label: "Paseos" },
];

function CareVisual() {
  return (
    <div className={styles.vGrid}>
      {SERVICES.map(({ icon: Icon, label }) => (
        <div key={label} className={styles.vTile}>
          <Icon size={22} strokeWidth={1.5} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function LostVisual() {
  return (
    <div className={`${styles.vCard} ${styles.vAlert}`}>
      <span className={styles.vPin}>
        <MapPin size={20} strokeWidth={2} />
      </span>
      <div>
        <p className={styles.vTitle}>Vieron a Simón</p>
        <p className={styles.vMuted}>Avistamiento hace 20 minutos cerca del Parque México.</p>
      </div>
    </div>
  );
}

export interface JourneyStep {
  title: string;
  text: string;
  photo: string;
  alt: string;
  Visual: ComponentType;
}

export const STEPS: JourneyStep[] = [
  {
    title: "Adopta",
    text: "Conoce gatos y perros de refugios y hogares temporales verificados, y envía tu solicitud desde el celular.",
    photo: "/landing/adopta.webp",
    alt: "Una joven abraza al gatito que acaba de adoptar en un refugio",
    Visual: AdoptVisual,
  },
  {
    title: "Lleva su expediente",
    text: "Vacunas, consultas, recetas y peso en un carnet digital. Te avisamos cuando toca la siguiente dosis.",
    photo: "/landing/expediente.webp",
    alt: "Un gato atigrado gris descansa en el regazo de su dueño",
    Visual: HealthVisual,
  },
  {
    title: "Encuentra veterinario",
    text: "Clínicas y especialistas cerca de ti, con horarios disponibles y citas en línea.",
    photo: "/landing/veterinario.webp",
    alt: "Una veterinaria revisa con el estetoscopio a un gato blanco y negro",
    Visual: VetVisual,
  },
  {
    title: "Consiéntelo",
    text: "Cuidadores, estilistas, paseadores y una tienda con lo que necesita, todo con reseñas de otros dueños.",
    photo: "/landing/consientelo.webp",
    alt: "Un gato siamés salta para atrapar un juguete de plumas",
    Visual: CareVisual,
  },
  {
    title: "Si se pierde",
    text: "Publica su foto y la última ubicación. Quien lo vea registra un avistamiento y te avisamos al momento.",
    photo: "/landing/perdido.webp",
    alt: "Un gato naranja sentado sobre una barda en una calle de noche",
    Visual: LostVisual,
  },
];
