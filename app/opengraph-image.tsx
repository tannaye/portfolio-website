import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}: Senior Software Engineer, AI Engineer & Creator`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/photo-1.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0a0a", color: "#f5f5f0" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: -0.5 }}>
            tannaye<span style={{ color: "#d4f34a" }}>.</span>dev
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 0.9, letterSpacing: -5 }}>Victor</div>
            <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 0.9, letterSpacing: -5 }}>Iwatannaye</div>
            <div style={{ marginTop: 32, fontSize: 30, color: "#a3a39c" }}>Software Engineer · AI Engineer · Creator</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: "#a3a39c" }}>
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#d4f34a" }} />
            {site.tagline}
          </div>
        </div>
        <div style={{ width: 430, height: "100%", display: "flex", padding: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" width={366} height={566} style={{ objectFit: "cover", borderRadius: 28, width: 366, height: 566 }} />
        </div>
      </div>
    ),
    size,
  );
}
