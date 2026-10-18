import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/app/", "/api/", "/_ui"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
