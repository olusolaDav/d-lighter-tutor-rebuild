import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "D-lighter Tutor - Quality Online Tutoring for African Children"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function OGImage() {
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
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
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
            padding: "60px 80px",
            maxWidth: 1000,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Logo/Brand Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 20,
              }}
            >
              <span style={{ fontSize: 48, color: "white" }}>📚</span>
            </div>
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
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
              fontSize: 44,
              fontWeight: 700,
              color: "#1a1a2e",
              textAlign: "center",
              margin: 0,
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Quality Online Tutoring for
            <br />
            African Children Worldwide
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              color: "#64748b",
              textAlign: "center",
              margin: 0,
              marginBottom: 32,
            }}
          >
            Expert tutors for ages 3-16 • UK, US, Canada & Beyond
          </p>

          {/* Features Row */}
          <div
            style={{
              display: "flex",
              gap: 40,
              alignItems: "center",
            }}
          >
            {[
              { emoji: "🎓", text: "Expert Tutors" },
              { emoji: "🌍", text: "African Languages" },
              { emoji: "📐", text: "Maths & Science" },
              { emoji: "🎹", text: "Music & Coding" },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: "#374151" }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 32,
              padding: "16px 40px",
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              borderRadius: 50,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
              Book Your FREE Trial Today! 🚀
            </span>
          </div>
        </div>

        {/* Website URL */}
        <p
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 20,
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
