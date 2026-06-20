"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = "[data-reveal], [data-reveal-group] > *";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));

    elements.forEach((element) => {
      element.classList.add("reveal-ready");

      const parent = element.parentElement;
      if (parent?.hasAttribute("data-reveal-group")) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(element);
        element.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 80}ms`);
      }
    });

    if (reducedMotion) {
      elements.forEach((element) => element.classList.add("reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -9% 0px",
        threshold: 0.08,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
