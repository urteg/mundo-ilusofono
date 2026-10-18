import { Cena, type PropsCena } from "./Cena";

/** Barco no mar num dia de sol. */
export function CenaMar(props: PropsCena) {
  return (
    <Cena {...props}>
      <rect width="320" height="180" fill="#DCEBFA" />
      <circle cx="250" cy="48" r="22" fill="#E3BA14" />
      <path d="M0 100 Q40 92 80 100 T160 100 T240 100 T320 100 V180 H0 Z" fill="#0984E3" />
      <path
        d="M0 122 Q40 114 80 122 T160 122 T240 122 T320 122 V180 H0 Z"
        fill="#0A3D62"
        opacity="0.35"
      />
      <path d="M96 96 h64 l-10 14 h-44 z" fill="#FF6B35" />
      <path d="M128 96 V52 l26 40 z" fill="#FDFAF4" />
      <path d="M126 96 V48" stroke="#1E272E" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M20 142 q12 -6 24 0 M200 150 q12 -6 24 0 M260 134 q12 -6 24 0"
        stroke="#FDFAF4"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </Cena>
  );
}
