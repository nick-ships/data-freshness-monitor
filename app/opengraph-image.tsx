import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Data Freshness Monitor — Australian Government Open Data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#F7F4EF",
          color: "#1A1814",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#C8401A",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#C8401A",
            }}
          />
          Australian Government Open Data
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 132,
              lineHeight: 1.02,
              fontFamily: "serif",
              fontWeight: 500,
              letterSpacing: -2,
              color: "#1A1814",
            }}
          >
            Data Freshness
            <br />
            Monitor
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              maxWidth: 900,
              color: "rgba(26, 24, 20, 0.7)",
            }}
          >
            A live look at when key Australian government datasets were last
            updated — and whether they&rsquo;re keeping to their stated
            cadence.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "rgba(26, 24, 20, 0.55)",
            borderTop: "1px solid rgba(26, 24, 20, 0.15)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#059669",
                }}
              />
              Fresh
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#F59E0B",
                }}
              />
              Aging
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: "#C8401A",
                }}
              />
              Stale
            </span>
          </div>
          <div>Built by Nick Tierney</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
