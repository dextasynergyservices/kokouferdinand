"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import type { AppLocale } from "@/i18n/routing";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type ProcessMove = {
  step: string;
  title: string;
  materialTag: string;
  body: string;
  image: string;
  caption: string;
};

const PROCESS_CONTENT: Record<
  AppLocale,
  {
    heading: string;
    subheading: string;
    moves: ProcessMove[];
  }
> = {
  fr: {
    heading: "De la matière brute à la présence",
    subheading:
      "Faire de la résistance du matériau une force créatrice, du hasard un défi personnel, de l'accident une réponse de la matière.",
    moves: [
      {
        step: "GESTE 01",
        title: "COLLECTE",
        materialTag: "Fer · Cuivre · Terre · Bois",
        body: "Rien n'est inerte. Chaque fragment récupéré porte déjà une mémoire, une usure et une charge invisible.",
        image: "/images/artworks/meuble-fondant.jpg",
        caption: "Meuble fondant, 2026",
      },
      {
        step: "GESTE 02",
        title: "RÉSISTANCE",
        materialTag: "Feu · Frappe · Nœuds",
        body: "Le feu, la frappe répétée et le lien révèlent la volonté du matériau. L'accident devient réponse directe de la matière.",
        image: "/images/artworks/803-coups-3-noeuds.jpg",
        caption: "803 coups, 3 nœuds, 2018–2026",
      },
      {
        step: "GESTE 03",
        title: "TENSION",
        materialTag: "Équilibre · Lien · Gravité",
        body: "Souplesse organique et armature minérale s'affrontent et se soutiennent dans un intervalle précaire.",
        image: "/images/artworks/lego-blaka.jpg",
        caption: "Lègô Blaka, 2022",
      },
      {
        step: "GESTE 04",
        title: "PRÉSENCE",
        materialTag: "Espace · Animisme · Silence",
        body: "Posée dans l'architecture, l'œuvre devient présence — une main tendue entre l'ici et l'ailleurs.",
        image: "/images/artworks/adovo-noir.jpg",
        caption: "Adovo noir, 2019",
      },
    ],
  },
  en: {
    heading: "From raw matter to presence",
    subheading:
      "Turning the resistance of the material into a creative force, chance into a personal challenge, and accidents into an answer from matter itself.",
    moves: [
      {
        step: "MOVE 01",
        title: "GATHERING",
        materialTag: "Iron · Copper · Earth · Wood",
        body: "Nothing is inert. Every reclaimed fragment already carries prior memory, wear, and an invisible charge.",
        image: "/images/artworks/meuble-fondant.jpg",
        caption: "Meuble fondant, 2026",
      },
      {
        step: "MOVE 02",
        title: "RESISTANCE",
        materialTag: "Fire · Strike · Knots",
        body: "Fire, repeated blows, and binding reveal matter's own will. Accidents become the material's direct reply.",
        image: "/images/artworks/803-coups-3-noeuds.jpg",
        caption: "803 coups, 3 nœuds, 2018–2026",
      },
      {
        step: "MOVE 03",
        title: "TENSION",
        materialTag: "Balance · Binding · Gravity",
        body: "Organic suppleness and mineral armature pull against and uphold one another in precarious equilibrium.",
        image: "/images/artworks/lego-blaka.jpg",
        caption: "Lègô Blaka, 2022",
      },
      {
        step: "MOVE 04",
        title: "PRESENCE",
        materialTag: "Space · Animism · Stillness",
        body: "Placed within architecture, the work becomes a presence—an outstretched hand between here and elsewhere.",
        image: "/images/artworks/adovo-noir.jpg",
        caption: "Adovo noir, 2019",
      },
    ],
  },
  es: {
    heading: "De la materia bruta a la presencia",
    subheading:
      "Hacer de la resistencia del material una fuerza creadora, del azar un desafío personal y del accidente una respuesta de la materia.",
    moves: [
      {
        step: "GESTO 01",
        title: "RECOLECCIÓN",
        materialTag: "Hierro · Cobre · Tierra · Madera",
        body: "Nada es inerte. Cada fragmento recuperado porta ya una memoria, un desgaste y una carga invisible.",
        image: "/images/artworks/meuble-fondant.jpg",
        caption: "Meuble fondant, 2026",
      },
      {
        step: "GESTO 02",
        title: "RESISTENCIA",
        materialTag: "Fuego · Golpe · Nudos",
        body: "El fuego, el golpe repetido y la atadura revelan la voluntad del material. El accidente es su respuesta.",
        image: "/images/artworks/803-coups-3-noeuds.jpg",
        caption: "803 coups, 3 nœuds, 2018–2026",
      },
      {
        step: "GESTO 03",
        title: "TENSIÓN",
        materialTag: "Equilibrio · Vínculo · Gravedad",
        body: "Flexibilidad orgánica y armadura mineral se enfrentan y se sostienen en un intervalo precario.",
        image: "/images/artworks/lego-blaka.jpg",
        caption: "Lègô Blaka, 2022",
      },
      {
        step: "GESTO 04",
        title: "PRESENCIA",
        materialTag: "Espacio · Animismo · Silencio",
        body: "Instalada en la arquitectura, la obra se vuelve presencia: una mano tendida entre el aquí y el allá.",
        image: "/images/artworks/adovo-noir.jpg",
        caption: "Adovo noir, 2019",
      },
    ],
  },
};

/**
 * Modeled directly after relevovinco.com's "Flat to Finished in Four Moves":
 * A deep dark die-cut horizontal cavity window housing 4 raised raw-board cards
 * that glide smoothly as you scroll (desktop) or swipe cleanly (mobile).
 */
export function MatterProcessBand({ locale }: { locale: AppLocale }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const content = PROCESS_CONTENT[locale];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        const viewport = viewportRef.current;
        if (!track || !viewport) return;

        const getDistance = () => {
          const styles = window.getComputedStyle(viewport);
          const padX =
            Number.parseFloat(styles.paddingLeft || "0") +
            Number.parseFloat(styles.paddingRight || "0");
          const innerWidth = viewport.clientWidth - padX;
          return Math.max(0, track.scrollWidth - innerWidth);
        };

        gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 64px",
            end: () => `+=${Math.max(600, getDistance() * 1.2)}`,
            scrub: 0.65,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="py-10 lg:py-14">
      <div className="mb-6 grid gap-4 lg:mb-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h2 className="debossed-heading font-serif text-3xl font-semibold uppercase leading-[0.98] tracking-tight text-ink-950 sm:text-5xl lg:text-5xl">
            {content.heading}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-600 lg:col-span-5 lg:ml-auto">
          {content.subheading}
        </p>
      </div>

      {/* Deep Dark Die-Cut Horizontal Cavity Window */}
      <div
        ref={viewportRef}
        className="cavity-dark overflow-x-auto p-4 sm:p-5 lg:overflow-hidden lg:p-6"
      >
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-5 lg:w-max lg:snap-none lg:gap-6"
        >
          {content.moves.map((move) => (
            <article
              key={move.step}
              className="relief-slab paper-grain flex w-[82vw] shrink-0 snap-center flex-col justify-between bg-board-100 p-5 sm:w-[370px] lg:w-[400px] lg:p-6"
            >
              <div className="space-y-2.5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-oxide">
                  {move.step}
                </p>
                <h3 className="debossed-heading font-serif text-2xl font-semibold uppercase tracking-wide text-ink-950 sm:text-[1.75rem]">
                  {move.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-600">{move.body}</p>
              </div>

              <div className="mt-5 space-y-2">
                <div className="relief-well overflow-hidden bg-board-200/80 p-1.5">
                  <div className="aspect-[16/10] overflow-hidden rounded-[4px] bg-board-100">
                    {/* biome-ignore lint/performance/noImgElement: Tactile process plate inside horizontal board card. */}
                    <img
                      src={move.image}
                      alt={move.caption}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  <span>{move.caption}</span>
                  <span>{move.materialTag.split("·")[0]?.trim()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
