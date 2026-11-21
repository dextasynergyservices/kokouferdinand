"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export function SplitTextReveal({
  as = "h1",
  children,
  className,
  delay = 0,
  immediate = false,
}: {
  as?: "h1" | "h2" | "h3" | "p" | "div";
  children: string;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
      });

      gsap.from(split.lines, {
        yPercent: 105,
        opacity: 0,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.08,
        delay,
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            }),
      });

      return () => {
        split.revert();
      };
    },
    { scope: containerRef },
  );

  const Tag = as;
  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        containerRef.current = node;
      }}
      className={className}
    >
      {children}
    </Tag>
  );
}
