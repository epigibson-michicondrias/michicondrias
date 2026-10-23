"use client";

import { MotionConfig } from "motion/react";
import Nav from "./Nav";
import Hero from "./Hero";
import Journey from "./Journey";
import FeatureWheel from "./FeatureWheel";
import FeatureCatalog from "./FeatureCatalog";
import { WHEEL_ITEMS } from "./features";
import Statement from "./Statement";
import DayTimeline from "./DayTimeline";
import Promises from "./Promises";
import AiDemo from "./AiDemo";
import AdoptSteps from "./AdoptSteps";
import AppSection from "./AppSection";
import SmoothScroll from "./smoothScroll";
import ProRail from "./ProRail";
import Faq from "./Faq";
import Footer from "./Footer";
import styles from "./landing.module.css";

export default function Landing() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <div className={styles.page}>
        <a href="#contenido" className={styles.skip}>
          Saltar al contenido
        </a>
        <Nav />
        <main id="contenido">
          <Hero />
          <Journey />
          <FeatureWheel items={WHEEL_ITEMS} label="Michicondrias" />
          <FeatureCatalog />
          <AiDemo />
          <AdoptSteps />
          <DayTimeline />
          <Statement />
          <Promises />
          <ProRail />
          <AppSection />
          <Faq />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
