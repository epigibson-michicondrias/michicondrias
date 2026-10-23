"use client";

import { MotionConfig } from "motion/react";
import Nav from "./Nav";
import Hero from "./Hero";
import Journey from "./Journey";
import Statement from "./Statement";
import ProRail from "./ProRail";
import Faq from "./Faq";
import Footer from "./Footer";
import styles from "./landing.module.css";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <a href="#contenido" className={styles.skip}>
          Saltar al contenido
        </a>
        <Nav />
        <main id="contenido">
          <Hero />
          <Journey />
          <Statement />
          <ProRail />
          <Faq />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
