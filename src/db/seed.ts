import { eq } from "drizzle-orm";
import { db } from "./index";
import { artworkMedia, artworks, exhibitions, pressItems, sitePages, videos } from "./schema";

async function seedSitePages() {
  const pages: Array<typeof sitePages.$inferInsert> = [
    {
      key: "home",
      content: {
        heroTitle: {
          fr: "Kokou Ferdinand Makouvia",
          en: "Kokou Ferdinand Makouvia",
          es: "Kokou Ferdinand Makouvia",
        },
        heroSubtitle: {
          fr: "Sculpture, installation & matière vive — Lomé / Paris / Amsterdam",
          en: "Sculpture, installation & living matter — Lomé / Paris / Amsterdam",
          es: "Escultura, instalación y materia viva — Lomé / París / Ámsterdam",
        },
        statement: {
          fr: "Empreint de l'animisme de sa culture d'origine et d'une profonde spiritualité, Kokou Ferdinand Makouvia fait de la résistance du matériau une force créatrice, du hasard un défi personnel, et de l'accident une réponse de la matière à intégrer à l'œuvre.",
          en: "Influenced by the animism of his native culture and a profound spirituality, Kokou Ferdinand Makouvia turns the resistance of matter into a creative force, chance into a personal challenge, and accidents into a response from the material integrated into the work.",
          es: "Impregnado del animismo de su cultura de origen y de una profunda espiritualidad, Kokou Ferdinand Makouvia convierte la resistencia del material en fuerza creadora, el azar en desafío personal y el accidente en una respuesta de la materia integrada en la obra.",
        },
      },
    },
    {
      key: "about",
      content: {
        headline: {
          fr: "Entre matérialité et sensibilité",
          en: "Between materiality and sensitivity",
          es: "Entre materialidad y sensibilidad",
        },
        biography: {
          fr: "Infatigable voyageur, Kokou Ferdinand Makouvia (né en 1989 à Lomé, Togo) se nourrit de ses explorations du monde pour enrichir sa pratique. Son cheminement artistique est en forme de main tendue, cherchant obstinément à (ré)concilier l'ici et l'ailleurs : soi et l'autre, le proche et le lointain, la mémoire des origines et l'histoire de leur effacement, la spiritualité des ancêtres et la philosophie à venir — ce tout indissociable qui compose chaque être humain, le fragmente, et avec lequel il faut, avec rage et tendresse, inlassablement vivre.\n\nEmpreint de l'animisme de sa culture d'origine et d'une profonde spiritualité, le sculpteur développe une philosophie toute personnelle, entre matérialité et sensibilité : faire de la résistance du matériau une force créatrice, du hasard un défi personnel, de l'accident une réponse de la matière à intégrer à l'œuvre. En parallèle, il développe une pratique de la performance, des ré-actions au monde et aux choses, souvent dans la rue, toujours impromptues.\n\nFormé aux Beaux-Arts de Valenciennes puis aux Beaux-Arts de Paris (DNSAP, 2019), après des études d'art à Abidjan et une licence en télécommunications à Lomé, il intègre la résidence De Ateliers à Amsterdam (2019–2021). Lauréat du Prix Révélation ADAGP (2017) et du Salomon Foundation Residency Award (2021), il rejoint en 2023 l'ISCP à New York. En 2020, il cofonde la résidence multidisciplinaire ArtMéssiamé à Lomé.",
          en: "A tireless traveler, Kokou Ferdinand Makouvia (b. 1989, Lomé, Togo) draws on his explorations of the world to enrich his practice. His artistic journey takes the form of an outstretched hand, stubbornly seeking to (re)concile the here and the elsewhere: self and other, near and far, the memory of origins and the history of their erasure, the spirituality of ancestors and the philosophy to come — that inseparable whole that makes up every human being, fragments them, and with which we must, with rage and tenderness, tirelessly live.\n\nInfluenced by the animism of his native culture and a profound spirituality, the sculptor has developed a deeply personal philosophy between materiality and sensitivity: turning the resistance of matter into a creative force, chance into a personal challenge, and accidents into a response from the material to be integrated into the work. Alongside sculpture, he develops a practice of impromptu street performances and physical reactions to the world.\n\nTrained at the Beaux-Arts in Valenciennes and Paris (DNSAP, 2019), following art studies in Abidjan and a degree in telecommunications in Lomé, he attended De Ateliers in Amsterdam (2019–2021). Recipient of the ADAGP Revelation Award (2017) and the Salomon Foundation Residency Award (2021), he joined ISCP in New York in 2023. In 2020, he co-founded the multidisciplinary ArtMéssiamé residency in Lomé.",
          es: "Viajero incansable, Kokou Ferdinand Makouvia (nacido en 1989 en Lomé, Togo) se nutre de sus exploraciones del mundo para enriquecer su práctica. Su trayectoria artística adopta la forma de una mano tendida que busca obstinadamente (re)conciliar el aquí y el allá: el yo y el otro, lo cercano y lo lejano, la memoria de los orígenes y la historia de su borrado, la espiritualidad de los ancestros y la filosofía por venir.\n\nImpregnado del animismo de su cultura y de una profunda espiritualidad, el escultor desarrolla una filosofía personal entre materialidad y sensibilidad: hacer de la resistencia del material una fuerza creadora, del azar un desafío personal y del accidente una respuesta de la materia integrada en la obra.\n\nFormado en las Bellas Artes de Valenciennes y de París (DNSAP, 2019), tras estudios de arte en Abiyán y telecomunicaciones en Lomé, cursó la residencia De Ateliers en Ámsterdam (2019–2021). Galardonado con el Premio Révélation ADAGP (2017) y el Salomon Foundation Residency Award (2021), participó en la residencia ISCP de Nueva York en 2023 y cofundó la residencia ArtMéssiamé en Lomé en 2020.",
        },
        representation: {
          fr: "Représenté par la Galerie Sator (Paris & Komunuma Romainville). Collections publiques : FRAC Picardie, FRAC Pays de la Loire, CNAP (Centre national des arts plastiques).",
          en: "Represented by Galerie Sator (Paris & Komunuma Romainville). Public collections: FRAC Picardie, FRAC Pays de la Loire, CNAP (Centre national des arts plastiques).",
          es: "Representado por Galerie Sator (París y Komunuma Romainville). Colecciones públicas: FRAC Picardie, FRAC Pays de la Loire, CNAP.",
        },
      },
    },
    {
      key: "contact",
      content: {
        headline: {
          fr: "Contact & Demandes",
          en: "Contact & Enquiries",
          es: "Contacto y Consultas",
        },
        intro: {
          fr: "Pour toute demande d'acquisition, de prêt institutionnel, de dossier de presse ou de visite d'atelier, veuillez contacter l'atelier ou la Galerie Sator.",
          en: "For acquisitions, institutional loans, press dossiers, or studio visits, please contact the studio or Galerie Sator.",
          es: "Para adquisiciones, préstamos institucionales, dosieres de prensa o visitas al taller, póngase en contacto con el estudio o la Galerie Sator.",
        },
        studioLocation: {
          fr: "Atelier — Paris, France / Amsterdam, Pays-Bas",
          en: "Studio — Paris, France / Amsterdam, Netherlands",
          es: "Estudio — París, Francia / Ámsterdam, Países Bajos",
        },
        galleryContact: {
          fr: "Galerie Sator — 8 passage des Gravilliers, 75003 Paris & Komunuma, Romainville",
          en: "Galerie Sator — 8 passage des Gravilliers, 75003 Paris & Komunuma, Romainville",
          es: "Galerie Sator — 8 passage des Gravilliers, 75003 París y Komunuma, Romainville",
        },
      },
    },
    {
      key: "global",
      content: {
        artistName: {
          fr: "Kokou Ferdinand Makouvia",
          en: "Kokou Ferdinand Makouvia",
          es: "Kokou Ferdinand Makouvia",
        },
        footerNote: {
          fr: "© Kokou Ferdinand Makouvia. Tous droits réservés.",
          en: "© Kokou Ferdinand Makouvia. All rights reserved.",
          es: "© Kokou Ferdinand Makouvia. Todos los derechos reservados.",
        },
      },
    },
  ];

  for (const page of pages) {
    const existing = await db.query.sitePages.findFirst({ where: eq(sitePages.key, page.key) });
    if (existing) {
      await db
        .update(sitePages)
        .set({ content: page.content, updatedAt: new Date() })
        .where(eq(sitePages.key, page.key));
    } else {
      await db.insert(sitePages).values(page);
    }
  }
  console.log("Synced site_pages with Galerie Sator biography.");
}

async function seedArtworks() {
  // Clean old placeholder slugs if present
  for (const oldSlug of [
    "sentinelle-de-fer-i",
    "cartographie-des-cendres",
    "membrane-et-memoire-iii",
  ]) {
    await db.delete(artworks).where(eq(artworks.slug, oldSlug));
  }

  const realWorks = [
    {
      slug: "meuble-fondant",
      title: {
        fr: "Meuble fondant",
        en: "Meuble fondant (Melting Furniture)",
        es: "Meuble fondant (Mueble fundente)",
      },
      series: "L'Alambic cosmique",
      year: 2026,
      medium: {
        fr: "Techniques mixtes, terre, cire et métal",
        en: "Mixed media, earth, wax, and metal",
        es: "Técnica mixta, tierra, cera y metal",
      },
      dimensions: "49 × 40 × 35 cm",
      description: {
        fr: "Présentée dans le cadre de « L'Alambic cosmique de la métamorphose » à la Galerie Sator, cette sculpture capture l'instant de bascule entre rigidité domestique et liquéfaction organique de la matière.",
        en: "Presented in 'L'Alambic cosmique de la métamorphose' at Galerie Sator, this sculpture captures the threshold between domestic rigidity and the organic liquefaction of matter.",
        es: "Presentada en 'L'Alambic cosmique de la métamorphose' en la Galerie Sator, esta escultura captura el umbral entre la rigidez doméstica y la licuefacción orgánica de la materia.",
      },
      provenance: {
        fr: "Galerie Sator, Paris",
        en: "Galerie Sator, Paris",
        es: "Galerie Sator, París",
      },
      availability: "on_request" as const,
      featured: true,
      sortOrder: 1,
      status: "published" as const,
      imageUrl: "/images/artworks/meuble-fondant.jpg",
      r2Key: "seed/meuble-fondant.jpg",
    },
    {
      slug: "temporary-exposure",
      title: {
        fr: "Temporary Exposure",
        en: "Temporary Exposure",
        es: "Temporary Exposure",
      },
      series: "Œuvres sur papier",
      year: 2024,
      medium: {
        fr: "Pastel, crayon et stylo bille sur papier",
        en: "Pastel, pencil, and ballpoint pen on paper",
        es: "Pastel, lápiz y bolígrafo sobre papel",
      },
      dimensions: "114 × 894 cm",
      description: {
        fr: "Frise monumentale de près de neuf mètres déployant une écriture graphique vibrante où le geste répétitif inscrit la durée, la mémoire et le souffle dans le papier.",
        en: "A monumental nearly nine-meter frieze unfolding a vibrant graphic script where repetitive gesture inscribes duration, memory, and breath into paper.",
        es: "Friso monumental de casi nueve metros que despliega una escritura gráfica vibrante donde el gesto repetitivo inscribe la duración, la memoria y el aliento sobre el papel.",
      },
      provenance: {
        fr: "Galerie Sator, Paris",
        en: "Galerie Sator, Paris",
        es: "Galerie Sator, París",
      },
      availability: "on_request" as const,
      featured: true,
      sortOrder: 2,
      status: "published" as const,
      imageUrl: "/images/artworks/temporary-exposure.jpg",
      r2Key: "seed/temporary-exposure.jpg",
    },
    {
      slug: "lego-blaka",
      title: {
        fr: "Lègô Blaka (La grosse bête attachant la corde)",
        en: "Lègô Blaka (The Great Beast Tying the Rope)",
        es: "Lègô Blaka (La gran bestia atando la cuerda)",
      },
      series: "Dedans, tout se bouscule",
      year: 2022,
      medium: {
        fr: "Fer forgé, cuir, corde, bois et matériaux composites",
        en: "Forged iron, leather, rope, wood, and composite materials",
        es: "Hierro forjado, cuero, cuerda, madera y materiales compuestos",
      },
      dimensions: "Dimensions variables",
      description: {
        fr: "Œuvre emblématique de l'exposition personnelle à la Galerie Sator (Komunuma), mettant en tension la force animale, le lien et l'équilibre précaire des matériaux assemblés.",
        en: "Emblematic work from the solo exhibition at Galerie Sator (Komunuma), placing animal force, binding, and the precarious balance of assembled materials in tension.",
        es: "Obra emblemática de la exposición individual en la Galerie Sator (Komunuma), que pone en tensión la fuerza animal, el vínculo y el equilibrio precario de los materiales ensamblados.",
      },
      provenance: {
        fr: "Galerie Sator, Paris",
        en: "Galerie Sator, Paris",
        es: "Galerie Sator, París",
      },
      availability: "private_collection" as const,
      featured: true,
      sortOrder: 3,
      status: "published" as const,
      imageUrl: "/images/artworks/lego-blaka.jpg",
      r2Key: "seed/lego-blaka.jpg",
    },
    {
      slug: "803-coups-3-noeuds",
      title: {
        fr: "803 coups, 3 nœuds",
        en: "803 Blows, 3 Knots",
        es: "803 golpes, 3 nudos",
      },
      series: "L'Alambic cosmique",
      year: 2026,
      medium: {
        fr: "Métal, fibre, bois et assemblages",
        en: "Metal, fiber, wood, and assemblage",
        es: "Metal, fibra, madera y ensamblajes",
      },
      dimensions: "123 × 95 × 45 cm",
      description: {
        fr: "Travail au long cours amorcé en 2018 et achevé en 2026, où chaque impact et chaque nœud enregistrent physiquement le temps de l'atelier et la résistance de la matière.",
        en: "A long-term work begun in 2018 and completed in 2026, where each strike and knot physically registers studio time and material resistance.",
        es: "Obra de largo aliento iniciada en 2018 y concluida en 2026, donde cada golpe y cada nudo registran físicamente el tiempo del taller y la resistencia de la materia.",
      },
      provenance: {
        fr: "Galerie Sator, Paris",
        en: "Galerie Sator, Paris",
        es: "Galerie Sator, París",
      },
      availability: "available" as const,
      featured: true,
      sortOrder: 4,
      status: "published" as const,
      imageUrl: "/images/artworks/803-coups-3-noeuds.jpg",
      r2Key: "seed/803-coups-3-noeuds.jpg",
    },
    {
      slug: "adovo-noir",
      title: {
        fr: "Adovo noir",
        en: "Adovo noir (Black Adovo)",
        es: "Adovo negro",
      },
      series: "Klidjabadjaba",
      year: 2019,
      medium: {
        fr: "Bois calciné, pigments, métal et textile",
        en: "Charred wood, pigments, metal, and textile",
        es: "Madera carbonizada, pigmentos, metal y textil",
      },
      dimensions: "87 × 65 × 30 cm",
      description: {
        fr: "Issu de la série « Klidjabadjaba », Adovo noir explore la densité du noir, la cicatrice du feu et la présence protectrice des formes rituelles.",
        en: "From the 'Klidjabadjaba' series, Adovo noir explores the density of black, fire-scarred surfaces, and the protective presence of ritual forms.",
        es: "Perteneciente a la serie 'Klidjabadjaba', Adovo negro explora la densidad del negro, las cicatrices del fuego y la presencia protectora de las formas rituales.",
      },
      provenance: {
        fr: "Galerie Sator, Paris",
        en: "Galerie Sator, Paris",
        es: "Galerie Sator, París",
      },
      availability: "on_request" as const,
      featured: true,
      sortOrder: 5,
      status: "published" as const,
      imageUrl: "/images/artworks/adovo-noir.jpg",
      r2Key: "seed/adovo-noir.jpg",
    },
    {
      slug: "adovo-rouge",
      title: {
        fr: "Adovo rouge",
        en: "Adovo rouge (Red Adovo)",
        es: "Adovo rojo",
      },
      series: "Klidjabadjaba",
      year: 2019,
      medium: {
        fr: "Terre, pigments rouges, bois et liens",
        en: "Earth, red pigments, wood, and bindings",
        es: "Tierra, pigmentos rojos, madera y ataduras",
      },
      dimensions: "95 × 68 × 32 cm",
      description: {
        fr: "Contrepoint chromatique d'Adovo noir, cette pièce fait vibrer la terre oxydée et les tensions organiques entre protection et ouverture.",
        en: "A chromatic counterpoint to Adovo noir, resonating with oxidized earth and organic tensions between shelter and openness.",
        es: "Contrapunto cromático de Adovo negro, esta pieza hace vibrar la tierra oxidada y las tensiones orgánicas entre refugio y apertura.",
      },
      provenance: {
        fr: "Galerie Sator, Paris",
        en: "Galerie Sator, Paris",
        es: "Galerie Sator, París",
      },
      availability: "on_request" as const,
      featured: true,
      sortOrder: 6,
      status: "published" as const,
      imageUrl: "/images/artworks/adovo-rouge.jpg",
      r2Key: "seed/adovo-rouge.jpg",
    },
    {
      slug: "the-manuscrit",
      title: {
        fr: "The Manuscrit",
        en: "The Manuscrit",
        es: "The Manuscrit",
      },
      series: "Œuvres sur papier",
      year: 2018,
      medium: {
        fr: "Encre de Chine, carton brûlé et techniques mixtes sur papier",
        en: "Indian ink, burned cardboard, and mixed media on paper",
        es: "Tinta china, cartón quemado y técnica mixta sobre papel",
      },
      dimensions: "390 × 150 cm",
      description: {
        fr: "Partition visuelle de grand format conjuguant traces d'encre, brûlures et signes archaïques comme un manuscrit silencieux de la mémoire collective.",
        en: "A large-scale visual score combining ink traces, burn marks, and archaic signs as a silent manuscript of collective memory.",
        es: "Partitura visual de gran formato que conjuga trazos de tinta, quemaduras y signos arcaicos como un manuscrito silencioso de la memoria colectiva.",
      },
      provenance: {
        fr: "Collection publique / Galerie Sator",
        en: "Public collection / Galerie Sator",
        es: "Colección pública / Galerie Sator",
      },
      availability: "private_collection" as const,
      featured: false,
      sortOrder: 7,
      status: "published" as const,
      imageUrl: "/images/artworks/the-manuscrit.jpg",
      r2Key: "seed/the-manuscrit.jpg",
    },
    {
      slug: "akossiwa-le-temps-dune-routine",
      title: {
        fr: "Akossiwa, le temps d'une routine",
        en: "Akossiwa, the Time of a Routine",
        es: "Akossiwa, el tiempo de una rutina",
      },
      series: "Installations",
      year: 2017,
      medium: {
        fr: "Installation sculpturale, matériaux de récupération, fer et bois",
        en: "Sculptural installation, reclaimed materials, iron, and wood",
        es: "Instalación escultórica, materiales recuperados, hierro y madera",
      },
      dimensions: "Dimensions variables",
      description: {
        fr: "Installation fondatrice récompensée lors de l'émergence de l'artiste, dédiée aux gestes quotidiens, au rythme des corps et à la poétique des objets ordinaires.",
        en: "A foundational sculptural installation dedicated to daily gestures, bodily rhythm, and the poetics of ordinary objects.",
        es: "Instalación escultórica fundacional dedicada a los gestos cotidianos, el ritmo de los cuerpos y la poética de los objetos ordinarios.",
      },
      provenance: {
        fr: "Atelier de l'artiste / Galerie Sator",
        en: "Artist's studio / Galerie Sator",
        es: "Estudio del artista / Galerie Sator",
      },
      availability: "on_request" as const,
      featured: false,
      sortOrder: 8,
      status: "published" as const,
      imageUrl: "/images/artworks/akossiwa-le-temps-dune-routine.jpg",
      r2Key: "seed/akossiwa-le-temps-dune-routine.jpg",
    },
  ];

  for (const w of realWorks) {
    const { imageUrl, r2Key, ...artworkData } = w;
    const existing = await db.query.artworks.findFirst({ where: eq(artworks.slug, w.slug) });
    let artworkId: string;

    if (existing) {
      artworkId = existing.id;
      await db
        .update(artworks)
        .set({ ...artworkData, updatedAt: new Date() })
        .where(eq(artworks.id, existing.id));
    } else {
      const [inserted] = await db
        .insert(artworks)
        .values(artworkData)
        .returning({ id: artworks.id });
      artworkId = inserted.id;
    }

    const existingMedia = await db.query.artworkMedia.findFirst({
      where: eq(artworkMedia.artworkId, artworkId),
    });
    if (!existingMedia) {
      await db.insert(artworkMedia).values({
        artworkId,
        url: imageUrl,
        r2Key,
        alt: w.title,
        width: 1600,
        height: 1200,
        isPrimary: true,
        sortOrder: 0,
      });
    }
  }
  console.log("Seeded 8 authentic Galerie Sator artworks with photography.");
}

async function seedExhibitions() {
  const realExhibitions = [
    {
      slug: "18e-biennale-de-lyon",
      type: "biennale" as const,
      title: {
        fr: "18e Biennale de Lyon — Ontologie du mouvement projeté",
        en: "18th Lyon Biennale — Ontology of Projected Movement",
        es: "18.ª Bienal de Lyon — Ontología del movimiento proyectado",
      },
      venue: "Musée des Tissus et des Arts décoratifs",
      city: "Lyon",
      country: "France",
      startDate: new Date("2026-09-15T00:00:00Z"),
      endDate: new Date("2027-01-03T00:00:00Z"),
      curatorialText: {
        fr: "Projet institutionnel monumental conçu in situ au Musée des Tissus et des Arts décoratifs, explorant la mémoire matérielle, la projection des corps et les gestes de transmission.",
        en: "A site-specific monumental institutional project at the Musée des Tissus et des Arts décoratifs, exploring material memory, projected bodily movement, and gestures of transmission.",
        es: "Proyecto institucional monumental concebido in situ en el Musée des Tissus et des Arts décoratifs, explorando la memoria material y los gestos de transmisión.",
      },
      coverUrl: "/images/artworks/meuble-fondant.jpg",
      isCurrent: true,
      status: "published" as const,
    },
    {
      slug: "lalambic-cosmique-de-la-metamorphose",
      type: "solo" as const,
      title: {
        fr: "L'Alambic cosmique de la métamorphose",
        en: "L'Alambic cosmique de la métamorphose (The Cosmic Alembic of Metamorphosis)",
        es: "El alambique cósmico de la metamorfosis",
      },
      venue: "Galerie Sator",
      city: "Paris",
      country: "France",
      startDate: new Date("2026-04-09T00:00:00Z"),
      endDate: new Date("2026-05-16T00:00:00Z"),
      curatorialText: {
        fr: "Exposition personnelle réunissant sculptures en céramique, cuivre, terre, cire et dessins monumentaux autour des temporalités cosmiques et de la transformation de la matière.",
        en: "Solo exhibition bringing together ceramic, copper, earth, and wax sculptures alongside monumental drawings exploring cosmic temporalities and material transformation.",
        es: "Exposición individual que reúne esculturas en cerámica, cobre, tierra y cera junto a dibujos monumentales en torno a las temporalidades cósmicas.",
      },
      coverUrl: "/images/artworks/803-coups-3-noeuds.jpg",
      isCurrent: false,
      status: "published" as const,
    },
    {
      slug: "dedans-tout-se-bouscule",
      type: "solo" as const,
      title: {
        fr: "Dedans, tout se bouscule comme de petits monstres que la lumière a réveillés par surprise",
        en: "Inside, Everything Jostles Like Little Monsters Surprised Awake by the Light",
        es: "Adentro, todo se agita como pequeños monstruos despertados por sorpresa por la luz",
      },
      venue: "Galerie Sator — Komunuma",
      city: "Romainville",
      country: "France",
      startDate: new Date("2022-09-11T00:00:00Z"),
      endDate: new Date("2022-10-29T00:00:00Z"),
      curatorialText: {
        fr: "Exposition personnelle d'envergure à Komunuma, déployant un écosystème de sculptures hybrides, de liens tendus et de présences animistes.",
        en: "Major solo exhibition at Komunuma unfolding an ecosystem of hybrid sculptures, taut bindings, and animist presences.",
        es: "Exposición individual en Komunuma que despliega un ecosistema de esculturas híbridas, ataduras tensas y presencias animistas.",
      },
      coverUrl: "/images/artworks/lego-blaka.jpg",
      isCurrent: false,
      status: "published" as const,
    },
    {
      slug: "of-the-earth-the-merchant-house",
      type: "solo" as const,
      title: {
        fr: "Of the Earth",
        en: "Of the Earth",
        es: "Of the Earth (De la tierra)",
      },
      venue: "The Merchant House",
      city: "Amsterdam",
      country: "Netherlands",
      startDate: new Date("2021-11-19T00:00:00Z"),
      endDate: new Date("2022-02-26T00:00:00Z"),
      curatorialText: {
        fr: "Exposition personnelle marquant l'issue de la résidence à De Ateliers, dédiée au dialogue entre terre, architecture et mémoire corporelle.",
        en: "Solo exhibition marking the culmination of the De Ateliers residency, dedicated to the dialogue between earth, architecture, and bodily memory.",
        es: "Exposición individual que marca la culminación de la residencia en De Ateliers, dedicada al diálogo entre la tierra, la arquitectura y la memoria corporal.",
      },
      coverUrl: "/images/artworks/temporary-exposure.jpg",
      isCurrent: false,
      status: "published" as const,
    },
    {
      slug: "klidjabadjaba-galerie-sator",
      type: "solo" as const,
      title: {
        fr: "Klidjabadjaba",
        en: "Klidjabadjaba",
        es: "Klidjabadjaba",
      },
      venue: "Galerie Sator",
      city: "Paris",
      country: "France",
      startDate: new Date("2019-10-12T00:00:00Z"),
      endDate: new Date("2019-11-23T00:00:00Z"),
      curatorialText: {
        fr: "Première exposition personnelle majeure avec la Galerie Sator, révélant les séries Adovo et les assemblages de bois calciné, fer et pigments.",
        en: "First major solo exhibition with Galerie Sator, unveiling the Adovo series and assemblages of charred wood, iron, and raw pigments.",
        es: "Primera exposición individual con la Galerie Sator, revelando la serie Adovo y ensamblajes de madera carbonizada, hierro y pigmentos.",
      },
      coverUrl: "/images/artworks/adovo-noir.jpg",
      isCurrent: false,
      status: "published" as const,
    },
  ];

  // Remove old placeholder exhibition if present
  await db.delete(exhibitions).where(eq(exhibitions.slug, "galerie-sator-matiere-vive"));

  for (const ex of realExhibitions) {
    const existing = await db.query.exhibitions.findFirst({ where: eq(exhibitions.slug, ex.slug) });
    if (existing) {
      await db
        .update(exhibitions)
        .set({ ...ex, updatedAt: new Date() })
        .where(eq(exhibitions.id, existing.id));
    } else {
      await db.insert(exhibitions).values(ex);
    }
  }
  console.log("Synced authentic exhibitions.");
}

async function seedVideos() {
  await db.delete(videos).where(eq(videos.slug, "atelier-paris-processus"));

  const realVideos = [
    {
      slug: "galerie-sator-portrait-atelier",
      title: {
        fr: "Kokou Ferdinand Makouvia — Portrait d'atelier & exposition (Galerie Sator)",
        en: "Kokou Ferdinand Makouvia — Studio Portrait & Exhibition (Galerie Sator)",
        es: "Kokou Ferdinand Makouvia — Retrato de taller y exposición (Galerie Sator)",
      },
      description: {
        fr: "Entretien et visite filmée autour de la pratique sculpturale, des matériaux bruts et des installations de Kokou Ferdinand Makouvia.",
        en: "Filmed conversation and studio visit exploring Kokou Ferdinand Makouvia's sculptural practice, raw materials, and installations.",
        es: "Entrevista y visita filmada sobre la práctica escultórica, los materiales brutos y las instalaciones de Kokou Ferdinand Makouvia.",
      },
      sourceType: "external_link" as const,
      externalUrl: "https://www.youtube.com/watch?v=RKg3Ner_hCY",
      posterUrl: "/images/artworks/lego-blaka.jpg",
      duration: "05:12",
      year: 2024,
      featured: true,
      sortOrder: 1,
      status: "published" as const,
    },
  ];

  await db.insert(videos).values(realVideos).onConflictDoNothing({ target: videos.slug });
  console.log("Synced videos.");
}

async function seedPress() {
  const articles = [
    {
      slug: "alambic-cosmique-de-la-metamorphose-galerie-sator",
      title: {
        fr: "L'Alambic cosmique de la métamorphose à la Galerie Sator",
        en: "The Cosmic Alembic of Metamorphosis at Galerie Sator",
        es: "El alambique cósmico de la metamorfosis en la Galerie Sator",
      },
      publication: "Slash Paris",
      publishedDate: new Date("2026-04-12T00:00:00Z"),
      externalUrl: "https://www.galeriesator.com/artists/25-kokou-ferdinand-makouvia/",
      coverUrl: "/images/artworks/meuble-fondant.jpg",
      excerpt: {
        fr: "Kokou Ferdinand Makouvia compose à la Galerie Sator un parcours immersif où céramiques, cuivre, cire et grands dessins dialoguent avec l'invisible.",
        en: "At Galerie Sator, Kokou Ferdinand Makouvia composes an immersive journey where ceramics, copper, wax, and monumental drawings dialogue with the invisible.",
        es: "En la Galerie Sator, Kokou Ferdinand Makouvia compone un recorrido inmersivo donde cerámica, cobre, cera y dibujos dialogan con lo invisible.",
      },
      body: {
        fr: "Pour sa nouvelle exposition personnelle à la Galerie Sator, Kokou Ferdinand Makouvia conçoit l'espace comme un laboratoire sensible où la matière n'est jamais figée. Céramiques, cuivre, terre crue, cire et grands dessins sur papier y composent une cosmogonie intime.\n\nFidèle à son approche nourrie d'animisme et d'observation quotidienne, l'artiste travaille à partir de la résistance même des matériaux. Chaque pièce porte la trace d'un dialogue physique — coups, nœuds, brûlures, tensions — où l'accident devient une réponse active de la matière.\n\nEntre sculptures organiques comme « Meuble fondant » et ensembles rituels tels que « Aze Ze Ame Adre », l'exposition invite le visiteur à ralentir et à ressentir la présence silencieuse des formes dans l'espace.",
        en: "For his solo exhibition at Galerie Sator, Kokou Ferdinand Makouvia conceives the gallery as a tactile laboratory where matter is never static. Ceramics, copper, raw earth, wax, and monumental works on paper form an intimate cosmogony.\n\nTrue to a practice rooted in animist thought and close physical observation, the artist works directly with material resistance. Each piece registers a bodily exchange—strikes, knots, burns, and tensions—where accidents become matter's own active reply.\n\nMoving between organic sculptures such as 'Meuble fondant' and ritual ensembles like 'Aze Ze Ame Adre', the exhibition invites visitors to slow down and feel the quiet presence of form in space.",
        es: "Para su exposición individual en la Galerie Sator, Kokou Ferdinand Makouvia concibe el espacio como un laboratorio táctil donde la materia nunca permanece inmóvil. Cerámica, cobre, tierra, cera y grandes dibujos sobre papel componen una cosmogonía íntima.\n\nFiel a una práctica nutrida por el animismo y la observación física, el artista trabaja con la resistencia misma de los materiales. Cada pieza registra un intercambio corporal —golpes, nudos, quemaduras, tensiones— donde el accidente se convierte en respuesta activa de la materia.",
      },
      featured: true,
      status: "published" as const,
    },
    {
      slug: "resistance-de-la-matiere-force-creatrice",
      title: {
        fr: "Kokou Ferdinand Makouvia : faire de la résistance de la matière une force créatrice",
        en: "Kokou Ferdinand Makouvia: Turning Material Resistance into a Creative Force",
        es: "Kokou Ferdinand Makouvia: convertir la resistencia de la materia en fuerza creadora",
      },
      publication: "Biennale de Lyon / Galerie Sator",
      publishedDate: new Date("2026-09-18T00:00:00Z"),
      externalUrl: "https://www.galeriesator.com/artists/25-kokou-ferdinand-makouvia/",
      coverUrl: "/images/artworks/lego-blaka.jpg",
      excerpt: {
        fr: "Retour sur le parcours de l'artiste entre Lomé, Paris et Amsterdam, et sur son installation monumentale pour la 18e Biennale de Lyon.",
        en: "A look at the artist's trajectory between Lomé, Paris, and Amsterdam, and his monumental installation for the 18th Lyon Biennale.",
        es: "Un recorrido por la trayectoria del artista entre Lomé, París y Ámsterdam, y su instalación monumental para la 18.ª Bienal de Lyon.",
      },
      body: {
        fr: "Né à Lomé en 1989 et diplômé des Beaux-Arts de Paris après un passage à Abidjan, Valenciennes puis De Ateliers à Amsterdam, Kokou Ferdinand Makouvia développe une œuvre sculpturale immédiatement reconnaissable par sa densité physique.\n\nÀ l'occasion de la 18e Biennale de Lyon, son projet « Ontologie du mouvement projeté » au Musée des Tissus et des Arts décoratifs déploie une architecture de tensions où le fer, le bois, la terre et le textile dialoguent avec la mémoire des lieux.\n\nCofondateur de la résidence ArtMéssiamé à Lomé et présent dans les collections du CNAP et des FRAC, Makouvia poursuit patiemment son geste de main tendue entre les géographies et les mémoires.",
        en: "Born in Lomé in 1989 and a graduate of the Beaux-Arts de Paris after studying in Abidjan, Valenciennes, and De Ateliers in Amsterdam, Kokou Ferdinand Makouvia has forged a sculptural language immediately recognizable for its physical density.\n\nFor the 18th Lyon Biennale, his site-specific project 'Ontology of Projected Movement' at the Musée des Tissus et des Arts décoratifs unfolds an architecture of tension where iron, wood, earth, and textile converse with institutional memory.\n\nCo-founder of the ArtMéssiamé residency in Lomé and held in the collections of CNAP and French FRACs, Makouvia patiently extends his practice as an outstretched hand across geographies and histories.",
        es: "Nacido en Lomé en 1989 y graduado en las Bellas Artes de París tras pasar por Abiyán, Valenciennes y De Ateliers en Ámsterdam, Kokou Ferdinand Makouvia desarrolla una obra escultórica reconocible por su densidad física.\n\nCon motivo de la 18.ª Bienal de Lyon, su proyecto 'Ontología del movimiento proyectado' en el Musée des Tissus et des Arts décoratifs despliega una arquitectura de tensiones donde el hierro, la madera, la tierra y el textil dialogan con la memoria del lugar.",
      },
      featured: true,
      status: "published" as const,
    },
  ];

  // Clear legacy press rows without slugs
  await db.delete(pressItems);
  await db.insert(pressItems).values(articles);
  console.log("Seeded hosted press articles with full FR/EN/ES bodies.");
}

async function main() {
  await seedSitePages();
  await seedArtworks();
  await seedExhibitions();
  await seedVideos();
  await seedPress();
  console.log("Database seed completed.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
