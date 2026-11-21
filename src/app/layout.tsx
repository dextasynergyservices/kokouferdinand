import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kokou Ferdinand Makouvia",
  description:
    "Kokou Ferdinand Makouvia — visual artist (b. 1989, Lomé, Togo; lives and works in Paris). Sculptures, installations, exhibitions, and archival works.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${instrumentSans.variable} ${cormorantGaramond.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-board-100 text-ink-950 antialiased">
        {children}
      </body>
    </html>
  );
}
