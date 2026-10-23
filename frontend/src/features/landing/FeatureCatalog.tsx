"use client";

import type { PointerEvent } from "react";
import shared from "./landing.module.css";
import { Rise } from "./effects";
import styles from "./FeatureCatalog.module.css";
import { FEATURE_GROUPS } from "./features";

/** El brillo dorado sigue al cursor sobre cada tarjeta: se guarda la posición en variables CSS. */
function trackPointer(event: PointerEvent<HTMLElement>) {
  const card = (event.target as HTMLElement).closest<HTMLElement>(`.${styles.card}`);
  if (!card) return;
  const box = card.getBoundingClientRect();
  card.style.setProperty("--x", `${event.clientX - box.left}px`);
  card.style.setProperty("--y", `${event.clientY - box.top}px`);
}

export default function FeatureCatalog() {
  const total = FEATURE_GROUPS.reduce((n, g) => n + g.features.length, 0);

  return (
    <section id="funciones" className={styles.section} aria-labelledby="funciones-title">
      <div className={shared.container}>
        <header className={styles.head}>
          <Rise id="funciones-title" text={`${total} funciones, una sola app`} className={shared.sectionTitle} />
          <p className={shared.sectionLead}>
            Desde el primer día en casa hasta la última despedida. Esto es todo lo que puedes hacer hoy.
          </p>
        </header>

        {FEATURE_GROUPS.map((group) => (
          <div key={group.id} className={styles.group} aria-labelledby={`grupo-${group.id}`}>
            <div className={styles.groupHead}>
              <h3 id={`grupo-${group.id}`} className={styles.groupTitle}>
                {group.title}
              </h3>
              <p className={styles.groupLead}>{group.lead}</p>
            </div>

            <ul className={styles.grid} onPointerMove={trackPointer}>
              {group.features.map(({ icon: Icon, title, text, badge }) => (
                <li key={title} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.icon}>
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    {badge && <span className={styles.badge}>{badge}</span>}
                  </div>
                  <h4 className={styles.cardTitle}>{title}</h4>
                  <p className={styles.cardText}>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
