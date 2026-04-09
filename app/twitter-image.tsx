import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "D-lighter Tutor - Expert Online Tutoring for African Children Ages 3-16 | Personalized Learning"
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = "image/png"

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a5f 0%, #2D5F8A 50%, #F59E0B 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />

        {/* Content Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: 24,
            padding: "50px 70px",
            maxWidth: 950,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Logo/Brand Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "linear-gradient(135deg, #1e3a5f 0%, #2D5F8A 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <span style={{ fontSize: 36, color: "white" }}>📚</span>
            </div>
            <span
              style={{
                fontSize: 40,
                fontWeight: 800,
                background: "linear-gradient(135deg, #1e3a5f 0%, #2D5F8A 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              D-lighter Tutor
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
              margin: 0,
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            Expert Tutors. Personalized Learning. Better Results.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 20,
              color: "#64748b",
              textAlign: "center",
              margin: 0,
              marginBottom: 24,
            }}
          >
            Personalized online tutoring for African children ages 3-16 • Maths, English, Science, Languages
          </p>

          {/* CTA */}
          <div
            style={{
              padding: "14px 36px",
              background: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
              borderRadius: 50,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
              Book Your FREE Trial Today! 🚀
            </span>
          </div>
        </div>

        {/* Website URL */}
        <p
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 18,
            color: "rgba(255,255,255,0.9)",
            fontWeight: 600,
          }}
        >
          d-lightertutor.com
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
