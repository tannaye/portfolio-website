import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: 16,
          color: "#f5f5f0",
          fontSize: 44,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        t<span style={{ color: "#d4f34a" }}>.</span>
      </div>
    ),
    size,
  );
}
