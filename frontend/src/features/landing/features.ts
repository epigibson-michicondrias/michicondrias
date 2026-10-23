import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BellRing,
  BrainCircuit,
  Car,
  Coffee,
  FileHeart,
  Flower2,
  FlaskConical,
  Footprints,
  HandHeart,
  KeyRound,
  Heart,
  Home,
  MapPinned,
  Megaphone,
  Package,
  PawPrint,
  QrCode,
  Satellite,
  ScanSearch,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Target,
  Utensils,
  Video,
} from "lucide-react";
import type { WheelItem } from "./FeatureWheel";

/* Todo sale de lo que la app hace hoy (mobile/app/* y backend/*). Si una función cambia, cambia aquí. */

export const WHEEL_ITEMS: WheelItem[] = [
  {
    title: "Adopciones",
    text: "Gatos y perros de refugios verificados, con formulario de compatibilidad, solicitud y contrato en línea.",
    image: "/landing/adopta.webp",
    alt: "Una joven abraza al gatito que acaba de adoptar",
  },
  {
    title: "Carnet digital",
    text: "Vacunas, consultas, recetas y peso en un expediente que te avisa cuando toca la siguiente dosis.",
    image: "/landing/expediente.webp",
    alt: "Un gato gris descansa en el regazo de su dueño",
  },
  {
    title: "Veterinarios",
    text: "Clínicas y especialistas cerca de ti, con horarios disponibles y citas en línea.",
    image: "/landing/veterinario.webp",
    alt: "Una veterinaria revisa a un gato blanco y negro",
  },
  {
    title: "Tienda",
    text: "Alimento, arena, juguetes y accesorios de vendedores verificados, con pago en línea.",
    image: "/landing/consientelo.webp",
    alt: "Un gato siamés salta por un juguete de plumas",
  },
  {
    title: "Michi-Tracker Pro",
    text: "Localizador GPS en tiempo real para saber siempre dónde está.",
    image: "/landing/perdido.webp",
    alt: "Un gato naranja sobre una barda de noche",
  },
  {
    title: "Estética",
    text: "Baño, corte y cepillado con estilistas que publican precios y duración de cada servicio.",
    image: "/landing/pro-estilistas.webp",
    alt: "Una estilista cepilla a un gato persa blanco",
  },
  {
    title: "Cuidado en casa",
    text: "Cuidadores de confianza para cuando sales de viaje, con calendario y reseñas.",
    image: "/landing/cierre.webp",
    alt: "Un gato negro y un cachorro dormidos juntos",
  },
  {
    title: "Videoconsultas",
    text: "Consulta a tu veterinario por video sin salir de casa.",
    image: "/landing/pro-veterinarios.webp",
    alt: "Una veterinaria con un cachorro beagle",
  },
  {
    title: "Mascotas perdidas",
    text: "Reporte con foto y última ubicación. Quien la vea registra un avistamiento y te llega el aviso.",
    image: "/landing/perdidas-calle.webp",
    alt: "Un perrito solo en una calle empedrada al anochecer",
  },
  {
    title: "Refugios y donaciones",
    text: "Apoya a los refugios con donaciones seguras con tarjeta.",
    image: "/landing/pro-refugios.webp",
    alt: "Una voluntaria abraza a un perro en un refugio",
  },
  {
    title: "Paseos",
    text: "Paseadores con zonas, tarifas y horarios, y un calendario de cada salida.",
    image: "/landing/pro-paseadores.webp",
    alt: "Un paseador con tres perros en un parque con jacarandas",
  },
];

export interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
  badge?: string;
}

export interface FeatureGroup {
  id: string;
  title: string;
  lead: string;
  features: Feature[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "salud",
    title: "Salud",
    lead: "Todo su historial médico y la atención que necesita, en el mismo lugar.",
    features: [
      { icon: FileHeart, title: "Carnet digital", text: "Vacunas, desparasitaciones, consultas, recetas y peso. Compártelo con tu veterinario." },
      { icon: Bell, title: "Recordatorios", text: "Avisos antes de cada vacuna, dosis o cita para que nada se te pase." },
      { icon: QrCode, title: "Pasaporte con QR", text: "Comparte su carnet con un enlace o código QR, sin pasar papeles." },
      { icon: BrainCircuit, title: "Orientación con IA", text: "Describe sus síntomas y recibe qué tan urgente es. Si es grave, te lo dice claro.", badge: "IA" },
      { icon: Utensils, title: "Plan de dieta", text: "Calorías e hidratación diarias según su actividad, con una dieta sugerida." },
      { icon: Stethoscope, title: "Citas con veterinario", text: "Busca clínicas y especialistas, elige horario y agenda." },
      { icon: Video, title: "Videoconsultas", text: "Atención por video con tu veterinario, sin traslados." },
      { icon: FlaskConical, title: "Laboratorio", text: "Agenda estudios clínicos y consulta los resultados en la app." },
      { icon: ShieldCheck, title: "Seguros", text: "Cotiza un plan, contrata la póliza y da seguimiento a tus reclamos." },
    ],
  },
  {
    id: "comunidad",
    title: "Comunidad y seguridad",
    lead: "Para encontrar un hogar, volver a casa y ayudar a quien lo necesita.",
    features: [
      { icon: Heart, title: "Adopciones", text: "Formulario de compatibilidad, solicitud y contrato de adopción en línea." },
      { icon: Search, title: "Mascotas perdidas", text: "Reporta con foto y ubicación, recibe avistamientos y ve reportes parecidos a menos de 10 km." },
      { icon: Satellite, title: "Michi-Tracker Pro", text: "Localizador GPS en tiempo real con suscripción mensual.", badge: "Pro" },
      { icon: Megaphone, title: "Alertas impulsadas", text: "Patrocinadores amplían el alcance de los reportes de mascotas perdidas." },
      { icon: HandHeart, title: "Donaciones", text: "Apoya refugios con pagos seguros con tarjeta." },
      { icon: Coffee, title: "Lugares pet-friendly", text: "Cafés, restaurantes, parques y hoteles que reciben mascotas, con cupones y reseñas." },
    ],
  },
  {
    id: "servicios",
    title: "Servicios",
    lead: "Profesionales verificados para cada momento de su vida.",
    features: [
      { icon: Home, title: "Cuidado en casa", text: "Cuidadores para cuando sales de viaje o trabajas todo el día." },
      { icon: Scissors, title: "Estética", text: "Baño, corte y cepillado con precios y duración claros." },
      { icon: Footprints, title: "Paseos", text: "Paseadores con zonas y horarios, y calendario de cada salida." },
      { icon: Target, title: "Adiestramiento", text: "Programas con metas y seguimiento del avance de tu mascota." },
      { icon: Car, title: "Transporte", text: "Pide un viaje para tu mascota y sigue su estado hasta que llegue." },
      { icon: Flower2, title: "Despedida", text: "Servicios funerarios, memorial en línea y certificado, con el cuidado que merece." },
    ],
  },
  {
    id: "compras",
    title: "Compras",
    lead: "Lo que necesita, de vendedores verificados, hasta tu puerta.",
    features: [
      { icon: ShoppingBag, title: "Tienda", text: "Alimento, arena, juguetes y accesorios con carrito y pago en línea." },
      { icon: Package, title: "Mis pedidos", text: "Sigue cada compra y califica lo que recibiste." },
      { icon: MapPinned, title: "Comercios cercanos", text: "Encuentra comercios pet-friendly cerca de ti y aprovecha sus cupones." },
    ],
  },
  {
    id: "cuenta",
    title: "Tu cuenta",
    lead: "Todas tus mascotas y todo lo que buscas, protegido.",
    features: [
      { icon: PawPrint, title: "Perfiles de tus mascotas", text: "Registra a todas tus mascotas con su foto, sus datos y su carnet." },
      { icon: ScanSearch, title: "Búsqueda global", text: "Encuentra mascotas en adopción o perdidas, clínicas, servicios y productos desde un solo lugar." },
      { icon: BellRing, title: "Notificaciones", text: "Te avisamos de tus citas, solicitudes y avistamientos." },
      { icon: KeyRound, title: "Verificación en dos pasos", text: "Protege tu cuenta con un código extra al iniciar sesión." },
    ],
  },
];
