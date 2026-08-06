import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Indemnisation pour vol retardé ou annulé";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Vignette des liens partagés vers une page de vol.
 *
 * Le partage entre passagers du même vol est notre seul canal gratuit, et
 * un lien sans vignette se fait ignorer dans une conversation de groupe.
 * La vignette porte le numéro de vol : le destinataire reconnaît le sien
 * d'un coup d'œil, ce qu'aucune image générique ne permet.
 */
export default async function Image({
  params,
}: {
  params: { numeroVol: string };
}) {
  const numeroVol = decodeURIComponent(params.numeroVol).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fdf9f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="10 14.5 76 76" fill="none">
            <path
              d="M28 80 C13 71 17 49 34 48 C48 47 51 62 39 65 L81 25 L61 75"
              stroke="#c93f26"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#241e1a" }}>
            Clearto
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: "#241e1a",
            marginTop: 56,
            lineHeight: 1.1,
          }}
        >
          Vol {numeroVol} perturbé ?
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            color: "#c93f26",
            marginTop: 12,
          }}
        >
          Jusqu&apos;à 600 € par passager.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#6b6259",
            marginTop: 40,
          }}
        >
          Vérification en une minute, sans créer de compte.
        </div>
      </div>
    ),
    size
  );
}
