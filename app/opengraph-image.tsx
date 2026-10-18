import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.nome}: ${site.lema}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagemOg() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0A3D62",
        color: "#FFFFFF",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="72" height="64" viewBox="0 0 40 36">
          <path
            d="M0 14 A14 14 0 0 1 14 0 H26 A14 14 0 0 1 40 14 V22 A14 14 0 0 1 26 36 H4 A4 4 0 0 1 0 32 Z"
            fill="#0984E3"
          />
        </svg>
        <span style={{ fontSize: 44, fontWeight: 700 }}>{site.nome}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
          Entenda português de verdade.
        </span>
        <span style={{ fontSize: 76, fontWeight: 700, color: "#E3BA14" }}>Vivendo.</span>
      </div>
      <span style={{ fontSize: 34, color: "#DCEBFA" }}>{site.lema}</span>
    </div>,
    size,
  );
}
