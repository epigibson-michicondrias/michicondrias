"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/** Alto del menú fijo: los saltos a una sección lo descuentan. */
const NAV_OFFSET = -72;

let lenis: Lenis | null = null;

/** Lleva la página a `top` con el scroll suave si está activo, o con el nativo si no. */
export function scrollToY(top: number) {
  if (lenis) lenis.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: "smooth" });
}

/** Scroll suave (Lenis) en la landing. Se apaga si la persona pidió reducir el movimiento. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, anchors: { offset: NAV_OFFSET } });
    lenis = instance;
    // Lenis necesita el control del scroll; el `scroll-behavior: smooth` global lo estorbaría.
    document.documentElement.style.scrollBehavior = "auto";

    let frame = requestAnimationFrame(function loop(time) {
      instance.raf(time);
      frame = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis = null;
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return null;
}
