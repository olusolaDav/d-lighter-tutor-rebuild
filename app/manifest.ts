import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "D-lighter Tutor - Online Tutoring for African Children",
    short_name: "D-lighter Tutor",
    description:
      "Quality online tutoring for Nigerian and African children aged 3-16. Expert tutors for Maths, English, Science, African Languages, Coding, and Music.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
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
