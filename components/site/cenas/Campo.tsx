import { Cena, type PropsCena } from "./Cena";

/** Casa no campo. */
export function CenaCampo(props: PropsCena) {
  return (
    <Cena {...props}>
      <rect width="320" height="180" fill="#FFF4CC" />
      <circle cx="64" cy="44" r="18" fill="#FF6B35" />
      <path d="M0 120 Q80 80 170 112 T320 100 V180 H0 Z" fill="#00B894" />
      <path d="M0 146 Q100 118 200 140 T320 136 V180 H0 Z" fill="#0A3D62" opacity="0.25" />
      <path
        d="M188 104 h60 v-34 l-30 -24 l-30 24 z"
        fill="#FDFAF4"
        stroke="#1E272E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M180 72 l38 -32 l38 32"
        fill="none"
        stroke="#C2410C"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="210" y="80" width="16" height="24" fill="#0984E3" />
      <path
        d="M60 128 v-22 M54 112 l6 -8 l6 8 M100 122 v-18 M95 110 l5 -7 l5 7"
        stroke="#0A3D62"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Cena>
  );
}
