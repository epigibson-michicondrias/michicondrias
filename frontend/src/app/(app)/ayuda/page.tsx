"use client";

/**
 * Centro de Ayuda — espejo de `mobile/app/ayuda.tsx`. FAQ verídicas de la app, contacto
 * directo y enlaces legales (solo se muestran los que la app tiene configurados).
 */
import { useState } from "react";
import {
  ChevronRight,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SectionHeader from "@/components/SectionHeader";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { showAlert } from "@/components/AppAlert";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_WHATSAPP,
  TERMS_URL,
  PRIVACY_URL,
} from "@/constants/support";
import s from "./ayuda.module.css";

// FAQ verídicas: describen lo que la app tiene hoy (el botón de adopción es «¡Quiero Adoptar!» y
// los pagos con tarjeta; nada de transferencias ni tiendas de conveniencia).
const FAQS = [
  {
    question: "¿Cómo reportar una mascota perdida?",
    answer:
      'Ve a la sección "Mascotas Perdidas", presiona el botón "+" y completa el formulario con fotos y ubicación.',
  },
  {
    question: "¿Qué es el Michi-Tracker Pro?",
    answer:
      "Es nuestro sistema premium de rastreo GPS para mascotas: lo activas desde la ficha de tu mascota y puedes gestionar o cancelar la suscripción cuando quieras.",
  },
  {
    question: "¿Cómo puedo adoptar?",
    answer:
      "Explora las mascotas en adopción, elige una y presiona «¡Quiero Adoptar!» en su ficha para iniciar el proceso.",
  },
  {
    question: "Métodos de pago aceptados",
    answer: "Aceptamos tarjetas de crédito y débito a través de Stripe.",
  },
];

type Contact = {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  url: string;
};

// Si el sistema no puede abrir el enlace, se avisa: un contacto silencioso no sirve
function open(url: string) {
  try {
    if (/^https?:/i.test(url)) {
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (!w) throw new Error("No se pudo abrir");
    } else {
      window.location.href = url;
    }
  } catch {
    showAlert({
      type: "info",
      title: "No se pudo abrir el enlace",
      message: "Inténtalo de nuevo o escríbenos directo a " + SUPPORT_EMAIL + ".",
    });
  }
}

export default function AyudaPage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const normalized = query.trim().toLowerCase();
  const faqs = normalized
    ? FAQS.filter(
        (f) =>
          f.question.toLowerCase().includes(normalized) ||
          f.answer.toLowerCase().includes(normalized),
      )
    : FAQS;

  const contacts: Contact[] = [
    ...(SUPPORT_WHATSAPP
      ? [{
          key: "whatsapp",
          label: "WhatsApp",
          icon: MessageCircle,
          color: "var(--color-success)",
          url: `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`,
        }]
      : []),
    {
      key: "email",
      label: "Correo",
      icon: Mail,
      color: "var(--color-info)",
      url: `mailto:${SUPPORT_EMAIL}?subject=Ayuda%20Michicondrias`,
    },
    ...(SUPPORT_PHONE
      ? [{
          key: "phone",
          label: "Teléfono",
          icon: Phone,
          color: "var(--color-secondary)",
          url: `tel:${SUPPORT_PHONE}`,
        }]
      : []),
  ];

  return (
    <ScreenContainer>
      <ScreenHeader title="Centro de Ayuda" />

      <div className={s.searchWrap}>
        <SearchBar
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            setExpanded(null);
          }}
          placeholder="Busca una solución..."
        />
      </div>

      <div className={s.scroll}>
        <section className={s.section}>
          <SectionHeader title="PREGUNTAS FRECUENTES" overline />
          <div className={s.faqCard}>
            {faqs.length === 0 && (
              <EmptyState
                icon={<Search size={28} />}
                title="Sin resultados"
                subtitle="No encontramos preguntas con esa búsqueda."
              />
            )}
            {faqs.map((faq, index) => {
              const isOpen = expanded === index;
              return (
                <div key={faq.question} className={s.faqItemWrap}>
                  <button
                    type="button"
                    className={s.faqItem}
                    onClick={() => setExpanded(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className={s.faqQuestion}>{faq.question}</span>
                    <ChevronRight
                      size={18}
                      className={`${s.faqChevron} ${isOpen ? s.faqChevronOpen : ""}`}
                      aria-hidden
                    />
                  </button>
                  {isOpen && <p className={s.faqAnswer}>{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className={s.section}>
          <SectionHeader title="CONTACTO DIRECTO" overline />
          <div className={s.contactGrid}>
            {contacts.map(({ key, label, icon: Icon, color, url }) => (
              <button
                key={key}
                type="button"
                className={s.contactBtn}
                style={{ "--c": color } as CSSProperties}
                onClick={() => open(url)}
                aria-label={`Contactar por ${label}`}
              >
                <span className={s.iconBoxWrap}>
                  <Icon size={24} color={color} />
                </span>
                <span className={s.contactLabel}>{label}</span>
              </button>
            ))}
          </div>
        </section>

        {!!TERMS_URL && (
          <button type="button" className={s.footerCard} onClick={() => open(TERMS_URL)}>
            <ExternalLink size={20} className={s.footerIcon} aria-hidden />
            <span className={s.footerCardText}>Términos y Condiciones</span>
            <ChevronRight size={18} className={s.muted} aria-hidden />
          </button>
        )}
        {!!PRIVACY_URL && (
          <button type="button" className={s.footerCard} onClick={() => open(PRIVACY_URL)}>
            <ShieldCheck size={20} className={s.footerIcon} aria-hidden />
            <span className={s.footerCardText}>Aviso de Privacidad</span>
            <ChevronRight size={18} className={s.muted} aria-hidden />
          </button>
        )}
      </div>
    </ScreenContainer>
  );
}
