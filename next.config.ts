import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// PREVIA=1 gera uma cópia estática em out/ para visualização (ver scripts/previa.mjs).
const previa = process.env.PREVIA === "1";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Na prévia as partes com login ficam fora do build; tipos e lint já são checados no build normal.
  ...(previa
    ? {
        output: "export",
        images: { unoptimized: true },
        trailingSlash: false,
        typescript: { ignoreBuildErrors: true },
        eslint: { ignoreDuringBuilds: true },
      }
    : {}),
};

export default createMDX({})(nextConfig);
