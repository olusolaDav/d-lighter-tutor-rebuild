import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D-lighter Tutor - Expert Online Tutoring for African Children Ages 3-16",
    short_name: "D-lighter Tutor",
    description:
      "Expert personalized online tutoring for Nigerian and African children aged 3-16. Qualified tutors for Mathematics, English, Science, Yoruba, Igbo, Hausa, Coding, Music, and exam preparation (11+, GCSE, SAT, IGCSE).",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2D5F8A",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    categories: ["education", "kids"],
    icons: [
      {
        src: "/brand-logo-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand-logo-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    screenshots: [
      {
        src: "/images/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "D-lighter Tutor Homepage",
      },
      {
        src: "/images/screenshot-narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "D-lighter Tutor Mobile View",
      },
    ],
  }
}
