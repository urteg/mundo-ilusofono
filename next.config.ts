import type { NextConfig } from "next";

// PREVIA=1 gera uma cópia estática em out/ para visualização (ver scripts/previa.mjs).
const previa = process.env.PREVIA === "1";

const nextConfig: NextConfig = previa
  ? { output: "export", images: { unoptimized: true }, trailingSlash: false }
  : {};

export default nextConfig;
